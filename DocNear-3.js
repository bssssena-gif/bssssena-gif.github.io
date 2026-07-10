/* ════════════════════════════════════════════
   BLOOD BANK
════════════════════════════════════════════ */
function rBloodBank(){
  if(!A.user||A.role!=="patient"){go("patientLogin");return;}
  // Pre-fill blood group from patient profile
  const bg=$("bb-blood-group");
  if(bg&&A.user.blood_group)bg.value=A.user.blood_group;
}

async function registerDonor(){
  if(!A.user){toast("Login required",true);return;}
  const bg=$("bb-blood-group")?.value;
  const dist=$("bb-district")?.value;
  if(!bg||!dist){toast("Blood group & district required",true);return;}
  const lastDonated=$("bb-last-donated")?.value||null;
  try{
    // Check if already registered
    const existing=await dbq("blood_donors?patient_id=eq."+A.user.id);
    if(existing.length){
      await DB.patch("blood_donors","patient_id=eq."+A.user.id,{
        blood_group:bg,district:dist,last_donated:lastDonated,is_available:true
      });
      toast("Donor profile updated! ✅");
    }else{
      await DB.post("blood_donors",{
        patient_id:A.user.id,
        name:A.user.name,
        phone:A.user.phone,
        blood_group:bg,
        district:dist,
        last_donated:lastDonated,
        is_available:true
      });
      toast("Registered as blood donor! 🩸 Thank you!");
    }
    searchDonors();
  }catch(e){toast(e.message,true);}
}

async function searchDonors(){
  if(!A.user||A.role!=="patient"){
    const res=$("bb-results");
    if(res)res.innerHTML=`<div style="text-align:center;padding:30px;background:#FFF5F5;border-radius:12px;border:1px solid #FED7D7">
      <div style="font-size:36px;margin-bottom:8px">🔒</div>
      <div style="font-weight:700;color:#DC2626;margin-bottom:6px">Login Required</div>
      <div style="font-size:13px;color:#6B7280;margin-bottom:12px">Donor details చూడటానికి login చేయండి</div>
      <button class="btn btn-primary btn-sm" onclick="go('patientLogin')" style="background:#DC2626">Login చేయండి</button>
    </div>`;
    return;
  }
  const bg=$("bb-search-bg")?.value;
  const dist=$("bb-search-dist")?.value;
  const res=$("bb-results");if(!res)return;
  spin("bb-results","Finding donors...");
  try{
    let q="is_available=eq.true&order=id.desc";
    if(bg)q+="&blood_group=eq."+encodeURIComponent(bg);
    if(dist)q+="&district=eq."+encodeURIComponent(dist);
    const donors=await dbq("blood_donors?"+q);
    if(!donors.length){
      res.innerHTML=`<div style="text-align:center;padding:30px;color:#9CA3AF">
        <div style="font-size:40px;margin-bottom:8px">🩸</div>
        <div>No donors found for this filter.</div>
      </div>`;return;
    }
    res.innerHTML=donors.map(d=>`
      <div class="appt-card" style="border-left:4px solid #DC2626;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
          <div>
            <div style="font-size:14px;font-weight:700;color:#1A2B3C">${safe(d.name)}</div>
            <div style="font-size:12px;color:#6B7280">📍 ${safe(d.district)}</div>
            ${d.last_donated?`<div style="font-size:11px;color:#9CA3AF">Last donated: ${d.last_donated}</div>`:""}
          </div>
          <div style="text-align:center">
            <div style="background:#DC2626;color:#fff;border-radius:8px;padding:6px 14px;font-size:18px;font-weight:800">${safe(d.blood_group)}</div>
          </div>
        </div>
        ${d.phone?`<button class="btn btn-primary btn-sm" style="margin-top:10px;width:100%;background:#DC2626" onclick="callWithLogin('${safe(d.phone)}')">📞 Contact Donor</button>`:""}
      </div>`).join("");
  }catch(e){res.innerHTML=`<div style="color:#DC2626;padding:16px">Error: ${e.message}</div>`;}
}

/* ════════════════════════════════════════════
   AI SYMPTOM CHECKER
════════════════════════════════════════════ */
function rAiSymptom(){
  // Reset chat to initial state when page opens
  const chat=$("ai-chat");
  if(chat&&chat.children.length<=1){
    // Already at initial state
  }
}

function quickSymptom(text){
  const inp=$("ai-input");
  if(inp)inp.value=text;
  sendSymptom();
}

async function sendSymptom(){
  const inp=$("ai-input");
  const text=inp?.value?.trim();
  if(!text){toast("Symptoms type చేయండి",true);return;}
  const chat=$("ai-chat");if(!chat)return;
  const btn=$("ai-send-btn");if(btn){btn.disabled=true;btn.textContent="...";}

  // User message bubble add
  chat.innerHTML+=`<div style="background:#0A7FAF;color:#fff;border-radius:10px;padding:12px;font-size:13px;align-self:flex-end;max-width:85%">${safe(text)}</div>`;

  // Loading bubble
  const loadId="ai-loading-"+Date.now();
  chat.innerHTML+=`<div id="${loadId}" style="background:#E3F4FC;border-radius:10px;padding:12px;font-size:13px;color:#1A2B3C;align-self:flex-start;max-width:85%">🤔 Analyzing symptoms...</div>`;
  chat.scrollTop=chat.scrollHeight;
  if(inp)inp.value="";

  try{
    const response=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-6",
        max_tokens:600,
        system:`You are a helpful medical AI assistant for DocNear, a healthcare app in Andhra Pradesh and Telangana, India.
The user will describe their symptoms in Telugu or English.
Respond in the same language the user used.
Give:
1. Possible cause (brief, simple language)
2. Which specialist to consult (e.g., General Physician, Cardiologist, etc.)
3. Urgency level: 🟢 Not urgent / 🟡 See doctor soon / 🔴 Emergency - go now
4. One simple home remedy or precaution if safe

IMPORTANT: Always end with "ఇది AI suggestion మాత్రమే. Proper diagnosis కోసం doctor ను కలవండి." or in English "This is AI suggestion only. Please consult a doctor for proper diagnosis."
Keep response under 150 words. Do not diagnose. Be compassionate.`,
        messages:[{role:"user",content:text}]
      })
    });
    const data=await response.json();
    const reply=data.content?.[0]?.text||"Sorry, response రాలేదు. దయచేసి మళ్ళీ try చేయండి.";
    const loadEl=$(loadId);
    if(loadEl)loadEl.innerHTML=reply.replace(/\n/g,"<br>");
  }catch(e){
    const loadEl=$(loadId);
    if(loadEl)loadEl.innerHTML="❌ Error: "+e.message+". దయచేసి మళ్ళీ try చేయండి.";
  }finally{
    if(btn){btn.disabled=false;btn.textContent="Send";}
    if(chat)chat.scrollTop=chat.scrollHeight;
  }
}

/* ════════════════════════════════════════════
   HEALTH DASHBOARD
════════════════════════════════════════════ */
let hdCharts={bp:null,sugar:null};

function rHealthDash(){
  if(!A.user||A.role!=="patient"){go("patientLogin");return;}
  loadVitalsHistory();
}

async function saveVitals(){
  if(!A.user){toast("Login required",true);return;}
  const sys=parseInt($("hd-bp-sys")?.value)||null;
  const dia=parseInt($("hd-bp-dia")?.value)||null;
  const sf=parseInt($("hd-sugar-f")?.value)||null;
  const spp=parseInt($("hd-sugar-pp")?.value)||null;
  const wt=parseFloat($("hd-weight")?.value)||null;
  const spo2=parseInt($("hd-spo2")?.value)||null;
  if(!sys&&!dia&&!sf&&!spp&&!wt&&!spo2){toast("కనీసం ఒక value enter చేయండి",true);return;}
  try{
    await DB.post("health_vitals",{
      patient_id:A.user.id,
      bp_systolic:sys,bp_diastolic:dia,
      sugar_fasting:sf,sugar_pp:spp,
      weight:wt,spo2:spo2,
      recorded_at:new Date().toISOString()
    });
    toast("Vitals saved! ✅");
    ["hd-bp-sys","hd-bp-dia","hd-sugar-f","hd-sugar-pp","hd-weight","hd-spo2"].forEach(id=>{const el=$(id);if(el)el.value="";});
    loadVitalsHistory();
  }catch(e){toast(e.message,true);}
}

async function loadVitalsHistory(){
  if(!A.user)return;
  try{
    const vitals=await DB.get("health_vitals","patient_id=eq."+A.user.id+"&order=recorded_at.desc&limit=30");
    renderVitalsCharts(vitals);
    renderVitalsTable(vitals);
  }catch(e){console.warn("Vitals load error",e);}
}

function renderVitalsCharts(vitals){
  const reversed=[...vitals].reverse();
  const labels=reversed.map(v=>v.recorded_at?.split("T")[0]||"");

  // BP Chart
  const bpCtx=$("bp-chart");
  if(bpCtx){
    if(hdCharts.bp){hdCharts.bp.destroy();}
    hdCharts.bp=new Chart(bpCtx,{
      type:"line",
      data:{
        labels,
        datasets:[
          {label:"Systolic",data:reversed.map(v=>v.bp_systolic),borderColor:"#DC2626",backgroundColor:"rgba(220,38,38,0.08)",tension:0.3,pointRadius:4},
          {label:"Diastolic",data:reversed.map(v=>v.bp_diastolic),borderColor:"#0A7FAF",backgroundColor:"rgba(10,127,175,0.08)",tension:0.3,pointRadius:4}
        ]
      },
      options:{responsive:true,plugins:{legend:{position:"top"}},scales:{y:{min:40,max:200}}}
    });
  }

  // Sugar Chart
  const sgCtx=$("sugar-chart");
  if(sgCtx){
    if(hdCharts.sugar){hdCharts.sugar.destroy();}
    hdCharts.sugar=new Chart(sgCtx,{
      type:"line",
      data:{
        labels,
        datasets:[
          {label:"Fasting",data:reversed.map(v=>v.sugar_fasting),borderColor:"#D97706",backgroundColor:"rgba(217,119,6,0.08)",tension:0.3,pointRadius:4},
          {label:"Post-Prandial",data:reversed.map(v=>v.sugar_pp),borderColor:"#059669",backgroundColor:"rgba(5,150,105,0.08)",tension:0.3,pointRadius:4}
        ]
      },
      options:{responsive:true,plugins:{legend:{position:"top"}},scales:{y:{min:40,max:400}}}
    });
  }
}

function renderVitalsTable(vitals){
  const el=$("hd-history");if(!el)return;
  if(!vitals.length){el.innerHTML=`<div style="text-align:center;padding:20px;color:#9CA3AF">No vitals logged yet.</div>`;return;}
  el.innerHTML=`<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">
    <thead><tr style="background:#F3F4F6">
      <th style="padding:8px;text-align:left">Date</th>
      <th style="padding:8px">BP</th>
      <th style="padding:8px">Sugar F</th>
      <th style="padding:8px">Sugar PP</th>
      <th style="padding:8px">Wt(kg)</th>
      <th style="padding:8px">SpO₂</th>
      <th style="padding:8px"></th>
    </tr></thead>
    <tbody>${vitals.map(v=>`<tr style="border-bottom:1px solid #F3F4F6">
      <td style="padding:8px;color:#6B7280">${v.recorded_at?.split("T")[0]||"—"}</td>
      <td style="padding:8px;text-align:center">${v.bp_systolic&&v.bp_diastolic?`<span style="color:#DC2626;font-weight:600">${v.bp_systolic}/${v.bp_diastolic}</span>`:"—"}</td>
      <td style="padding:8px;text-align:center">${v.sugar_fasting||"—"}</td>
      <td style="padding:8px;text-align:center">${v.sugar_pp||"—"}</td>
      <td style="padding:8px;text-align:center">${v.weight||"—"}</td>
      <td style="padding:8px;text-align:center">${v.spo2?v.spo2+"%":"—"}</td>
      <td style="padding:8px;text-align:center"><button onclick="deleteVital('${v.id}')" style="background:none;border:none;cursor:pointer;color:#9CA3AF;font-size:14px"> 🗑️ Delete</button></td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}

async function deleteVital(id){
  if(!confirm("Delete this entry?"))return;
  try{
    await DB.del("health_vitals","id=eq."+id);
    toast("Deleted.");
    loadVitalsHistory();
  }catch(e){toast(e.message,true);}
}


/* ════════════════════════════════════════════
   HOME NURSING & PHYSIOTHERAPY
════════════════════════════════════════════ */
function rHomeServices(){
  if(!A.user||A.role!=="patient"){go("patientLogin");return;}
  // Pre-fill patient info
  const nameEl=$("hs-name");const phoneEl=$("hs-phone");
  if(nameEl&&A.user.name)nameEl.value=A.user.name;
  if(phoneEl&&A.user.phone)phoneEl.value=A.user.phone;
  // Set min date to today
  const dateEl=$("hs-date");
  if(dateEl)dateEl.min=new Date().toISOString().split("T")[0];
  // Hide booking form initially — force hide
  const bookingForm=$("hs-booking-form");
  if(bookingForm){bookingForm.style.display="none";bookingForm.style.setProperty("display","none","important");}
  const sel=$("hs-selected-provider");if(sel){sel.style.display="none";sel.innerHTML="";}
  // Reset filter to nursing
  filterHSProviders("nursing");
  loadMyHomeServices();
}

async function loadHomeProviders(){
  const el=$("hs-providers-list");if(!el)return;
  const type=$("hs-service-type")?.value||"nursing";
  const district=$("hs-filter-district")?.value||$("hs-district")?.value||null;
  spin("hs-providers-list","Loading providers...");
  try{
    let q="approved=eq.true&is_available=eq.true";
    if(type!=="both")q+="&service_type=in.("+encodeURIComponent(type+",both")+")";
    if(district)q+="&district=eq."+encodeURIComponent(district);
    q+="&order=created_at.desc";
    const providers=await dbq("home_providers?"+q);
    if(!providers.length){
      el.innerHTML=`<div style="text-align:center;padding:20px;background:#F8FAFC;border-radius:12px;color:#9CA3AF">
        <div style="font-size:32px;margin-bottom:6px">😔</div>
        <div>${district?safe(district)+" జిల్లాలో":""} ప్రస్తుతం providers అందుబాటులో లేరు.</div>
        ${district?`<div style="font-size:12px;margin-top:6px">వేరే district try చేయండి.</div>`:""}
      </div>`;return;
    }
    el.innerHTML=providers.map(p=>hpCard(p)).join("");
  }catch(e){el.innerHTML=`<div style="color:#DC2626;padding:12px">Error: ${e.message}</div>`;}
}

function hpCard(p){
  const typeLabel=p.service_type==="nursing"?"👩‍⚕️ Home Nursing":p.service_type==="physiotherapy"?"🦽 Physiotherapy":"👩‍⚕️🦽 Nursing & Physio";
  const typeColor=p.service_type==="nursing"?"#0891B2":p.service_type==="physiotherapy"?"#059669":"#7C4DFF";
  return `<div class="card" style="margin-bottom:12px">
    <div style="display:flex;gap:12px;margin-bottom:12px">
      ${avt(p.name,typeColor,54,p.photo_url||"")}
      <div style="flex:1;min-width:0">
        <div class="doc-name">${safe(p.name)}</div>
        <div class="doc-spec" style="color:${typeColor}">${typeLabel}</div>
        <div class="doc-meta">🎓 ${safe(p.qualification)}</div>
        <div style="display:flex;gap:6px;margin-top:3px;flex-wrap:wrap;align-items:center">
          ${p.district?`<span style="font-size:10px;color:#9CA3AF">📍 ${p.district}</span>`:""}
          <span style="font-size:10px;font-weight:600;color:#059669">🟢 Available</span>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:13px;font-weight:700;color:#059669">${p.fee?"₹"+p.fee+"/visit":"Free"}</div>
        <div style="font-size:10px;color:#9CA3AF">${p.experience||0} yrs exp</div>
      </div>
    </div>
    ${p.about?`<div style="font-size:12px;color:#6B7280;margin-bottom:10px">${safe(p.about).slice(0,100)}${p.about.length>100?"...":""}</div>`:""}
    <div style="display:flex;gap:8px">
      <button class="btn btn-outline btn-sm" onclick="shareProfile('homeprovider','${p.id}','${safe(p.name)}','${safe(p.service_type)}','${safe(p.district||'')}')" title="Share">📤 Share</button>
      <button class="btn btn-primary" style="flex:1" onclick="A.user&&A.role==='patient'?selectHSProvider('${p.id}','${safe(p.name)}','${safe(p.service_type)}'):requireLogin('homeServices')">📅 Book</button>
    </div>
  </div>`;
}

function selectHSProvider(id,name,type){
  // Set service type
  const typeEl=$("hs-service-type");
  if(typeEl&&type&&type!=="both"){typeEl.value=type;selectHSTab(type);}

  // Show selected provider banner
  const sel=$("hs-selected-provider");
  if(sel){
    sel.style.display="block";
    sel.innerHTML=`<div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:12px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="font-size:28px">${type==="nursing"?"👩‍⚕️":"🦽"}</div>
        <div>
          <div style="font-weight:700;color:#1A2B3C">${name}</div>
          <div style="font-size:12px;color:#0891B2">✅ Provider Selected</div>
        </div>
      </div>
      <button onclick="clearHSProvider()" style="background:none;border:none;color:#9CA3AF;font-size:18px;cursor:pointer">✕</button>
    </div>`;
  }

  // Store provider id
  let inp=$("hs-provider-id");
  if(!inp){
    inp=document.createElement("input");inp.type="hidden";inp.id="hs-provider-id";
    const form=$("hs-booking-form");if(form)form.appendChild(inp);
  }
  inp.value=id;

  // Show booking form
  const bookingForm=$("hs-booking-form");
  if(bookingForm){
    bookingForm.style.display="block";
    bookingForm.scrollIntoView({behavior:"smooth",block:"start"});
  }
  toast(name+" selected! ✅ ఇప్పుడు details fill చేయండి.");
}

function clearHSProvider(){
  const sel=$("hs-selected-provider");if(sel)sel.style.display="none";
  const bookingForm=$("hs-booking-form");if(bookingForm)bookingForm.style.display="none";
  const inp=$("hs-provider-id");if(inp)inp.value="";
}

function filterHSProviders(type){
  ["nursing","physio","both"].forEach(t=>{
    const btn=$("hsp-"+t);
    if(btn){btn.style.background=t===type?"#0891B2":"";btn.style.color=t===type?"#fff":"";}
  });
  const typeEl=$("hs-service-type");if(typeEl)typeEl.value=type==="both"?"nursing":type;
  loadHomeProviders();
}

function selectHSTab(type){
  $("hs-service-type").value=type;
  const nursing=$("hs-tab-nursing");
  const physio=$("hs-tab-physio");
  if(type==="nursing"){
    if(nursing){nursing.style.borderColor="#3B82F6";nursing.style.background="#EFF6FF";}
    if(physio){physio.style.borderColor="#E5E7EB";physio.style.background="#F0FDF4";}
  }else{
    if(physio){physio.style.borderColor="#059669";physio.style.background="#DCFCE7";}
    if(nursing){nursing.style.borderColor="#E5E7EB";nursing.style.background="#EFF6FF";}
  }
}

async function bookHomeService(){
  if(!A.user){toast("Login required",true);return;}
  const type=$("hs-service-type")?.value;
  const name=$("hs-name")?.value?.trim();
  const phone=$("hs-phone")?.value?.trim();
  const address=$("hs-address")?.value?.trim();
  const district=$("hs-district")?.value;
  const date=$("hs-date")?.value;
  const time=$("hs-time")?.value||"Any Time";
  const notes=$("hs-notes")?.value?.trim()||null;

  if(!name||!phone||!address||!district||!date){
    toast("అన్ని required fields fill చేయండి",true);return;
  }

  const btn=$("hs-book-btn");
  if(btn){btn.disabled=true;btn.textContent="Booking...";}

  try{
    const providerId=$("hs-provider-id")?.value||null;
    await DB.post("home_services",{
      patient_id:A.user.id,
      provider_id:providerId||null,
      service_type:type,
      patient_name:name,
      phone:phone,
      address:address,
      district:district,
      preferred_date:date,
      preferred_time:time,
      notes:notes,
      status:"pending"
    });
    toast((type==="nursing"?"👩‍⚕️ Home Nursing":"🦽 Physiotherapy")+" booking confirmed! మేము త్వరలో contact చేస్తాము. ✅");
    // Clear form
    ["hs-name","hs-phone","hs-address","hs-notes"].forEach(id=>{const el=$(id);if(el)el.value="";});
    $("hs-district").value="";$("hs-date").value="";$("hs-time").value="";
    loadMyHomeServices();
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="📅 Book Home Service";}}
}

async function loadMyHomeServices(){
  const el=$("hs-my-bookings");if(!el||!A.user)return;
  try{
    const bookings=await dbq("home_services?patient_id=eq."+A.user.id+"&order=created_at.desc");
    if(!bookings.length){
      el.innerHTML=`<div style="text-align:center;padding:20px;color:#9CA3AF">
        <div style="font-size:32px;margin-bottom:6px">🏠</div>
        <div>No bookings yet.</div>
      </div>`;return;
    }
    const statusColor={pending:"#D97706",confirmed:"#059669",completed:"#6B7280",cancelled:"#DC2626"};
    const statusBg={pending:"#FEF3C7",confirmed:"#D1FAE5",completed:"#F3F4F6",cancelled:"#FEE2E2"};
    el.innerHTML=bookings.map(b=>`
      <div class="appt-card" style="border-left:4px solid ${statusColor[b.status]||"#6B7280"};margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px">
          <div>
            <div style="font-size:14px;font-weight:700;color:#1A2B3C">${b.service_type==="nursing"?"👩‍⚕️ Home Nursing":"🦽 Physiotherapy"}</div>
            <div style="font-size:12px;color:#6B7280;margin-top:2px">📅 ${b.preferred_date} ${b.preferred_time?"· "+b.preferred_time:""}</div>
            <div style="font-size:12px;color:#6B7280">📍 ${safe(b.district)}</div>
            ${b.notes?`<div style="font-size:11px;color:#9CA3AF;margin-top:4px">${safe(b.notes)}</div>`:""}
          </div>
          <span style="background:${statusBg[b.status]||"#F3F4F6"};color:${statusColor[b.status]||"#6B7280"};border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600;white-space:nowrap">${(b.status||"pending").toUpperCase()}</span>
        </div>
        ${b.status==="pending"?`<div style="margin-top:10px"><button class="btn btn-red btn-sm" style="width:100%" onclick="cancelHomeService('${b.id}')">❌ Cancel</button></div>`:""}
        ${b.status==="cancelled"?`<button style="margin-top:8px;width:100%;padding:5px;background:none;border:1px solid #E5E7EB;border-radius:8px;color:#9CA3AF;font-size:11px;cursor:pointer" onclick="deleteHomeService('${b.id}')">🗑️ Delete</button>`:""}
      </div>`).join("");
  }catch(e){el.innerHTML=`<div style="color:#DC2626;padding:12px">Error: ${e.message}</div>`;}
}

async function cancelHomeService(id){
  if(!confirm("Cancel this booking?"))return;
  try{
    await DB.patch("home_services","id=eq."+id,{status:"cancelled"});
    toast("Booking cancelled.");
    loadMyHomeServices();
  }catch(e){toast(e.message,true);}
}

async function deleteHomeService(id){
  if(!confirm("Delete this record permanently?"))return;
  try{
    await DB.del("home_services","id=eq."+id);
    toast("Deleted.");
    loadMyHomeServices();
  }catch(e){toast(e.message,true);}
}


/* ════════════════════════════════════════════
   HOME CARE PROVIDER — AUTH & DASHBOARD
════════════════════════════════════════════ */
async function hpLogin(){
  const email=gv("hpl-email"),pw=gv("hpl-pw");
  if(!email||!pw){toast("Email & password required.",true);return;}
  const btn=$("hpl-btn");if(btn){btn.disabled=true;btn.textContent="Signing in...";}
  try{
    const hash=await sha(pw);
    const rows=await safeGet("home_providers","email=eq."+enc(email)+"&password_hash=eq."+enc(hash));
    if(!rows.length){toast("Invalid email or password.",true);return;}
    if(!rows[0].approved){toast("Account not yet approved by admin. 24-48 hrs లో approve అవుతుంది.",true);return;}
    A.user=rows[0];A.role="homeprovider";S.save(rows[0],"homeprovider");
    toast("Welcome, "+rows[0].name+"! 🏠");redirectRole("homeprovider");
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="Sign In";}}
}

async function hpRegister(){
  const f={
    name:gv("hpr-name"),email:gv("hpr-email"),pw:gv("hpr-pw"),
    phone:gv("hpr-phone"),type:gv("hpr-type"),exp:gv("hpr-exp"),
    qual:gv("hpr-qual"),district:gv("hpr-district"),
    fee:gv("hpr-fee"),about:gv("hpr-about")
  };
  if(!f.name||!f.email||!f.pw||!f.phone||!f.type||!f.exp||!f.qual||!f.district){
    toast("అన్ని required fields fill చేయండి.",true);return;
  }
  const btn=$("hpr-btn");if(btn){btn.disabled=true;btn.textContent="Submitting...";}
  try{
    const hash=await sha(f.pw);
    if(await emailExistsAnywhere(f.email)){toast("This email is already registered.",true);return;}
    await safePost("home_providers",{
      name:f.name,email:f.email,password_hash:hash,phone:f.phone,
      service_type:f.type,experience:parseInt(f.exp)||0,
      qualification:f.qual,district:f.district,
      fee:parseInt(f.fee)||0,about:f.about,
      approved:false,is_available:true
    });
    go("hpPending");toast("Registration submitted! Admin will verify within 24–48 hrs.");
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="Submit for Review";}}
}

let hpBookingsAll=[];
let hpCurrentFilter="all";

async function rHPDash(){
  if(!A.user||A.role!=="homeprovider"){go("hpLogin");return;}
  if(A.user.photo_url)setTimeout(()=>loadProviderPhoto(A.user.photo_url),300);
  // Welcome
  const wel=$("hp-welcome");const badge=$("hp-type-badge");
  if(wel)wel.textContent="Welcome, "+safe(A.user.name)+"!";
  if(badge){
    const t=A.user.service_type;
    badge.textContent=t==="nursing"?"👩‍⚕️ Home Nurse":t==="physiotherapy"?"🦽 Physiotherapist":"👩‍⚕️🦽 Nurse & Physio";
  }
  // Availability button
  const avBtn=$("hp-avail-btn");
  if(avBtn){
    avBtn.textContent=A.user.is_available?"🟢 Available":"🔴 Offline";
    avBtn.style.background=A.user.is_available?"rgba(255,255,255,.2)":"rgba(239,68,68,.4)";
  }
  await loadHPBookings();
}

async function loadHPBookings(){
  try{
    // Fetch bookings matching provider's district + service type
    let q="status=neq.cancelled";
    if(A.user.district)q+="&district=eq."+enc(A.user.district);
    if(A.user.service_type&&A.user.service_type!=="both")q+="&service_type=eq."+enc(A.user.service_type);
    q+="&order=created_at.desc";
    hpBookingsAll=await dbq("home_services?"+q);
    // Update stats
    const p=hpBookingsAll.filter(b=>b.status==="pending").length;
    const c=hpBookingsAll.filter(b=>b.status==="confirmed").length;
    const d=hpBookingsAll.filter(b=>b.status==="completed").length;
    const sp=$("hp-stat-pending");const sc=$("hp-stat-confirmed");const sd=$("hp-stat-completed");
    if(sp)sp.textContent=p;if(sc)sc.textContent=c;if(sd)sd.textContent=d;
    renderHPBookings();
  }catch(e){console.warn("HP bookings error",e);}
}

function filterHPBookings(filter){
  hpCurrentFilter=filter;
  ["all","pending","confirmed","completed"].forEach(f=>{
    const btn=$("hpf-"+f);
    if(btn){btn.style.background=f===filter?"#0891B2":"";btn.style.color=f===filter?"#fff":"";}
  });
  renderHPBookings();
}

function renderHPBookings(){
  const el=$("hp-bookings");if(!el)return;
  let bookings=hpBookingsAll;
  if(hpCurrentFilter!=="all")bookings=bookings.filter(b=>b.status===hpCurrentFilter);
  if(!bookings.length){
    el.innerHTML=`<div style="text-align:center;padding:30px;color:#9CA3AF">
      <div style="font-size:36px;margin-bottom:8px">📋</div>
      <div>${hpCurrentFilter==="all"?"No bookings yet.":"No "+hpCurrentFilter+" bookings."}</div>
    </div>`;return;
  }
  const statusColor={pending:"#D97706",confirmed:"#059669",completed:"#6B7280",cancelled:"#DC2626"};
  const statusBg={pending:"#FEF3C7",confirmed:"#D1FAE5",completed:"#F3F4F6",cancelled:"#FEE2E2"};
  el.innerHTML=bookings.map(b=>`
    <div class="appt-card" style="border-left:4px solid ${statusColor[b.status]||"#6B7280"};margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px">
        <div>
          <div style="font-size:14px;font-weight:700;color:#1A2B3C">${b.service_type==="nursing"?"👩‍⚕️ Nursing":"🦽 Physiotherapy"}</div>
          <div style="font-size:13px;font-weight:600;color:#374151;margin-top:2px">${safe(b.patient_name)}</div>
          <div style="font-size:12px;color:#6B7280">📞 <button onclick="callWithLogin('${safe(b.phone)}')" style="background:none;border:none;color:#0891B2;cursor:pointer">${safe(b.phone)}</button></div>
          <div style="font-size:12px;color:#6B7280;margin-top:2px">📍 ${safe(b.address)}, ${safe(b.district)}</div>
          <div style="font-size:12px;color:#6B7280">📅 ${b.preferred_date} ${b.preferred_time?"· "+b.preferred_time:""}</div>
          ${b.notes?`<div style="font-size:11px;color:#9CA3AF;margin-top:4px">📝 ${safe(b.notes)}</div>`:""}
        </div>
        <span style="background:${statusBg[b.status]||"#F3F4F6"};color:${statusColor[b.status]||"#6B7280"};border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600;white-space:nowrap">${(b.status||"pending").toUpperCase()}</span>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
        ${b.status==="pending"?`<button onclick="hpUpdateBooking('${b.id}','confirmed')" class="btn btn-sm" style="background:#D1FAE5;color:#059669;border:none;padding:6px 14px;border-radius:8px;cursor:pointer;font-weight:600">✅ Accept</button>`:""}
        ${b.status==="confirmed"?`<button onclick="hpUpdateBooking('${b.id}','completed')" class="btn btn-sm" style="background:#EFF6FF;color:#0891B2;border:none;padding:6px 14px;border-radius:8px;cursor:pointer;font-weight:600">✔ Complete</button>`:""}
        ${(b.status==="pending"||b.status==="confirmed")?`<button onclick="hpUpdateBooking('${b.id}','cancelled')" class="btn btn-sm btn-red" style="padding:6px 14px">❌ Decline</button>`:""}
      </div>
    </div>`).join("");
}

async function hpUpdateBooking(id,status){
  try{
    await DB.patch("home_services","id=eq."+id,{status});
    hpBookingsAll=hpBookingsAll.map(b=>b.id===id?{...b,status}:b);
    toast(status==="confirmed"?"Booking Accepted! ✅":status==="completed"?"Marked as Completed! ✅":"Booking Declined.");
    renderHPBookings();
    // Update stats
    const p=hpBookingsAll.filter(b=>b.status==="pending").length;
    const c=hpBookingsAll.filter(b=>b.status==="confirmed").length;
    const d=hpBookingsAll.filter(b=>b.status==="completed").length;
    const sp=$("hp-stat-pending");const sc=$("hp-stat-confirmed");const sd=$("hp-stat-completed");
    if(sp)sp.textContent=p;if(sc)sc.textContent=c;if(sd)sd.textContent=d;
  }catch(e){toast(e.message,true);}
}

async function toggleHPAvail(){
  if(!A.user)return;
  const next=!A.user.is_available;
  try{
    await DB.patch("home_providers","id=eq."+A.user.id,{is_available:next});
    A.user.is_available=next;
    S.save(A.user,"homeprovider");
    const avBtn=$("hp-avail-btn");
    if(avBtn){avBtn.textContent=next?"🟢 Available":"🔴 Offline";avBtn.style.background=next?"rgba(255,255,255,.2)":"rgba(239,68,68,.4)";}
    toast(next?"You are now Available 🟢":"You are now Offline 🔴");
  }catch(e){toast(e.message,true);}
}


/* ════════════════════════════════════════════
   HOSPITAL AUTH & DASHBOARD
════════════════════════════════════════════ */
async function hospitalLogin(){
  const email=gv("hosl-email"),pw=gv("hosl-pw");
  if(!email||!pw){toast("Email & password required.",true);return;}
  const btn=$("hosl-btn");if(btn){btn.disabled=true;btn.textContent="Signing in...";}
  try{
    const hash=await sha(pw);
    const rows=await safeGet("hospitals","email=eq."+enc(email)+"&password_hash=eq."+enc(hash));
    if(!rows.length){toast("Invalid email or password.",true);return;}
    if(!rows[0].approved){toast("Account not yet approved. 24-48 hrs లో approve అవుతుంది.",true);return;}
    A.user=rows[0];A.role="hospital";S.save(rows[0],"hospital");
    toast("Welcome, "+rows[0].name+"! 🏥");redirectRole("hospital");
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="Sign In";}}
}

async function hospitalRegister(){
  const f={
    name:gv("hosr-name"),email:gv("hosr-email"),pw:gv("hosr-pw"),
    phone:gv("hosr-phone"),type:gv("hosr-type"),district:gv("hosr-district"),
    address:gv("hosr-address"),depts:gv("hosr-depts"),about:gv("hosr-about"),
    beds:parseInt(gv("hosr-beds"))||0,
    bedsAvail:parseInt(gv("hosr-beds-avail"))||0,
    emergency:document.getElementById("hosr-emergency")?.checked||false
  };
  if(!f.name||!f.email||!f.pw||!f.phone||!f.type||!f.district||!f.address){
    toast("అన్ని required fields fill చేయండి.",true);return;
  }
  const btn=$("hosr-btn");if(btn){btn.disabled=true;btn.textContent="Submitting...";}
  try{
    const hash=await sha(f.pw);
    if(await emailExistsAnywhere(f.email)){toast("This email is already registered.",true);return;}
    await safePost("hospitals",{
      name:f.name,email:f.email,password_hash:hash,phone:f.phone,
      hospital_type:f.type,district:f.district,address:f.address,
      departments:f.depts,about:f.about,
      beds_total:f.beds,beds_available:f.bedsAvail,
      emergency_available:f.emergency,
      approved:false,is_active:true
    });
    go("hospitalPending");toast("Registration submitted! ✅");
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="Submit for Review";}}
}

async function rHospitalDash(){
  if(!A.user||A.role!=="hospital"){go("hospitalLogin");return;}
  if(A.user.photo_url)setTimeout(()=>loadProviderPhoto(A.user.photo_url),300);
  const nm=$("hos-name");if(nm)nm.textContent=safe(A.user.name);
  const badge=$("hos-type-badge");
  if(badge){
    const types={government:"🏛️ Government",private:"🏥 Private",clinic:"🏪 Clinic",multispecialty:"⭐ Multi-Specialty"};
    badge.textContent=(types[A.user.hospital_type]||"🏥 Hospital")+(A.user.emergency_available?" · 🚨 24×7 Emergency":"");
  }
  // Bed stats
  const tot=$("hos-stat-total"),av=$("hos-stat-avail"),oc=$("hos-stat-occupied");
  if(tot)tot.textContent=A.user.beds_total||0;
  if(av)av.textContent=A.user.beds_available||0;
  if(oc)oc.textContent=(A.user.beds_total||0)-(A.user.beds_available||0);
  // Pre-fill bed inputs
  const bt=$("hos-beds-total"),ba=$("hos-beds-avail");
  if(bt)bt.value=A.user.beds_total||0;
  if(ba)ba.value=A.user.beds_available||0;
  // Load my posts
  loadMyPosts("hospital");
}

async function updateHospitalBeds(){
  const total=parseInt($("hos-beds-total")?.value)||0;
  const avail=parseInt($("hos-beds-avail")?.value)||0;
  if(avail>total){toast("Available beds cannot exceed total beds!",true);return;}
  try{
    await DB.patch("hospitals","id=eq."+A.user.id,{beds_total:total,beds_available:avail});
    A.user.beds_total=total;A.user.beds_available=avail;
    S.save(A.user,"hospital");
    const tot=$("hos-stat-total"),av=$("hos-stat-avail"),oc=$("hos-stat-occupied");
    if(tot)tot.textContent=total;if(av)av.textContent=avail;if(oc)oc.textContent=total-avail;
    toast("Bed availability updated! ✅");
  }catch(e){toast(e.message,true);}
}

async function loadHospitals(){
  const el=$("hospitals-list")||$("landing-hospitals");if(!el)return;
  const dist=($("hosp-district-filter")||{}).value||"";
  const type=($("hosp-type-filter")||{}).value||"";
  spin(el.id||"hospitals-list","Loading hospitals...");
  try{
    let q="approved=eq.true&is_active=eq.true";
    if(dist)q+="&district=eq."+enc(dist);
    if(type)q+="&hospital_type=eq."+enc(type);
    q+="&order=created_at.desc";
    const hospitals=await dbq("hospitals?"+q);
    if(!hospitals.length){
      el.innerHTML=`<div style="text-align:center;padding:30px;color:#9CA3AF"><div style="font-size:40px;margin-bottom:8px">🏥</div><div>No hospitals found.</div></div>`;
      return;
    }
    const isLanding=el.id==="landing-hospitals";
    const list=isLanding?hospitals.slice(0,4):hospitals;
    el.innerHTML=list.map(h=>hospitalCard(h)).join("");
  }catch(e){el.innerHTML=`<div style="color:#DC2626;padding:12px">Error: ${e.message}</div>`;}
}

function hospitalCard(h){
  const typeLabel={government:"🏛️ Govt",private:"🏥 Private",clinic:"🏪 Clinic",multispecialty:"⭐ Multi-Specialty"};
  const availColor=h.beds_available>10?"#059669":h.beds_available>0?"#D97706":"#DC2626";
  return `<div class="card" style="margin-bottom:12px">
    <div style="display:flex;gap:12px;margin-bottom:10px">
      <div style="width:54px;height:54px;border-radius:12px;background:#DC2626;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">🏥</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:15px;font-weight:700;color:#1A2B3C">${safe(h.name)}</div>
        <div style="font-size:12px;color:#DC2626;font-weight:600">${typeLabel[h.hospital_type]||"🏥 Hospital"}</div>
        <div style="font-size:12px;color:#6B7280;margin-top:2px">📍 ${safe(h.district)}</div>
        ${h.emergency_available?`<span style="background:#FEF2F2;color:#DC2626;border-radius:20px;padding:2px 8px;font-size:10px;font-weight:700">🚨 24×7 Emergency</span>`:""}
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:13px;font-weight:700;color:${availColor}">${h.beds_available||0} beds</div>
        <div style="font-size:10px;color:#9CA3AF">available</div>
      </div>
    </div>
    ${h.departments?`<div style="font-size:11px;color:#6B7280;margin-bottom:8px">🏥 ${safe(h.departments).slice(0,80)}</div>`:""}
    <div style="display:flex;gap:8px">
      <button class="btn btn-outline btn-sm" onclick="shareProfile('hospital','${h.id}','${safe(h.name)}','${safe(h.hospital_type||'hospital')}','${safe(h.district||'')}')" title="Share">📤 Share</button>
      ${h.phone?`<button class="btn btn-primary btn-sm" style="background:#DC2626;flex:1" onclick="callWithLogin('${safe(h.phone)}')">📞 Call</button>`:""}
    </div>
  </div>`;
}

/* ════════════════════════════════════════════
   SOCIAL FEED
════════════════════════════════════════════ */
let feedCurrentType="all";
let feedCurrentFilter="all";

function rSocialFeed(){
  // Show post creator if logged in
  const creator=$("feed-create-post");
  if(creator){
    if(A.user&&A.role&&A.user.id){
      creator.style.display="block";
      const av=$("feed-post-avatar");
      const uName=A.user.name||A.user.store_name||A.user.operator_name||A.user.lab_name||"";
      if(av&&uName)av.textContent=uName.charAt(0).toUpperCase();
    }else{
      creator.style.display="none";
    }
  }
  loadFeed();
}

function setPostType(type){
  feedCurrentType=type;
  ["tip","awareness","news"].forEach(t=>{
    const btn=$("pt-"+t);
    if(btn){btn.style.background=t===type?"#7C4DFF":"";btn.style.color=t===type?"#fff":"";}
  });
}

function filterFeed(filter){
  feedCurrentFilter=filter;
  ["all","tip","awareness","news"].forEach(f=>{
    const btn=$("ff-"+f);
    if(btn){btn.style.background=f===filter?"#7C4DFF":"";btn.style.color=f===filter?"#fff":"";}
  });
  loadFeed();
}

async function loadFeed(){
  const el=$("social-feed-list");if(!el)return;
  spin("social-feed-list","Loading feed...");
  try{
    let q="order=created_at.desc&limit=20";
    if(feedCurrentFilter!=="all")q+="&post_type=eq."+feedCurrentFilter;
    const posts=await dbq("health_posts?"+q);
    if(!posts.length){
      el.innerHTML=`<div style="text-align:center;padding:40px;color:#9CA3AF">
        <div style="font-size:48px;margin-bottom:10px">📱</div>
        <div style="font-weight:600">No posts yet.</div>
        <div style="font-size:13px;margin-top:4px">మొదటి post చేయండి!</div>
      </div>`;return;
    }
    el.innerHTML=posts.map(p=>postCard(p)).join("");
  }catch(e){el.innerHTML=`<div style="color:#DC2626;padding:12px">Error: ${e.message}</div>`;}
}

function postCard(p){
  const roleIcon={doctor:"👨‍⚕️",patient:"🙋",hospital:"🏥",lab:"🔬",homeprovider:"🏠",store:"💊",ambulance:"🚑"};
  const typeColor={tip:"#059669",awareness:"#7C4DFF",news:"#D97706",text:"#6B7280"};
  const typeBg={tip:"#D1FAE5",awareness:"#EDE9FE",news:"#FEF3C7",text:"#F3F4F6"};
  const typeLabel={tip:"💡 Health Tip",awareness:"🎗️ Awareness",news:"📰 News",text:"📝 Post"};
  const ago=p.created_at?timeAgo(p.created_at):"";
  return `<div style="background:#fff;border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.06)">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <div style="width:40px;height:40px;border-radius:50%;background:#7C4DFF;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;flex-shrink:0">${safe(p.author_name||"U").charAt(0).toUpperCase()}</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:14px;color:#1A2B3C">${roleIcon[p.author_role]||"👤"} ${safe(p.author_name)}</div>
        <div style="font-size:11px;color:#9CA3AF">${safe(p.author_type)||""} · ${ago}</div>
      </div>
      ${p.post_type&&p.post_type!=="text"?`<span style="background:${typeBg[p.post_type]||"#F3F4F6"};color:${typeColor[p.post_type]||"#6B7280"};border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600">${typeLabel[p.post_type]||""}</span>`:""}
    </div>
    <div style="font-size:14px;color:#1A2B3C;line-height:1.6;margin-bottom:12px">${safe(p.content)}</div>
    <div style="display:flex;gap:16px;padding-top:10px;border-top:1px solid #F3F4F6">
      <button onclick="likePost('${p.id}',this)" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;color:#6B7280;font-size:13px">
        ❤️ <span id="likes-${p.id}">${p.likes_count||0}</span>
      </button>
      <button onclick="toggleComments('${p.id}')" style="background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;color:#6B7280;font-size:13px">
        💬 <span>${p.comments_count||0}</span>
      </button>
      ${A.user&&(p.author_id===A.user.id||A.role==="admin")?`<button onclick="deletePost('${p.id}')" style="background:none;border:none;cursor:pointer;color:#9CA3AF;font-size:12px;margin-left:auto"> 🗑️ Delete</button>`:""}
    </div>
    <div id="comments-${p.id}" style="display:none;margin-top:10px;border-top:1px solid #F3F4F6;padding-top:10px">
      <div id="comments-list-${p.id}"></div>
      ${A.user?`<div style="display:flex;gap:8px;margin-top:8px">
        <input id="comment-input-${p.id}" class="form-input" placeholder="Comment రాయండి..." style="flex:1;padding:8px 12px;font-size:13px"/>
        <button onclick="addComment('${p.id}')" class="btn btn-primary btn-sm" style="background:#7C4DFF">Send</button>
      </div>`:""}
    </div>
  </div>`;
}

function timeAgo(dateStr){
  const diff=Date.now()-new Date(dateStr).getTime();
  const mins=Math.floor(diff/60000);
  if(mins<1)return"just now";
  if(mins<60)return mins+"m ago";
  const hrs=Math.floor(mins/60);
  if(hrs<24)return hrs+"h ago";
  return Math.floor(hrs/24)+"d ago";
}

async function createPost(source){
  if(!A.user){toast("Login required",true);return;}
  const inputId=source==="hospital"?"hos-post-text":"feed-post-text";
  const text=$($( inputId))?.value?.trim()||gv(inputId);
  if(!text){toast("Post content రాయండి!",true);return;}

  const authorName=A.user.name||A.user.store_name||A.user.hospital_name||"User";
  const authorType={doctor:"Doctor",patient:"Patient",hospital:"Hospital",lab:"Lab",homeprovider:"Home Care",store:"Medical Store",ambulance:"Ambulance"}[A.role]||"";

  try{
    await DB.post("health_posts",{
      author_id:A.user.id,
      author_role:A.role,
      author_name:authorName,
      author_type:authorType,
      content:text,
      post_type:source==="feed"?(feedCurrentType||"text"):"text",
      likes_count:0,
      comments_count:0
    });
    const el=$(inputId);if(el)el.value="";
    toast("Post published! ✅");
    if(source==="hospital")loadMyPosts("hospital");
    else loadFeed();
  }catch(e){toast(e.message,true);}
}

async function likePost(postId,btn){
  if(!A.user){toast("Like చేయడానికి login చేయండి",true);return;}
  try{
    // Check already liked
    const existing=await dbq("post_likes?post_id=eq."+postId+"&user_id=eq."+A.user.id);
    const countEl=$("likes-"+postId);
    if(existing.length){
      // Unlike
      await DB.del("post_likes","post_id=eq."+postId+"&user_id=eq."+A.user.id);
      await DB.patch("health_posts","id=eq."+postId,{likes_count:Math.max((parseInt(countEl?.textContent)||1)-1,0)});
      if(countEl)countEl.textContent=Math.max((parseInt(countEl.textContent)||1)-1,0);
      if(btn)btn.style.color="#6B7280";
    }else{
      // Like
      await DB.post("post_likes",{post_id:postId,user_id:A.user.id,user_role:A.role});
      await DB.patch("health_posts","id=eq."+postId,{likes_count:(parseInt(countEl?.textContent)||0)+1});
      if(countEl)countEl.textContent=(parseInt(countEl.textContent)||0)+1;
      if(btn)btn.style.color="#DC2626";
    }
  }catch(e){toast(e.message,true);}
}

async function toggleComments(postId){
  const el=$("comments-"+postId);if(!el)return;
  if(el.style.display==="none"){
    el.style.display="block";
    await loadComments(postId);
  }else{
    el.style.display="none";
  }
}

async function loadComments(postId){
  const el=$("comments-list-"+postId);if(!el)return;
  try{
    const comments=await dbq("post_comments?post_id=eq."+postId+"&order=created_at.asc");
    if(!comments.length){el.innerHTML=`<div style="font-size:12px;color:#9CA3AF;text-align:center;padding:8px">No comments yet.</div>`;return;}
    el.innerHTML=comments.map(c=>`
      <div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start">
        <div style="width:28px;height:28px;border-radius:50%;background:#7C4DFF;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;flex-shrink:0">${safe(c.author_name).charAt(0).toUpperCase()}</div>
        <div style="background:#F8FAFC;border-radius:10px;padding:8px 10px;flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-size:11px;font-weight:700;color:#1A2B3C">${safe(c.author_name)}</div>
            ${A.user&&(c.author_id===A.user.id)?`<button onclick="deleteComment('${c.id}','${c.post_id}',this)" style="background:none;border:none;cursor:pointer;color:#9CA3AF;font-size:11px;padding:0"> 🗑️ Delete</button>`:""}
          </div>
          <div style="font-size:13px;color:#374151">${safe(c.content)}</div>
        </div>
      </div>`).join("");
  }catch(e){el.innerHTML=`<div style="color:#DC2626;font-size:12px">Error loading comments</div>`;}
}

async function addComment(postId){
  if(!A.user){toast("Comment చేయడానికి login చేయండి",true);return;}
  const inp=$("comment-input-"+postId);
  const text=inp?.value?.trim();
  if(!text){toast("Comment రాయండి!",true);return;}
  try{
    const authorName=A.user.name||A.user.store_name||"User";
    await DB.post("post_comments",{
      post_id:postId,
      author_id:A.user.id,
      author_name:authorName,
      author_role:A.role,
      content:text
    });
    // Update comment count
    const posts=await dbq("health_posts?id=eq."+postId);
    if(posts.length){
      const newCount=(posts[0].comments_count||0)+1;
      await DB.patch("health_posts","id=eq."+postId,{comments_count:newCount});
    }
    if(inp)inp.value="";
    await loadComments(postId);
    toast("Comment added! ✅");
  }catch(e){toast(e.message,true);}
}

async function deleteComment(commentId, postId, btn){
  if(!confirm("Delete this comment?"))return;
  try{
    await DB.del("post_comments","id=eq."+commentId);
    // Update comment count
    const posts=await dbq("health_posts?id=eq."+postId);
    if(posts.length){
      const newCount=Math.max((posts[0].comments_count||1)-1,0);
      await DB.patch("health_posts","id=eq."+postId,{comments_count:newCount});
    }
    // Remove from UI
    if(btn){const row=btn.closest("div[style*='display:flex']");if(row)row.remove();}
    toast("Comment deleted.");
  }catch(e){toast(e.message,true);}
}

async function deletePost(postId){
  if(!confirm("Delete this post?"))return;
  try{
    await DB.del("health_posts","id=eq."+postId);
    toast("Post deleted.");
    loadFeed();
  }catch(e){toast(e.message,true);}
}

async function loadMyPosts(role){
  if(!A.user)return;
  const elId=role==="hospital"?"hos-my-posts":role==="doctor"?"doc-my-posts":"feed-my-posts";
  const el=$(elId);if(!el)return;
  try{
    const posts=await dbq("health_posts?author_id=eq."+A.user.id+"&order=created_at.desc&limit=10");
    if(!posts.length){el.innerHTML=`<div style="text-align:center;padding:20px;color:#9CA3AF">No posts yet. మొదటి post చేయండి!</div>`;return;}
    el.innerHTML=posts.map(p=>postCard(p)).join("");
  }catch(e){el.innerHTML=`<div style="color:#DC2626">Error loading posts</div>`;}
}


/* ════════════════════════════════════════════
   DOCTOR POST ON FEED
════════════════════════════════════════════ */
let docPostType="tip";

function setDocPostType(type){
  docPostType=type;
  ["tip","awareness","news"].forEach(t=>{
    const btn=$("dpt-"+t);
    if(btn){btn.style.background=t===type?"#0A7FAF":"";btn.style.color=t===type?"#fff":"";}
  });
}

async function createDocPost(){
  if(!A.user||A.role!=="doctor"){toast("Doctor login required",true);return;}
  const text=gv("doc-post-text");
  if(!text){toast("Post content రాయండి!",true);return;}
  try{
    await DB.post("health_posts",{
      author_id:A.user.id,
      author_role:"doctor",
      author_name:safe(A.user.name),
      author_type:safe(A.user.specialization)||"Doctor",
      content:text,
      post_type:docPostType||"tip",
      likes_count:0,
      comments_count:0
    });
    const el=$("doc-post-text");if(el)el.value="";
    toast("Post published! ✅");
    loadMyPosts("doctor");
  }catch(e){toast(e.message,true);}
}

/* ════════════════════════════════════════════
   ANDROID BACK BUTTON HANDLER
════════════════════════════════════════════ */
window.addEventListener("popstate",(e)=>{
  if(e.state&&e.state.page){
    // Back button నొక్కినప్పుడు — previous page కి వెళ్ళు
    const pg=e.state.page;
    document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
    const el=$("page-"+pg);
    if(el){el.classList.add("active");window.scrollTo(0,0);}
    // Re-render if needed
    const renderMap={
      patientDash:rPatientDash,doctorDash:rDoctorDash,
      storeDash:rStoreDash,ambuDash:rAmbuDash,labDash:rLabDash,
      hpDash:rHPDash,hospitalDash:rHospitalDash,
      landing:rLanding,search:rSearch
    };
    if(renderMap[pg])renderMap[pg]();
  }else{
    // No state — landing page కి వెళ్ళు (app close కాకుండా)
    const activePage=document.querySelector(".page.active");
    const activeId=activePage?.id?.replace("page-","");
    if(activeId==="landing"){
      // Landing లో ఉంటే — exit confirm చేయి
      if(confirm("DocNear app నుండి exit అవ్వాలా?")){
        // Allow browser to go back/close
        history.back();
      }else{
        history.pushState({page:"landing"},"",window.location.pathname);
      }
    }else{
      // Any other page నుండి → landing కి
      history.pushState({page:"landing"},"",window.location.pathname);
      go("landing");
    }
  }
});


/* ════════════════════════════════════════════
   SHARE PROFILE — Deep Link
════════════════════════════════════════════ */
function shareProfile(type, id, name, subtype, district){
  const baseUrl = "https://docnear.in";
  const url = baseUrl + "?type=" + type + "&id=" + id;
  
  const typeIcon = {doctor:"👨‍⚕️",lab:"🔬",homeprovider:"🏠",hospital:"🏥"}[type]||"🩺";
  const typeLabel = {doctor:"Doctor",lab:"Diagnostic Lab",homeprovider:"Home Care Provider",hospital:"Hospital"}[type]||"Provider";
  const subtypeLabel = subtype?(" — "+subtype):"";
  const districtLabel = district?("\n📍 "+district):"";
  
  const text = typeIcon+" "+name+subtypeLabel+districtLabel+"\n\n"
    +"DocNear లో Book చేయండి 👇\n"+url
    +"\n\n🩺 DocNear — India's Health Platform";

  if(navigator.share){
    // Native share (Android/iOS)
    navigator.share({
      title:"DocNear — "+name,
      text:text,
      url:url
    }).catch(()=>{});
  } else {
    // Fallback — copy to clipboard + WhatsApp
    const waUrl = "https://wa.me/?text="+encodeURIComponent(text);
    window.open(waUrl,"_blank");
  }
}

/* Deep Link — URL లో ?type=doctor&id=xxx ఉంటే directly open చేయు */
async function handleDeepLink(){
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  const id = params.get("id");
  if(!type||!id) return false;

  try{
    // Clear URL params without reload
    history.replaceState(null,"",window.location.pathname);

    if(type==="doctor"){
      spin("landing-doctors","Loading...");
      const rows = await dbq("doctors?id=eq."+id+"&approved=eq.true");
      if(!rows.length){toast("Doctor not found.",true);return false;}
      A.doc = rows[0];
      go("book");
      return true;
    }
    if(type==="lab"){
      const rows = await dbq("diagnostic_labs?id=eq."+id+"&approved=eq.true");
      if(!rows.length){toast("Lab not found.",true);return false;}
      A.lab = rows[0];
      go("labDetail");
      return true;
    }
    if(type==="homeprovider"){
      const rows = await dbq("home_providers?id=eq."+id+"&approved=eq.true");
      if(!rows.length){toast("Provider not found.",true);return false;}
      // homeServices page లో ఆ provider highlighted గా show చేయు
      go("homeServices");
      setTimeout(()=>{
        selectHSProvider(rows[0].id, rows[0].name, rows[0].service_type);
        toast("👩‍⚕️ "+safe(rows[0].name)+" profile loaded!");
      }, 500);
      return true;
    }
    if(type==="hospital"){
      const rows = await dbq("hospitals?id=eq."+id+"&approved=eq.true");
      if(!rows.length){toast("Hospital not found.",true);return false;}
      go("hospitalsPage");
      setTimeout(()=>{
        toast("🏥 "+safe(rows[0].name)+" — "+safe(rows[0].district));
      }, 500);
      return true;
    }
    if(type==="store"){
      const rows=await dbq("medical_stores?id=eq."+id+"&approved=eq.true");
      if(!rows.length){toast("Store not found.",true);return false;}
      A.store=rows[0];go("storeDetail");
      return true;
    }
    if(type==="ambulance"){
      const rows=await dbq("ambulances?id=eq."+id+"&approved=eq.true");
      if(!rows.length){toast("Ambulance not found.",true);return false;}
      go("ambulance");
      setTimeout(()=>toast("🚑 "+safe(rows[0].operator_name)+" — "+safe(rows[0].district)),500);
      return true;
    }
  }catch(e){
    console.warn("Deep link error:",e);
    return false;
  }
  return false;
}

document.addEventListener("DOMContentLoaded",()=>{
  // Initial state push — Android back button కి
  history.replaceState({page:"landing"},"",window.location.pathname);
  const sess=S.load();
  const params=new URLSearchParams(window.location.search);
  const fromAdmin=params.get("from")==="admin";
  if(fromAdmin){history.replaceState(null,"",window.location.pathname);}
  // Deep link handle
  const isDeepLink=params.get("type")&&params.get("id");
  if(sess&&!fromAdmin){
    A.user=sess.u;A.role=sess.r;
    if(isDeepLink){go("landing");setTimeout(handleDeepLink,1000);}
    else{refreshUserData(sess.r,sess.u.id).then(()=>redirectRole(sess.r));}
  }
  else if(sess&&fromAdmin){A.user=sess.u;A.role=sess.r;rLanding();}
  else{rLanding();if(isDeepLink)setTimeout(handleDeepLink,800);}
  setLang(A.lang);
  DB.get("doctors","approved=eq.true&limit=1").then(()=>{A.demo=false;}).catch(()=>{A.demo=true;});
  loadAds();
});
async function refreshUserData(role,userId){
  const tbl={doctor:"doctors",store:"medical_stores",ambulance:"ambulances",lab:"diagnostic_labs",patient:"patients",admin:null}[role];
  if(!tbl)return;
  try{
    const rows=await DB.get(tbl,"id=eq."+userId);
    if(rows.length){A.user=rows[0];S.save(rows[0],role);}
  }catch{}
}

/* ════════ DOCTOR REVIEWS ════════ */
async function submitReview(doctorId, rating, comment) {
  if(!A.user || A.role!=="patient"){toast("Login as patient to review.",true);return;}
  try{
    // Check if patient had an appointment with this doctor
    const appts = await safeGet("appointments",
      `patient_id=eq.${A.user.id}&doctor_id=eq.${doctorId}&status=eq.completed`);
    if(!appts.length && !A.demo){
      toast("Only patients who completed appointment can review.",true);return;
    }
    await DB.post("doctor_reviews",{
      doctor_id:doctorId, patient_id:A.user.id,
      patient_name:A.user.name, rating:rating, comment:comment
    }).catch(()=>{});
    toast("Review submitted! ⭐");
    viewDoc(doctorId);
  }catch(e){toast(e.message,true);}
}

function renderReviewForm(docId){
  return `
  <div style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.05);margin-top:14px">
    <div style="font-size:14px;font-weight:700;color:#1A2B3C;margin-bottom:12px">Write a Review</div>
    <div style="margin-bottom:12px">
      <div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:6px">Rating</div>
      <div id="star-rating" style="display:flex;gap:6px">
        ${[1,2,3,4,5].map(i=>`<button onclick="setStarRating(${i})" id="star-${i}"
          style="font-size:28px;background:none;border:none;cursor:pointer;opacity:.4;transition:all .15s">★</button>`).join("")}
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Comment</label>
      <textarea id="review-comment" class="form-input" rows="3"
        placeholder="Share your experience..."></textarea>
    </div>
    <button class="btn btn-primary" onclick="submitReviewForm('${docId}')">Submit Review ⭐</button>
  </div>`;
}
function setStarRating(n){
  window._starRating=n;
  for(let i=1;i<=5;i++){const s=document.getElementById("star-"+i);if(s)s.style.opacity=i<=n?"1":"0.4";}
}
async function submitReviewForm(docId){
  const rating=window._starRating||0;
  const comment=(document.getElementById("review-comment")||{}).value||"";
  if(!rating){toast("Please select a star rating.",true);return;}
  await submitReview(docId,rating,comment);
}

/* ════════ VIDEO CONSULTATION ════════ */
function startVideoCall(meetLink, doctorName){
  if(!meetLink){
    // Generate a Jitsi meet link
    const roomId="docnear-"+(A.user?.id||"").slice(0,8)+"-"+Date.now().toString(36);
    meetLink="https://meet.jit.si/"+roomId;
  }
  // Open Jitsi in new tab
  const win=window.open(meetLink,"_blank","width=1200,height=800");
  if(!win){
    // Fallback: show link
    const msg=`Video call link:\n${meetLink}\n\nCopy and open in browser.`;
    if(confirm(msg+"\n\nClick OK to copy link.")){
      navigator.clipboard?.writeText(meetLink).then(()=>toast("Link copied! 📋"));
    }
  }
  toast("Video call started! 🎥 Joining "+doctorName);
}

/* ════════ ADVANCED SEARCH ════════ */
async function rAdvancedSearch(){
  const qi=document.getElementById("search-q");
  const spec=document.getElementById("search-spec");
  const feeMin=document.getElementById("search-fee-min");
  const feeMax=document.getElementById("search-fee-max");
  const rating=document.getElementById("search-rating");

  let q="approved=eq.true";
  if(spec&&spec.value) q+=`&specialization=eq.${enc(spec.value)}`;

  const re=document.getElementById("search-results");
  const ce=document.getElementById("search-count");
  if(!re) return;
  spin("search-results","Finding doctors...");

  try{
    let docs=await safeGet("doctors",q,"docs");
    if(!docs.length) docs=DEMO.docs;

    // Client-side filters
    if(A.q){const v=A.q.toLowerCase();docs=docs.filter(d=>
      safe(d.name).toLowerCase().includes(v)||
      safe(d.specialization).toLowerCase().includes(v)||
      safe(d.hospital).toLowerCase().includes(v)||
      safe(d.district).toLowerCase().includes(v));}
    if(feeMin&&feeMin.value) docs=docs.filter(d=>d.fee>=parseInt(feeMin.value));
    if(feeMax&&feeMax.value) docs=docs.filter(d=>d.fee<=parseInt(feeMax.value));
    if(rating&&rating.value) docs=docs.filter(d=>d.rating>=parseFloat(rating.value));

    A.cache.docs=[...A.cache.docs.filter(d=>!docs.find(x=>x.id===d.id)),...docs];
    if(ce) ce.textContent=docs.length+" doctor"+(docs.length!==1?"s":"")+" found";
    re.innerHTML=docs.length?docs.map(d=>docCard(d)).join(""):empty("🔍","No doctors found. Try different filters.");
  }catch(e){re.innerHTML=DEMO.docs.map(d=>docCard(d)).join("");}
}

/* ════════ NOTIFICATIONS (Database) ════════ */
async function loadNotifications(userId, userType){
  try{
    const res=await fetch(`${SURL}/rest/v1/notifications?user_id=eq.${userId}&is_read=eq.false`,{
      headers:{"apikey":SKEY,"Authorization":"Bearer "+SKEY,"Content-Type":"application/json"}
    });
    const data=await res.json();
    return Array.isArray(data)?data:[];
  }catch{return [];}
}
  
    
      
      
    
  

async function markNotifRead(notifId){
  try{await DB.patch("notifications","id=eq."+notifId,{is_read:true}).catch(()=>{});}
  catch{}
}
async function sendNotification(userId, userType, title, message, type="info"){
  try{
    await DB.post("notifications",{
      user_id:userId, user_type:userType,
      title, message, type, is_read:false
    });
  }catch{}
}
async function toggleNotif(prefix){
  const panel=$(prefix+"-notif-panel");
  if(!panel)return;
  const isOpen=panel.style.display!=="none";
  panel.style.display=isOpen?"none":"block";
  if(!isOpen&&A.user){
    const notifs=await loadNotifications(A.user.id,A.role);
    const list=$(prefix+"-notifs");
    if(list){
      list.innerHTML=notifs.length?notifs.map(n=>`
        <div style="padding:10px;border-bottom:1px solid #F3F4F6;cursor:pointer" onclick="markNotifRead('${n.id}');this.style.opacity='0.5'">
          <div style="font-size:13px;font-weight:600;color:#1A2B3C">${safe(n.title)}</div>
          <div style="font-size:12px;color:#6B7280;margin-top:2px">${safe(n.message)}</div>
          <div style="font-size:10px;color:#9CA3AF;margin-top:2px">${new Date(n.created_at).toLocaleString()}</div>
        </div>`).join(""):"<div class='text-muted'>No new notifications.</div>";
      const badge=$(prefix.replace("-","")==="pd"?"nb-pd":prefix==="dd"?"nb-dd":prefix==="sd"?"nb-sd":prefix==="ld"?"nb-ld":"nb-ad");
      if(badge)badge.textContent=notifs.length||"";
    }
  }
}
async function refreshNotifBadges(){
  if(!A.user)return;
  const prefix=A.role==="patient"?"pd":A.role==="doctor"?"dd":A.role==="store"?"sd":A.role==="lab"?"ld":"ad";
  try{
    const notifs=await loadNotifications(A.user.id,A.role);
    const badge=$("nb-"+prefix);
    if(badge)badge.textContent=notifs.length||"";
  }catch{}
}

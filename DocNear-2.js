/* ════════ VIEWS ════════ */
async function viewDoc(id){
  A.doc=A.cache.docs.find(d=>d.id===id)||DEMO.docs.find(d=>d.id===id);
  if(!A.doc){try{const r=await DB.get("doctors","id=eq."+id);if(r.length)A.doc=r[0];}catch{}}
  go("profile");
}
function bookDoc(id){
  if(!A.user||A.role!=="patient"){toast("Login as patient to book.",true);go("patientLogin");return;}
  const doc=A.cache.docs.find(d=>d.id===id)||DEMO.docs.find(d=>d.id===id)||A.doc;
  if(doc&&doc.is_available===false){toast("Doctor is offline right now. Please try again later.",true);return;}
  A.doc=doc;
  A.slot="";go("book");
}
async function toggleFav(id){
  if(!A.user||A.role!=="patient"){toast("Login to save.",true);return;}
  if(!A.cache.favs)A.cache.favs=[];
  const isFav=A.cache.favs.includes(id);
  if(isFav){await DB.del("favorite_doctors",`patient_id=eq.${A.user.id}&doctor_id=eq.${id}`).catch(()=>{});A.cache.favs=A.cache.favs.filter(x=>x!==id);toast("Removed ✓");}
  else{await DB.post("favorite_doctors",{patient_id:A.user.id,doctor_id:id}).catch(()=>{});A.cache.favs=[...A.cache.favs,id];toast("Saved ❤️");}
  fetchDocs();
}

/* ════════ PROFILE ════════ */
async function rProfile(){
  const d=A.doc;if(!d){go("search");return;}
  const na=$("profile-nav-actions");
  if(na)na.innerHTML=A.user?`<span style="font-size:12px;font-weight:600;color:#1A2B3C">${A.user.name||"User"}</span><button class="btn btn-ghost btn-sm" onclick="logout()">Logout</button>`:`<button class="btn btn-outline btn-sm" onclick="go('patientLogin')">Login to Book</button>`;
  let reviews=[];try{reviews=await DB.get("doctor_reviews","doctor_id=eq."+d.id);}catch{}
  const stars=[1,2,3,4,5].map(i=>`<span style="color:${i<=Math.round(d.rating||0)?'#F59E0B':'#E5E7EB'};font-size:16px">★</span>`).join("");
  if($("profile-content"))$("profile-content").innerHTML=`
    <div class="profile-header">
      <div style="display:flex;gap:18px;margin-bottom:18px;flex-wrap:wrap">
        ${avt(d.name,d.color||"#0A7FAF",74)}
        <div style="flex:1;min-width:160px">
          <h2 style="font-size:clamp(18px,4vw,24px);font-weight:800;color:#1A2B3C;margin-bottom:3px">${safe(d.name)}</h2>
          <div style="font-size:14px;color:#0A7FAF;font-weight:700;margin-bottom:8px">${safe(d.specialization)}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${pill((d.experience||0)+" yrs exp")}
            ${d.rating>0?pill("★ "+d.rating,"#FEF3C7","#D97706"):""}
            ${d.reviews>0?pill(d.reviews+" reviews","#F3F4F6","#6B7280"):""}
            ${d.approved?pill("✓ Verified","#D1FAE5","#059669"):""}
            ${d.video_consult?pill("🎥 Video","#EDE9FE","#7C4DFF"):""}
          </div>
        </div>
        <div style="text-align:right"><div style="font-size:16px;font-weight:700;color:#059669">🆓 Free Booking</div></div>
      </div>
      <div class="profile-info-grid">
        ${[["🏥","Hospital",d.hospital],["📍","Location",d.district||d.city||d.location],["📋","Reg. No.",d.reg_number],["📞","Phone",d.phone],["🎓","Qualifications",d.qualifications],["🌐","Languages",(d.languages||["Telugu","English"]).join(", ")]].map(([ic,l,v])=>`<div class="profile-info-item"><div class="profile-info-lbl">${ic} ${l}</div><div class="profile-info-val">${safe(v)||"—"}</div></div>`).join("")}
      </div>
      ${d.banner_url?`<div style="margin:12px 0"><img src="${d.banner_url}" style="width:100%;border-radius:12px;max-height:140px;object-fit:cover"/></div>`:""}
      ${d.about?`<p style="font-size:14px;color:#374151;line-height:1.7;margin-bottom:16px">${safe(d.about)}</p>`:""}
      ${d.rating>0?`<div style="display:flex;align-items:center;gap:10px;padding:12px 0;border-top:1px solid #F3F4F6;margin-bottom:14px">${stars}<span style="font-size:14px;font-weight:700">${d.rating}</span><span style="font-size:12px;color:#9CA3AF">(${d.reviews})</span></div>`:""}
      ${d.is_available===false?`<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:10px 14px;margin-bottom:10px;font-size:12px;color:#DC2626;font-weight:600">🔴 Doctor is currently offline — booking unavailable</div>`:""}
      <div style="display:grid;grid-template-columns:1fr${d.video_consult?" 1fr":""}; gap:10px">
        <button class="btn btn-primary btn-full"${d.is_available===false?' disabled style="opacity:.5;cursor:not-allowed"':""} onclick="A.type='inperson';bookDoc('${d.id}')">📅 Book Appointment</button>
        ${d.video_consult?`<button class="btn btn-purple btn-full"${d.is_available===false?' disabled style="opacity:.5;cursor:not-allowed"':""} onclick="A.type='video';bookDoc('${d.id}')">🎥 Video Consult</button>`:""}
      </div>
    </div>
    <div class="profile-slots-wrap" style="margin-bottom:14px">
      <div style="font-size:14px;font-weight:700;color:#1A2B3C;margin-bottom:12px">Available Slots</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${(d.slots||[]).map(s=>`<span class="profile-slot-tag">🕐 ${s}</span>`).join("")}</div>
    </div>
    ${reviews.length?`<div style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,.05)"><div style="font-size:14px;font-weight:700;color:#1A2B3C;margin-bottom:12px">Patient Reviews</div>${reviews.slice(0,3).map(r=>`<div style="padding:10px 0;border-bottom:1px solid #F3F4F6"><div style="display:flex;align-items:center;gap:8px;margin-bottom:3px"><div style="font-size:13px;font-weight:700">${safe(r.patient_name)||"Patient"}</div><div>${[1,2,3,4,5].map(i=>`<span style="color:${i<=r.rating?"#F59E0B":"#E5E7EB"};font-size:12px">★</span>`).join("")}</div></div><div style="font-size:13px;color:#374151">${safe(r.comment)}</div></div>`).join("")}</div>`:""}`;
}

/* ════════ BOOK ════════ */
async function rBook(){
  const d=A.doc;if(!d){go("search");return;}
  const c=$("book-content");
  if(!A.user||A.role!=="patient"){c.innerHTML=`<div style="text-align:center;padding:40px 0"><div style="font-size:56px;margin-bottom:14px">🔒</div><h3 style="font-family:'Lora',serif;font-size:22px;color:#1A2B3C;margin-bottom:8px">Login Required</h3><p style="color:#6B7280;font-size:14px;margin-bottom:20px">Patient login చేయండి</p><button class="btn btn-primary" onclick="go('patientLogin')">Patient Login</button></div>`;return;}
  A.slot="";
  let booked=[];try{const av=await DB.get("doctor_availability",`doctor_id=eq.${d.id}&date=eq.${td()}`);if(av.length)booked=av[0].booked_slots||[];}catch{}
  const isV=A.type==="video";
  c.innerHTML=`
    <div style="background:#fff;border-radius:14px;padding:14px;margin-bottom:14px;display:flex;gap:12px;box-shadow:0 2px 8px rgba(0,0,0,.05)">
      ${avt(d.name,d.color||"#0A7FAF",48)}
      <div style="flex:1"><div style="font-size:15px;font-weight:700;color:#1A2B3C">${safe(d.name)}</div>
      <div style="font-size:12px;color:#0A7FAF;font-weight:600">${safe(d.specialization)}</div>
      <div style="font-size:12px;color:#9CA3AF">🏥 ${safe(d.hospital)}</div></div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <div style="font-size:16px;font-weight:700;color:#059669">${d.fee?`₹${d.fee}`:"🆓 Free"}</div>
        <button onclick="shareProfile('doctor','${d.id}','${safe(d.name)}','${safe(d.specialization||'')}')" class="btn btn-outline btn-sm">📤 Share</button>
      </div>
    </div>
    ${d.video_consult?`<div style="background:#fff;border-radius:14px;padding:14px;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,.05)">
      <div class="form-label" style="margin-bottom:10px">Appointment Type</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <button id="type-inp" class="slot-btn ${!isV?"active":""}" onclick="A.type='inperson';setBookType()">🏥 In-Person</button>
        <button id="type-vid" class="slot-btn ${isV?"active":""}" onclick="A.type='video';setBookType()">🎥 Video Consult</button>
      </div></div>`:""}
    <div style="background:#fff;border-radius:16px;padding:20px;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,.05)">
      <div class="form-group"><label class="form-label">Date <span>*</span></label>
        <input type="date" id="book-date" class="form-input" min="${td()}" onchange="onDateChange()"/></div>
      <div class="form-group"><label class="form-label">Time Slot <span>*</span></label>
        <div class="slot-grid" id="slot-grid">
          ${(d.slots||[]).map(s=>{const b=booked.includes(s);return `<button class="slot-btn${b?" slot-blocked":""}" ${b?"disabled":""} onclick="${b?"":"pickSlot('"+s+"')"}">${s}${b?`<br><span style="font-size:9px">Booked</span>`:""}</button>`;}).join("")}
        </div></div>
      <div id="book-summary" style="display:none;background:#F0FDF4;border-radius:10px;padding:14px;border:1px solid #A7F3D0;margin-top:12px">
        <div style="font-size:12px;font-weight:700;color:#065F46;margin-bottom:6px">📋 Booking Summary</div>
        <div id="bsum" style="font-size:13px;color:#047857;line-height:1.8"></div>
        <div style="font-size:15px;font-weight:700;color:#059669;margin-top:6px">🆓 Free Booking</div>
      </div>
    </div>
    <button class="btn btn-primary btn-full" id="confirm-btn" onclick="confirmBook()" style="font-size:15px;padding:14px">Confirm Booking — Free</button>`;
}
function setBookType(){const isV=A.type==="video";[$("type-inp"),$("type-vid")].forEach((b,i)=>b&&b.classList.toggle("active",i===0?!isV:isV));updateBookSum();}
function pickSlot(s){A.slot=s;document.querySelectorAll(".slot-btn:not(.slot-blocked)").forEach(b=>b.classList.toggle("active",b.textContent.trim().startsWith(s)));updateBookSum();}
async function onDateChange(){
  const date=($("book-date")||{}).value;if(!date||!A.doc)return;
  try{const av=await DB.get("doctor_availability",`doctor_id=eq.${A.doc.id}&date=eq.${date}`);const b=av.length?av[0].booked_slots||[]:[];const sg=$("slot-grid");if(sg)sg.innerHTML=(A.doc.slots||[]).map(s=>{const bl=b.includes(s);return `<button class="slot-btn${bl?" slot-blocked":""}" ${bl?"disabled":""} onclick="${bl?"":"pickSlot('"+s+"')"}">${s}${bl?`<br><span style="font-size:9px">Booked</span>`:""}</button>`;}).join("");}catch{}
  updateBookSum();
}
function updateBookSum(){
  const date=($("book-date")||{}).value,sb=$("book-summary"),st=$("bsum");
  if(sb&&st&&date&&A.slot){sb.style.display="block";st.innerHTML=`📅 ${date}<br>🕐 ${A.slot}<br>👤 ${A.user.name}<br>${A.type==="video"?"🎥 Video Consultation":"🏥 In-Person"}`;}else if(sb)sb.style.display="none";
}
async function confirmBook(){
  const date=($("book-date")||{}).value;
  if(!date){toast("Date select చేయండి.",true);return;}
  if(!A.slot){toast("Slot select చేయండి.",true);return;}
  const d=A.doc,btn=$("confirm-btn");
  if(d.is_available===false){
    if(!confirm("⚠️ Dr. "+safe(d.name)+" is currently OFFLINE. They may not respond immediately. Book anyway?"))return;
  }
  if(btn){btn.disabled=true;btn.textContent="Booking...";}
  try{
    const isV=A.type==="video";
    const ml=isV?"https://meet.jit.si/docnear-"+(crypto.randomUUID?crypto.randomUUID().slice(0,10):Date.now()):null;
    await safePost("appointments",{
      patient_id:A.user.id,patient_name:A.user.name,patient_phone:A.user.phone,doctor_id:d.id,doctor_name:d.name,
      specialization:d.specialization,date,slot:A.slot,status:"pending",
      fee:d.fee,payment_status:"pending",is_video:isV,meeting_link:ml
    },data=>[{...data,id:"ap_"+Date.now()}]);
    DB.post("notifications",{user_id:d.id,user_type:"doctor",title:"New Appointment 📅",message:`${A.user.name} — ${date} at ${A.slot}${isV?" (Video)":""}`,type:"info"}).catch(()=>{});
    if(isV&&ml){toast("Booking confirmed! 🎥");setTimeout(()=>{if(confirm("Join video call now?\n"+ml))window.open(ml,"_blank");},1200);}
    else toast("Appointment booked! 🎉");
    go("patientDash");
  }catch(e){toast("Error: "+e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="Confirm Booking — ₹"+(A.doc?.fee||0);}}
}

/* ════════ STORES ════════ */
async function rStores(){
  const listEl=$("stores-list");if(!listEl)return;spin("stores-list");
  try{
    let stores=await safeGet("medical_stores","approved=eq.true&is_active=eq.true","stores");
    if(!stores.length)stores=DEMO.stores;
    A.cache.stores=stores;
    listEl.innerHTML=stores.map(s=>storeCard(s)).join("");
  }catch(e){listEl.innerHTML=DEMO.stores.map(s=>storeCard(s)).join("");}
}

/* ════════════════════════════════════════════
   LIVE TRACKING — Ambulance & Store
════════════════════════════════════════════ */
function openLiveTracking(type, name, phone, lat, lng){
  if(!A.user){toast("Tracking చూడటానికి login చేయండి",true);return;}
  
  // Google Maps real-time tracking link
  const trackUrl = lat && lng 
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;
  
  // WhatsApp location share prompt
  const waText = encodeURIComponent(
    `🚑 ${name} - Live Location\n📞 ${phone}\n\nTrack here: ${trackUrl}`
  );
  
  // Show tracking modal
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:24px;max-width:360px;width:100%">
      <div style="font-size:18px;font-weight:700;color:#1A2B3C;margin-bottom:6px">
        ${type==='ambulance'?'🚑':'🏪'} Live Tracking
      </div>
      <div style="font-size:13px;color:#6B7280;margin-bottom:16px">${name}</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <a href="${trackUrl}" target="_blank" class="btn btn-primary" 
           style="text-align:center;padding:12px;border-radius:12px;text-decoration:none">
          📍 Google Maps లో చూడండి
        </a>
        <a href="https://wa.me/?text=${waText}" target="_blank" class="btn btn-outline"
           style="text-align:center;padding:12px;border-radius:12px;text-decoration:none;color:#25D366;border-color:#25D366">
          📲 WhatsApp లో Share చేయండి
        </a>
        ${phone?`<button onclick="callWithLogin('${phone}')" class="btn btn-outline" style="padding:12px;border-radius:12px">
          📞 Call చేయండి
        </button>`:''}
        <button onclick="this.closest('div[style*=fixed]').remove()" 
          style="background:none;border:none;color:#9CA3AF;cursor:pointer;padding:8px">
          ✕ Close
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
}

function storeCard(s){
  let isOpen=s.is_available!==false;
  return `<div class="card" onclick="A.user?viewStore('${s.id}'):requireLogin('stores')">
    <div style="display:flex;gap:12px;margin-bottom:10px">
      <div style="width:52px;height:52px;border-radius:12px;background:${s.color||"#10B981"};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">💊</div>
      <div style="flex:1;min-width:0">
        <div class="doc-name">${safe(s.store_name)}</div>
        <div style="font-size:12px;color:#6B7280">👤 ${safe(s.owner_name)}</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">
          ${pill(isOpen?"🟢 Open":"🔴 Closed",isOpen?"#D1FAE5":"#FEE2E2",isOpen?"#059669":"#DC2626")}
          ${s.delivery_available?pill("🚴 Delivery","#E3F4FC","#0A7FAF"):pill("Pickup Only","#F3F4F6","#9CA3AF")}
          ${s.is_24x7?pill("24×7","#EDE9FE","#7C4DFF"):""}
        </div>
      </div>
    </div>
    <div style="font-size:12px;color:#6B7280;margin-bottom:12px">📍 ${safe(s.address||s.district)||"—"}${s.delivery_available?` · 🚴 ${s.delivery_radius_km}km`:""}</div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();callWithLogin('${s.phone}')">📞 Call</button>
      <a href="${getMapLink(s.store_name||s.name,s.district||s.city)}" target="_blank" class="btn btn-outline btn-sm" onclick="event.stopPropagation()">📍 Map</a>
      <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();shareProfile('store','${s.id}','${safe(s.store_name||s.name)}','Medical Store','${safe(s.district||s.city||'')}')" > 📤 Share</button>
      <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();openLiveTracking('store','${safe(s.store_name||s.name)}','${safe(s.phone)}','','')"> 📍 Map</button>
      <button class="btn btn-green" style="flex:1;padding:7px 0;font-size:12px" onclick="event.stopPropagation();prescForStore('${s.id}')">📋 Order Medicines</button>
    </div>
  </div>`;
}
async function viewStore(id){
  A.store=A.cache.stores.find(s=>s.id===id);
  if(!A.store){
    try{
      const rows=await dbq("medical_stores?id=eq."+id+"&approved=eq.true");
      if(rows.length)A.store=rows[0];
    }catch(e){}
  }
  if(A.store)go("storeDetail");
  else toast("Store details load కాలేదు.",true);
}
function rStoreDetail(){
  const s=A.store;if(!s){go("stores");return;}
  if($("store-detail-content"))$("store-detail-content").innerHTML=`<div class="profile-header">
    <div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap">
      <div style="width:64px;height:64px;border-radius:16px;background:${s.color||"#10B981"};display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0">💊</div>
      <div style="flex:1;min-width:160px"><h2 style="font-size:20px;font-weight:800;color:#1A2B3C;margin-bottom:3px">${safe(s.store_name)}</h2><div style="font-size:13px;color:#6B7280">👤 ${safe(s.owner_name)}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${pill(s.is_available!==false?"🟢 Open":"🔴 Closed",s.is_available!==false?"#D1FAE5":"#FEE2E2",s.is_available!==false?"#059669":"#DC2626")}${s.approved?pill("✓ Verified","#D1FAE5","#059669"):""}${s.is_24x7?pill("24×7","#EDE9FE","#7C4DFF"):""}${s.delivery_available?pill("🚴 Delivery","#E3F4FC","#0A7FAF"):""}</div>
        ${s.banner_url?`<img src="${s.banner_url}" style="width:100%;border-radius:12px;max-height:140px;object-fit:cover;margin-top:12px"/>`:``}
      </div>
    </div>
    <div class="profile-info-grid">${[["📍","Address",s.address||s.district],["📞","Phone",s.phone],["🕐","Hours",s.is_24x7?"24×7":(s.opening_time||"09:00")+" - "+(s.closing_time||"21:00")],["🚴","Delivery",s.delivery_available?s.delivery_radius_km+"km":"Not Available"],["⭐","Rating",s.rating>0?s.rating+"/5":"New"]].map(([ic,l,v])=>`<div class="profile-info-item"><div class="profile-info-lbl">${ic} ${l}</div><div class="profile-info-val">${safe(v)||"—"}</div></div>`).join("")}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <button class="btn btn-outline btn-full" onclick="shareProfile('store','${s.id}','${safe(s.store_name||s.name)}','Medical Store','${safe(s.district||s.city||'')}')" >📤 Share</button>
      <button class="btn btn-outline btn-full" onclick="callWithLogin('${s.phone}')">📞 Call Now</button>
      <button class="btn btn-green btn-full" onclick="prescForStore('${s.id}')">📋 Order Medicines</button>
    </div>
  </div>`;
}
function prescForStore(id){A.store=A.cache.stores.find(s=>s.id===id)||A.store;go("prescOrder");}

/* ════════ PRESCRIPTION ORDER ════════ */
async function rPrescOrder(){
  if(!A.user||A.role!=="patient"){toast("Login as patient first.",true);go("patientLogin");return;}
  const c=$("presc-content");if(!c)return;
  if(!A.cache.allStores||!A.cache.allStores.length){
    A.cache.allStores=await safeGet("medical_stores","approved=eq.true");
  }
  c.innerHTML=`<div style="background:#fff;border-radius:16px;padding:20px;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,.05)">
    ${A.store?`<div style="display:flex;gap:12px;align-items:center;padding:12px;background:#F0FDF4;border-radius:12px;margin-bottom:16px"><span style="font-size:24px">💊</span><div><div style="font-size:14px;font-weight:700;color:#1A2B3C">${safe(A.store.store_name)}</div><div style="font-size:12px;color:#059669">Sending to this store</div></div><button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="A.store=null;rPrescOrder()">Change</button></div>`:
    `<div class="form-group"><label class="form-label">Select Medical Store <span>*</span></label>
      <select id="presc-store-select" class="form-input" onchange="A.store=A.cache.allStores.find(s=>s.id===this.value);rPrescOrder()">
        <option value="">-- Select a store --</option>
        ${(A.cache.allStores||[]).map(s=>`<option value="${s.id}">${safe(s.store_name)} ${s.district?"("+safe(s.district)+")":""}</option>`).join("")}
      </select>
    </div>`}
    <div class="form-group"><label class="form-label">Doctor's Prescription Photo <span>*</span></label>
      <div class="upload-area" id="presc-area" onclick="$('presc-file').click()"><div style="font-size:40px;margin-bottom:8px">📸</div><div style="font-size:14px;font-weight:600;color:#0A7FAF">Click to upload prescription</div><div style="font-size:12px;color:#9CA3AF;margin-top:4px">JPG, PNG, PDF · Max 5MB</div></div>
      <input type="file" id="presc-file" accept="image/*,.pdf" style="display:none" onchange="onPrescFile(event)"/>
      <div id="presc-prev" style="display:none;margin-top:10px"></div>
    </div>
    <div class="form-group"><label class="form-label">Delivery Address <span>*</span></label><textarea id="presc-addr" class="form-input" rows="2" placeholder="Full delivery address..."></textarea></div>
    <div class="form-group"><label class="form-label">Notes</label><input id="presc-notes" class="form-input" placeholder="e.g. Urgent, substitute medicines ok..."/></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px">
      <button id="urg-no" class="slot-btn active" onclick="window._urg=false;$('urg-no').classList.add('active');$('urg-yes').classList.remove('active')">Normal</button>
      <button id="urg-yes" class="slot-btn" onclick="window._urg=true;$('urg-yes').classList.add('active');$('urg-no').classList.remove('active')">🚨 Urgent</button>
    </div>
  </div>
  <button class="btn btn-green btn-full" id="presc-btn" onclick="submitPrescOrder()" style="font-size:15px;padding:14px">📋 Submit Prescription Order</button>`;
  window._urg=false;window._pFile=null;
}
function onPrescFile(e){
  const file=e.target.files[0];if(!file)return;window._pFile=file;
  const prev=$("presc-prev");
  if(file.type.startsWith("image/")){const r=new FileReader();r.onload=ev=>{prev.innerHTML=`<img src="${ev.target.result}" style="width:100%;max-height:200px;object-fit:contain;border-radius:8px;border:1px solid #E5E7EB"/>`;prev.style.display="block";};r.readAsDataURL(file);}
  else{prev.innerHTML=`<div style="padding:10px;background:#F0FDF4;border-radius:8px;color:#059669">📄 ${file.name}</div>`;prev.style.display="block";}
  const a=$("presc-area");if(a){a.style.borderColor="#10B981";a.innerHTML=`<div style="font-size:30px;margin-bottom:6px">✅</div><div style="font-size:13px;font-weight:600;color:#059669">${file.name}</div>`;}
}
async function submitPrescOrder(){
  if(!A.store){toast("Please select a medical store.",true);return;}
  if(!window._pFile){toast("Upload prescription photo.",true);return;}
  const addr=($("presc-addr")||{}).value?.trim();
  if(!addr){toast("Enter delivery address.",true);return;}
  const btn=$("presc-btn");if(btn){btn.disabled=true;btn.textContent="Uploading...";}
  try{
    const file=window._pFile;
    const fileName=A.user.id+"/"+Date.now()+"_"+file.name.replace(/[^a-zA-Z0-9.]/g,"_");
    const upRes=await fetch(`${SURL}/storage/v1/object/medical-records/${fileName}`,{
      method:"POST",
      headers:{"apikey":SKEY,"Authorization":"Bearer "+SKEY,"Content-Type":file.type},
      body:file
    });
    if(!upRes.ok)throw new Error("Prescription upload failed");
    const prescUrl=`${SURL}/storage/v1/object/public/medical-records/${fileName}`;
    if(btn)btn.textContent="Submitting...";
    await safePost("prescription_orders",{
      patient_id:A.user.id,patient_name:A.user.name,patient_phone:A.user.phone,
      store_id:A.store?.id||null,store_name:A.store?.store_name||null,
      prescription_url:prescUrl,delivery_address:addr,
      notes:($("presc-notes")||{}).value||"",is_urgent:window._urg||false,
      status:"pending",payment_mode:"cod"
    },d=>[{...d,id:"rx_"+Date.now()}]);
    if(A.store?.id){
      await sendNotification(A.store.id,"store","New Prescription Order 📋",
        A.user.name+" ("+A.user.phone+") uploaded a prescription.","success");
    }
    toast("Prescription submitted! 🎉 Store will contact you soon.");
    window._pFile=null;go("patientOrders");
  }catch(e){toast("Error: "+e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="📋 Submit Prescription Order";}}
}

/* ════════ PATIENT ORDERS ════════ */
async function rPatientOrders(){
  if(!A.user){go("patientLogin");return;}
  const c=$("orders-content");if(!c)return;spin("orders-content");
  try{
    const orders=await safeGet("prescription_orders","patient_id=eq."+A.user.id);
    const sc2={pending:"#D97706",accepted:"#0A7FAF",packed:"#7C4DFF",delivered:"#059669",completed:"#059669",rejected:"#DC2626"};
    c.innerHTML=orders.length?orders.map(o=>`<div style="background:#fff;border-radius:12px;padding:14px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.05);border-left:4px solid ${sc2[o.status]||"#9CA3AF"}">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:6px">
        <div><div style="font-size:13px;font-weight:700">${safe(o.store_name)||"Sent to nearby stores"}</div><div style="font-size:11px;color:#9CA3AF">${new Date(o.created_at||Date.now()).toLocaleDateString()}</div></div>
        ${pill((o.status||"pending").replace("_"," ").toUpperCase(),(sc2[o.status]||"#9CA3AF")+"22",sc2[o.status]||"#9CA3AF")}
      </div>
      ${o.notes?`<div style="font-size:12px;color:#6B7280">📝 ${o.notes}</div>`:""}
      ${o.is_urgent?`<span style="font-size:11px;background:#FEE2E2;color:#DC2626;padding:2px 8px;border-radius:6px;font-weight:600">🚨 URGENT</span>`:""}
    </div>`).join(""):empty("📋","No orders yet.",`<button class="btn btn-green btn-sm" onclick="A.store=null;go('prescOrder')">Upload Prescription</button>`);
  }catch(e){c.innerHTML=empty("⚠️",e.message);}
}

/* ════════ AMBULANCE ════════ */
async function rAmbulance(){
  const listEl=$("ambu-list");if(!listEl)return;spin("ambu-list");
  try{
    let ambus=await safeGet("ambulances","approved=eq.true","ambus");
    if(!ambus.length)ambus=DEMO.ambus;
    A.cache.ambus=ambus;
    listEl.innerHTML=ambus.map(a=>`<div class="card">
      <div style="display:flex;gap:12px;margin-bottom:10px">
        <div style="width:52px;height:52px;border-radius:12px;background:${a.color||"#EF4444"};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">🚑</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:15px;font-weight:700;color:#1A2B3C">${safe(a.operator_name)}</div>
          <div style="font-size:12px;color:#6B7280">${safe(a.vehicle_type)}</div>
          <div style="font-size:11px;color:#9CA3AF">${safe(a.vehicle_number)||""} · 📍 ${safe(a.base_location||a.district)||"—"}</div>
        </div>
        ${sPill(a.availability_status||"offline")}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="background:#FEF2F2;border-radius:8px;padding:8px;text-align:center"><div style="font-size:10px;color:#9CA3AF;margin-bottom:1px">Base Fare</div><div style="font-size:13px;font-weight:700;color:#DC2626">₹${a.base_fare||0}</div></div>
        <div style="background:#FEF2F2;border-radius:8px;padding:8px;text-align:center"><div style="font-size:10px;color:#9CA3AF;margin-bottom:1px">Per KM</div><div style="font-size:13px;font-weight:700;color:#DC2626">₹${a.per_km_rate||0}</div></div>
        <div style="background:#FEF2F2;border-radius:8px;padding:8px;text-align:center"><div style="font-size:10px;color:#9CA3AF;margin-bottom:1px">Radius</div><div style="font-size:13px;font-weight:700;color:#DC2626">${a.service_radius_km||0}km</div></div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        ${a.has_oxygen?`<span style="font-size:11px;background:#F0FDF4;color:#059669;padding:3px 8px;border-radius:8px">🩸 Oxygen</span>`:""}
        ${a.has_stretcher?`<span style="font-size:11px;background:#F0FDF4;color:#059669;padding:3px 8px;border-radius:8px">🛏️ Stretcher</span>`:""}
        ${a.has_monitor?`<span style="font-size:11px;background:#F0FDF4;color:#059669;padding:3px 8px;border-radius:8px">📊 Monitor</span>`:""}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${a.banner_url?`<img src="${a.banner_url}" style="width:100%;border-radius:12px;max-height:120px;object-fit:cover;margin-bottom:10px"/>`:``}
        <button class="btn btn-outline btn-full" onclick="shareProfile('ambulance','${a.id}','${safe(a.operator_name)}','${safe(a.vehicle_type||'Ambulance')}','${safe(a.district||'')}')" >📤 Share</button>
        <button class="btn btn-outline btn-full" onclick="openLiveTracking('ambulance','${safe(a.operator_name)}','${safe(a.phone)}','${a.latitude||''}','${a.longitude||''}')">📍 Live Track</button>
        <button class="btn btn-outline btn-full" onclick="callWithLogin('${a.phone}')">📞 Call Now</button>
        <a href="${getMapLink(a.operator_name,a.base_location||a.district)}" target="_blank" class="btn btn-outline btn-full">📍 Map</a>
        <button class="btn btn-red btn-full" onclick="callWithLogin('${a.alternate_phone||a.phone}')">🚑 Emergency</button>
      </div>
    </div>`).join("");
  }catch(e){listEl.innerHTML=DEMO.ambus.map(a=>`<div class="card"><div style="font-size:15px;font-weight:700;margin-bottom:8px">${safe(a.operator_name)}</div><button onclick="callWithLogin('${a.phone}')" class="btn btn-red btn-full">📞 ${a.phone}</button></div>`).join("");}
}

/* ════════ LABS ════════ */
async function rLabsPage(){
  const listEl=$("labs-list");if(!listEl)return;spin("labs-list");
  try{
    let labs=await safeGet("diagnostic_labs","approved=eq.true&is_active=eq.true","labs");
    if(!labs.length)labs=DEMO.labs;
    A.cache.labs=labs;
    const tf=($("labs-type")||{}).value||"";
    const fl=tf?labs.filter(l=>l.lab_type===tf):labs;
    listEl.innerHTML=fl.map(l=>labCard(l)).join("");
  }catch(e){listEl.innerHTML=DEMO.labs.map(l=>labCard(l)).join("");}
}
function labCard(l){
  const ti={pathology:"🧪",radiology:"🩻",home_collection:"🏠",full_service:"🔬"};
  return `<div class="card" onclick="A.user?viewLab('${l.id}'):requireLogin('labsPage')">
    <div style="display:flex;gap:12px;margin-bottom:10px">
      <div style="width:52px;height:52px;border-radius:12px;background:${l.color||"#7C4DFF"};display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">${ti[l.lab_type]||"🔬"}</div>
      <div style="flex:1;min-width:0">
        <div class="doc-name">${safe(l.lab_name)}</div>
        <div style="font-size:12px;color:#7C4DFF;font-weight:600">${(l.lab_type||"").replace("_"," ").toUpperCase()}</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">
          ${pill(l.is_available!==false?"🟢 Open":"🔴 Closed",l.is_available!==false?"#D1FAE5":"#FEE2E2",l.is_available!==false?"#059669":"#DC2626")}
          ${l.nabl_accredited?pill("NABL","#D1FAE5","#059669"):""}
          ${l.home_collection?pill("🏠 Home","#EDE9FE","#7C4DFF"):""}
          ${l.rating>0?pill("⭐"+l.rating,"#FEF3C7","#D97706"):""}
        </div>
      </div>
    </div>
    ${l.banner_url?`<img src="${l.banner_url}" style="width:100%;border-radius:10px;max-height:100px;object-fit:cover;margin-bottom:8px"/>`:``}
    <div style="font-size:12px;color:#6B7280;margin-bottom:12px">📍 ${safe(l.address||l.district)||"—"}${l.home_collection?` · 🏠 ₹${l.home_collection_charge}`:""}</div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();callWithLogin('${l.phone}')">📞 Call</button>
      <a href="${getMapLink(l.lab_name||l.name,l.district||l.city)}" target="_blank" class="btn btn-outline btn-sm" onclick="event.stopPropagation()">📍 Map</a>
      <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();shareProfile('lab','${l.id}','${safe(l.lab_name)}','${safe((l.lab_type||'').replace('_',' '))}','${safe(l.district||'')}')" title="Share"> 📤 Share</button>
      <button class="btn btn-purple" style="flex:1;padding:7px 0;font-size:12px" onclick="event.stopPropagation();A.user?viewLab('${l.id}'):requireLogin('labsPage')">Book Tests</button>
    </div>
  </div>`;
}
async function viewLab(id){
  // Cache లో చూడు, లేకపోతే DB నుండి fetch చేయి
  A.lab=A.cache.labs.find(l=>l.id===id)||DEMO.labs.find(l=>l.id===id);
  if(!A.lab){
    try{
      const rows=await dbq("diagnostic_labs?id=eq."+id+"&approved=eq.true");
      if(rows.length)A.lab=rows[0];
    }catch(e){}
  }
  if(A.lab)go("labDetail");
  else toast("Lab details load కాలేదు.",true);
}
async function bookLabTest(labId,testId,testName){
  if(!A.user||A.role!=="patient"){toast("Login as patient to book.",true);go("patientLogin");return;}
  if(window._bookingLab)return;
  window._bookingLab=true;
  const l=A.cache.labs.find(x=>x.id===labId)||DEMO.labs.find(x=>x.id===labId)||A.lab;
  try{
    const existing=await safeGet("lab_bookings",`patient_id=eq.${A.user.id}&test_id=eq.${enc(testId)}&status=eq.booked`);
    if(existing.length){toast("You already booked this test.",true);return;}
    await DB.post("lab_bookings",{
      lab_id:labId,
      patient_id:A.user.id,
      test_id:testId,
      test_name:testName,
      patient_name:A.user.name||"",
      patient_phone:A.user.phone||"",
      patient_address:A.user.address||"",
      status:"booked"
    });
    await sendNotification(labId,"lab","New Test Booking 🧪",
      testName+" booked by "+A.user.name+" (📞 "+A.user.phone+").","success");
    toast("Test booked! 🧪 "+(l?l.lab_name+" will contact you.":""));
  }catch(e){toast(e.message,true);}
  finally{window._bookingLab=false;}
}
async function rLabDetail(){
  const l=A.lab;if(!l){go("labsPage");return;}
  const c=$("lab-detail-content");if(!c)return;spin("lab-detail-content");
  let tests=[];try{tests=await DB.get("lab_tests",`lab_id=eq.${l.id}&is_active=eq.true`);}catch{tests=DEMO.labTests?DEMO.labTests.filter(t=>t.lab_id===l.id):[];}
  const groups={};tests.forEach(t=>{groups[t.category]=groups[t.category]||[];groups[t.category].push(t);});
  const cc={Blood:"#FF4757",Urine:"#FF6B35",Radiology:"#2196F3",Package:"#009688",Special:"#F59E0B"};
  c.innerHTML=`<div class="profile-header">
    <div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap">
      <div style="width:64px;height:64px;border-radius:16px;background:${l.color||"#7C4DFF"};display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0">🔬</div>
      <div style="flex:1;min-width:160px"><h2 style="font-size:20px;font-weight:800;color:#1A2B3C;margin-bottom:3px">${safe(l.lab_name)}</h2>
        <div style="font-size:13px;color:#7C4DFF;font-weight:600">${(l.lab_type||"").replace("_"," ").toUpperCase()}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${l.nabl_accredited?pill("✓ NABL","#D1FAE5","#059669"):""}${l.home_collection?pill("🏠 Home Collection","#EDE9FE","#7C4DFF"):""}</div>
      </div>
    </div>
    <div class="profile-info-grid">${[["📞","Phone",l.phone],["📍","Address",l.address||l.district],["🏠","Home Collection",l.home_collection?"₹"+l.home_collection_charge+" charge":"Not Available"],["📋","License",l.lab_registration_no||"—"],["⭐","Rating",l.rating>0?l.rating+"/5":"New"]].map(([ic,lb,v])=>`<div class="profile-info-item"><div class="profile-info-lbl">${ic} ${lb}</div><div class="profile-info-val">${safe(v)||"—"}</div></div>`).join("")}</div>
    <button onclick="shareProfile('lab','${l.id}','${safe(l.lab_name)}','${safe((l.lab_type||'').replace('_',' '))}','${safe(l.district||'')}')" class="btn btn-outline btn-full" style="margin-bottom:8px">📤 Share</button>
    <button class="btn btn-outline btn-full" onclick="callWithLogin('${l.phone}')">📞 Call to Book</button>
  </div>
  <div style="font-size:16px;font-weight:700;color:#1A2B3C;margin-bottom:14px">Available Tests (${tests.length})</div>
  ${Object.entries(groups).map(([cat,ct])=>`<div style="background:#fff;border-radius:14px;margin-bottom:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.05)">
    <div style="padding:12px 16px;background:${cc[cat]||"#0A7FAF"}18;font-size:13px;font-weight:700;color:${cc[cat]||"#0A7FAF"}">${cat} (${ct.length})</div>
    ${ct.map(t=>`<div style="padding:12px 16px;border-bottom:1px solid #F3F4F6;display:flex;align-items:center;gap:10px">
      <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600;color:#1A2B3C">${A.lang==="te"&&t.test_name_te?t.test_name_te:t.test_name}</div>
        <div style="display:flex;gap:6px;margin-top:3px;flex-wrap:wrap">
          ${t.fasting_required?`<span style="font-size:10px;color:#D97706;background:#FFFBEB;padding:1px 6px;border-radius:4px">Fasting</span>`:""}
          ${t.home_available?`<span style="font-size:10px;color:#7C4DFF;background:#F5F3FF;padding:1px 6px;border-radius:4px">Home</span>`:""}
          <span style="font-size:10px;color:#6B7280">⏱ ${t.report_time||"Same Day"}</span>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:13px;font-weight:600;color:#7C4DFF">₹${t.price||0}</div>
        ${t.discount>0?`<div style="font-size:10px;color:#059669;font-weight:600">${t.discount}% off</div>`:""}
        <button class="btn btn-purple" style="padding:5px 12px;font-size:11px;margin-top:4px" onclick="this.disabled=true;this.textContent='Booking...';bookLabTest('${l.id}','${t.id}','${safe(t.test_name).replace(/'/g,"\\'")}').then(()=>{this.textContent='Book';this.disabled=false;})">Book</button>
      </div>
    </div>`).join("")}
  </div>`).join("")||`<div class="empty"><div class="empty-icon">🧪</div><div class="empty-msg">No tests added yet. Call the lab.</div></div>`}`;
}


/* ════════ EDIT PROFILE ════════ */
function showEditProfile(role){
  const u=A.user;
  const fields={
    doctor:[
      {id:"ep-name",label:"Name",val:u.name},
      {id:"ep-phone",label:"Phone",val:u.phone},
      {id:"ep-hospital",label:"Hospital",val:u.hospital},
      {id:"ep-location",label:"Location",val:u.location||u.city||u.district},
      {id:"ep-exp",label:"Experience (yrs)",val:u.experience,type:"number"},
      {id:"ep-fee",label:"Consultation Fee (₹)",val:u.fee,type:"number"},
      {id:"ep-about",label:"About",val:u.about,type:"textarea"},
      {id:"ep-qual",label:"Qualifications",val:u.qualifications},
    ],
    store:[
      {id:"ep-name",label:"Store Name",val:u.store_name},
      {id:"ep-phone",label:"Phone",val:u.phone},
      {id:"ep-addr",label:"Address",val:u.address},
      {id:"ep-about",label:"About",val:u.about,type:"textarea"},
    ],
    ambulance:[
      {id:"ep-name",label:"Operator Name",val:u.operator_name},
      {id:"ep-phone",label:"Phone",val:u.phone},
      {id:"ep-veh",label:"Vehicle Number",val:u.vehicle_number},
      {id:"ep-pricing",label:"Pricing Info",val:u.pricing_info},
      {id:"ep-loc",label:"Base Location",val:u.base_location},
    ],
    lab:[
      {id:"ep-name",label:"Lab Name",val:u.lab_name},
      {id:"ep-phone",label:"Phone",val:u.phone},
      {id:"ep-addr",label:"Address",val:u.address},
      {id:"ep-about",label:"About",val:u.about,type:"textarea"},
    ],
  }[role]||[];

  const html=`<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:9000;overflow-y:auto;padding:20px">
    <div style="background:#fff;border-radius:16px;padding:20px;max-width:480px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="font-size:16px;font-weight:700">✏️ Edit Profile</h3>
        <button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;font-size:20px;color:#9CA3AF;cursor:pointer">✕</button>
      </div>
      ${fields.map(f=>f.type==="textarea"?
        `<div class="form-group"><label class="form-label">${f.label}</label><textarea id="${f.id}" class="form-input" rows="3" style="resize:none">${safe(f.val||"")}</textarea></div>`:
        `<div class="form-group"><label class="form-label">${f.label}</label><input id="${f.id}" type="${f.type||"text"}" class="form-input" value="${safe(f.val||"")}"/></div>`
      ).join("")}
      
      <!-- Banner Upload -->
      <div class="form-group">
        <label class="form-label">📸 Profile Banner (offers, rates, etc.)</label>
        ${u.banner_url?`<img src="${u.banner_url}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px"/>`:``}
        <input type="file" id="ep-banner" accept="image/*" class="form-input"/>
      </div>
      
      <button class="btn btn-primary btn-full" onclick="saveEditProfile('${role}')">💾 Save Changes</button>
    </div>
  </div>`;
  const div=document.createElement("div");
  div.id="edit-profile-modal";
  div.innerHTML=html;
  document.body.appendChild(div);
}

async function saveEditProfile(role){
  const btn=document.querySelector("#edit-profile-modal .btn-primary");
  if(btn){btn.disabled=true;btn.textContent="Saving...";}
  try{
    const tbl={doctor:"doctors",store:"medical_stores",ambulance:"ambulances",lab:"diagnostic_labs"}[role];
    const updates={};

    // Collect fields
    ["ep-name","ep-phone","ep-hospital","ep-location","ep-exp","ep-fee",
     "ep-about","ep-qual","ep-addr","ep-veh","ep-pricing","ep-loc"].forEach(id=>{
      const el=document.getElementById(id);
      if(el){
        const key={
          "ep-name":role==="doctor"?"name":role==="store"?"store_name":role==="lab"?"lab_name":"operator_name",
          "ep-phone":"phone","ep-hospital":"hospital","ep-location":"location",
          "ep-exp":"experience","ep-fee":"fee","ep-about":"about","ep-qual":"qualifications",
          "ep-addr":"address","ep-veh":"vehicle_number","ep-pricing":"pricing_info","ep-loc":"base_location"
        }[id];
        if(key)updates[key]=el.type==="number"?parseInt(el.value)||0:el.value;
      }
    });

    // Banner upload
    const bannerFile=document.getElementById("ep-banner")?.files?.[0];
    if(bannerFile){
      const fileName=A.user.id+"/banner_"+Date.now()+"."+bannerFile.name.split(".").pop();
      const res=await fetch(`${SURL}/storage/v1/object/medical-records/${fileName}`,{
        method:"POST",
        headers:{"apikey":SKEY,"Authorization":"Bearer "+SKEY,"Content-Type":bannerFile.type},
        body:bannerFile
      });
      if(res.ok)updates.banner_url=`${SURL}/storage/v1/object/public/medical-records/${fileName}`;
    }

    await DB.patch(tbl,"id=eq."+A.user.id,updates);
    Object.assign(A.user,updates);
    S.save(A.user,role);
    document.getElementById("edit-profile-modal")?.remove();
    toast("Profile updated! ✅");
    if(role==="doctor")rDoctorDash();
    else if(role==="store")rStoreDash();
    else if(role==="ambulance")rAmbuDash();
    else if(role==="lab")rLabDash();
    else if(role==="homeprovider")rHPDash();
    else if(role==="hospital")rHospitalDash();
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="💾 Save Changes";}}
}

/* ════════ INIT ════════ */

/* ════════ ADVERTISEMENTS ════════ */
async function loadAds(){
  try{
    const ads=await safeGet("advertisements","is_active=eq.true");
    // Splash ad
    const splash=ads.find(a=>a.ad_type==="splash");
    if(splash){
      const div=document.createElement("div");
      div.id="splash-ad";
      div.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer";
      const isVideo=splash.image_url&&(splash.image_url.includes(".mp4")||splash.image_url.includes("video"));
      div.innerHTML=`<div style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.2);color:#fff;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600" id="ad-timer">Skip in 15s</div>
        ${isVideo?`<video src="${splash.image_url}" autoplay muted loop style="max-width:100%;max-height:80vh;object-fit:contain"></video>`:
        splash.image_url?`<img src="${splash.image_url}" style="max-width:100%;max-height:80vh;object-fit:contain"/>`:
        `<div style="color:#fff;font-size:24px;font-weight:800;text-align:center;padding:40px">${safe(splash.title)}</div>`}`;
      div.onclick=()=>{if(splash.link_url)window.open(splash.link_url,"_blank");div.remove();};
      document.body.appendChild(div);
      let secs=15;
      const timer=setInterval(()=>{
        secs--;
        const el=document.getElementById("ad-timer");
        if(el)el.textContent=secs>0?"Skip in "+secs+"s":"✕ Skip";
        if(secs<=0){clearInterval(timer);div.remove();}
      },1000);
    }
    // Banner ads - carousel for multiple
    const banners=ads.filter(a=>a.ad_type==="banner");
    const bc=document.getElementById("home-banner-ad");
    if(bc&&banners.length){
      bc.style.display="block";
      let bIdx=0;
      const renderBanner=()=>{
        const banner=banners[bIdx];
        const isVid=banner.image_url&&(banner.image_url.includes(".mp4")||banner.image_url.includes("video"));
        bc.innerHTML=banner.image_url?
          `<div style="position:relative;width:100%;border-radius:12px;overflow:hidden;cursor:pointer;margin-bottom:16px;transition:opacity 0.3s" onclick="${banner.link_url?`window.open('${banner.link_url}','_blank')`:''}">
          ${isVid?`<video src="${banner.image_url}" autoplay muted loop style="width:100%;display:block;border-radius:12px;object-fit:cover"></video>`:
          `<img src="${banner.image_url}" style="width:100%;display:block;border-radius:12px;object-fit:cover"/>`}
          <div style="position:absolute;left:0;right:0;bottom:0;background:linear-gradient(transparent,rgba(0,0,0,0.65));padding:18px 16px 10px;display:flex;align-items:center">
            <div style="flex:1"><div style="color:#fff;font-size:14px;font-weight:700">${safe(banner.title)}</div>
            <div style="color:rgba(255,255,255,0.8);font-size:11px;margin-top:2px">Sponsored ${banners.length>1?"· "+(bIdx+1)+"/"+banners.length:""}</div></div>
            <div style="color:rgba(255,255,255,0.8);font-size:18px">›</div>
          </div>
        </div>`:
          `<div style="background:linear-gradient(135deg,#0A7FAF,#074E7A);border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;margin-bottom:16px;transition:opacity 0.3s" onclick="${banner.link_url?`window.open('${banner.link_url}','_blank')`:''}">
          <div style="width:60px;height:60px;border-radius:8px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:28px">📢</div>
          <div style="flex:1"><div style="color:#fff;font-size:14px;font-weight:700">${safe(banner.title)}</div>
          <div style="color:rgba(255,255,255,0.8);font-size:11px;margin-top:2px">Sponsored ${banners.length>1?"· "+(bIdx+1)+"/"+banners.length:""}</div></div>
          <div style="color:rgba(255,255,255,0.6);font-size:18px">›</div>
        </div>`;
      };
      renderBanner();
      if(banners.length>1){
        setInterval(()=>{bIdx=(bIdx+1)%banners.length;renderBanner();},5000);
      }
    }
  }catch{}
}

/* ════════ MEDICAL RECORDS ════════ */
async function loadMedicalRecords(){
  if(!A.user||A.role!=="patient")return;
  const c=$("mr-list");if(!c)return;
  spin("mr-list");
  try{
    const records=await safeGet("medical_records",`patient_id=eq.${A.user.id}`);
    if(!records.length){c.innerHTML=empty("📋","No records yet. Upload your first record!");return;}
    // Group by date
    const grouped={};
    records.forEach(r=>{
      const d=r.record_date||r.created_at?.split("T")[0]||"Unknown";
      if(!grouped[d])grouped[d]=[];
      grouped[d].push(r);
    });
    c.innerHTML=Object.keys(grouped).sort((a,b)=>b.localeCompare(a)).map(date=>`
      <div style="margin-bottom:16px">
        <div style="font-size:13px;font-weight:700;color:#6B7280;margin-bottom:8px;padding:6px 12px;background:#F3F4F6;border-radius:8px">📅 ${date}</div>
        ${grouped[date].map(r=>`<div class="card" style="margin-bottom:8px">
          <div style="display:flex;gap:12px;align-items:center">
            <div style="width:40px;height:40px;border-radius:8px;background:#E3F4FC;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">
              ${r.file_type?.includes("image")?"🖼️":r.file_type?.includes("pdf")?"📄":"📋"}
            </div>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:600;color:#1A2B3C">${safe(r.file_name)}</div>
              ${r.notes?`<div style="font-size:11px;color:#6B7280;margin-top:2px">${safe(r.notes)}</div>`:""}
            </div>
            <a href="${r.file_url}" target="_blank" class="btn btn-outline btn-sm">View</a>
            <button class="btn btn-red btn-sm" onclick="deleteMedicalRecord('${r.id}')"> 🗑️ Delete</button>
          </div>
        </div>`).join("")}
      </div>`).join("");
  }catch(e){c.innerHTML=empty("❌","Error loading records.");}
}

async function uploadMedicalRecord(){
  const fileInput=$("mr-file");
  const notes=$("mr-notes")?.value||"";
  if(!fileInput?.files?.length){toast("Please select a file.",true);return;}
  const file=fileInput.files[0];
  if(file.size>5*1024*1024){toast("File too large. Max 5MB.",true);return;}
  const btn=$("mr-upload-btn");if(btn){btn.disabled=true;btn.textContent="Uploading...";}
  try{
    // Upload to Supabase Storage
    const fileName=A.user.id+"/"+Date.now()+"_"+file.name;
    const res=await fetch(`${SURL}/storage/v1/object/medical-records/${fileName}`,{
      method:"POST",
      headers:{"apikey":SKEY,"Authorization":"Bearer "+SKEY,"Content-Type":file.type},
      body:file
    });
    if(!res.ok)throw new Error("Upload failed");
    const fileUrl=`${SURL}/storage/v1/object/public/medical-records/${fileName}`;
    await safePost("medical_records",{
      patient_id:A.user.id,
      file_name:file.name,
      file_url:fileUrl,
      file_type:file.type,
      notes:notes,
      record_date:new Date().toISOString().split("T")[0]
    });
    toast("Record uploaded! ✅");
    if(fileInput)fileInput.value="";
    if($("mr-notes"))$("mr-notes").value="";
    loadMedicalRecords();
  }catch(e){toast(e.message||"Upload failed",true);}
  finally{if(btn){btn.disabled=false;btn.textContent="📤 Upload";}}
}
async function deleteMedicalRecord(id){
  if(!confirm("Delete this record?"))return;
  try{
    await DB.del("medical_records","id=eq."+id);
    toast("Record deleted.");
    loadMedicalRecords();
  }catch(e){toast(e.message,true);}
}


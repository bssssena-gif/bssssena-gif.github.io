/* DocNear V3 – Complete Production App */
const SURL = "https://avonzvocvonvzamedwvh.supabase.co";
const SKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2b256dm9jdm9udnphbWVkd3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODYwNzgsImV4cCI6MjA5NTQ2MjA3OH0.bU2WLrqDnTEggKnLvJjY07VyNATfIyMGppTw7FWD50w";
const SK   = "dn_session_v3";

/* ── SHA-256 ── */
async function sha(s){
  try{const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,"0")).join("");}
  catch{return s;}
}

/* ── Supabase ── */
async function dbq(path,o={}){
  const r=await fetch(SURL+"/rest/v1/"+path,{
    headers:{"apikey":SKEY,"Authorization":"Bearer "+SKEY,"Content-Type":"application/json","Prefer":o.prefer||"return=representation",...o.headers},
    method:o.method||"GET",body:o.body?JSON.stringify(o.body):undefined
  });
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.message||"DB Error "+r.status);}
  const t=await r.text();return t?JSON.parse(t):[];
}
const DB={
  get:(t,q="")=>dbq(t+"?"+(q?q+"&":"")+"order=created_at.desc"),
  post:(t,d)=>dbq(t,{method:"POST",body:d}),
  patch:(t,f,d)=>dbq(t+"?"+f,{method:"PATCH",body:d,prefer:"return=representation"}),
  del:(t,f)=>dbq(t+"?"+f,{method:"DELETE",prefer:"return=minimal"})
};

/* ── Session ── */
const S={
  save(u,r){try{localStorage.setItem(SK,JSON.stringify({u,r,t:Date.now()}));}catch{}},
  load(){try{const d=JSON.parse(localStorage.getItem(SK)||"null");if(!d||Date.now()-d.t>8*3600000){this.clear();return null;}return d;}catch{return null;}},
  clear(){try{localStorage.removeItem(SK);}catch{}}
};

/* ── State ── */
const A={
  user:null,role:null,lang:localStorage.getItem("dn_lang")||"en",
  doc:null,store:null,lab:null,ambu:null,
  slot:"",type:"inperson",q:"",spec:"",
  cache:{docs:[],pats:[],stores:[],labs:[],ambus:[],appts:[],notifs:[]},
  demo:false
};

/* ── Specializations ── */
const SPECS=[
  {n:"Cardiology",i:"❤️",c:"#FF4757"},{n:"Neurology",i:"🧠",c:"#7C4DFF"},
  {n:"Orthopedics",i:"🦴",c:"#FF6B35"},{n:"Pediatrics",i:"👶",c:"#00BCD4"},
  {n:"Ophthalmology",i:"👁️",c:"#2196F3"},{n:"Dermatology",i:"✨",c:"#E91E8C"},
  {n:"General Medicine",i:"🏥",c:"#009688"},{n:"Gynecology",i:"🌸",c:"#E91E63"},
  {n:"Dentistry",i:"🦷",c:"#00ACC1"},{n:"Ayurveda",i:"🌿",c:"#43A047"},
  {n:"ENT",i:"👂",c:"#FB8C00"},{n:"Psychiatry",i:"🧘",c:"#8E24AA"},
  {n:"Urology",i:"💊",c:"#1E88E5"},{n:"Oncology",i:"🎗️",c:"#D81B60"}
];

/* ── Subscription Plans ── */
const PLANS={
  doctor:[
    {id:"monthly",name:"Monthly",price:499,period:"/month",popular:false,features:["Unlimited appointments","Patient notifications","Video consult link","Basic analytics"]},
    {id:"yearly",name:"Yearly",price:3999,period:"/year",popular:true,features:["Everything in Monthly","Priority listing","Advanced analytics","WhatsApp alerts","Save ₹2000"]}
  ],
  ambulance:[
    {id:"basic",name:"Basic",price:299,period:"/month",popular:false,features:["Listed on DocNear","Emergency calls","Location display"]},
    {id:"pro",name:"Pro",price:799,period:"/month",popular:true,features:["Priority listing","GPS tracking badge","Response time display","5 star rating system"]}
  ],
  lab:[
    {id:"starter",name:"Starter",price:399,period:"/month",popular:false,features:["List up to 20 tests","Online bookings","Patient notifications"]},
    {id:"growth",name:"Growth",price:999,period:"/month",popular:true,features:["Unlimited tests","Home collection orders","Priority listing","Analytics dashboard"]}
  ]
};

/* ── Demo Data ── */
const DEMO={
  docs:[
    {id:"d1",name:"Dr. Priya Sharma",email:"priya@docnear.com",phone:"+91 98765 43210",specialization:"Cardiology",reg_number:"MCI-2019-45231",hospital:"Apollo Hospitals",city:"Hyderabad",district:"Hyderabad",state_code:"TS",experience:12,fee:800,rating:4.8,reviews:234,approved:true,color:"#FF4757",slots:["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM","4:00 PM"],video_consult:true,about:"Specialist in interventional cardiology with 12 years experience.",qualifications:"MBBS, MD (Cardiology), DM",subscription:"yearly"},
    {id:"d2",name:"Dr. Rajesh Kumar",email:"rajesh@docnear.com",phone:"+91 98765 12345",specialization:"Neurology",reg_number:"MCI-2017-32145",hospital:"KIMS Hospital",city:"Hyderabad",district:"Hyderabad",state_code:"TS",experience:15,fee:1200,rating:4.9,reviews:312,approved:true,color:"#7C4DFF",slots:["10:00 AM","11:00 AM","3:00 PM","4:00 PM"],video_consult:true,about:"Senior Neurologist specializing in epilepsy and stroke.",qualifications:"MBBS, DM (Neurology)",subscription:"yearly"},
    {id:"d3",name:"Dr. Sunita Reddy",email:"sunita@docnear.com",phone:"+91 87654 32109",specialization:"Pediatrics",reg_number:"MCI-2020-67890",hospital:"Rainbow Hospital",city:"Hyderabad",district:"Hyderabad",state_code:"TS",experience:8,fee:600,rating:4.7,reviews:189,approved:true,color:"#00BCD4",slots:["9:00 AM","10:00 AM","11:00 AM","2:00 PM"],video_consult:false,about:"Dedicated pediatrician.",qualifications:"MBBS, MD (Pediatrics)",subscription:"monthly"},
    {id:"d4",name:"Dr. Vikram Rao",email:"vikram@docnear.com",phone:"+91 95543 21098",specialization:"General Medicine",reg_number:"MCI-2018-55432",hospital:"Medicover Hospital",city:"Hyderabad",district:"Hyderabad",state_code:"TS",experience:10,fee:500,rating:4.7,reviews:560,approved:true,color:"#009688",slots:["8:00 AM","9:00 AM","10:00 AM","11:00 AM"],video_consult:false,about:"General physician with holistic approach.",qualifications:"MBBS, MD",subscription:"monthly"}
  ],
  pats:[
    {id:"p1",name:"Ananya Patel",email:"ananya@gmail.com",phone:"+91 98765 00001",age:28,blood_group:"O+",gender:"Female"},
    {id:"p2",name:"Vikram Singh",email:"vikram@gmail.com",phone:"+91 98765 00002",age:45,blood_group:"A+",gender:"Male"}
  ],
  stores:[
    {id:"s1",store_name:"Apollo Pharmacy",owner_name:"Ravi Kumar",email:"apollo@store.com",phone:"+91 98765 11111",district:"Hyderabad",state_code:"TS",address:"Banjara Hills, Hyderabad",is_24x7:true,delivery_available:true,delivery_radius_km:10,approved:true,color:"#10B981",rating:4.5,opening_time:"00:00",closing_time:"23:59"},
    {id:"s2",store_name:"MedPlus Pharmacy",owner_name:"Suresh Reddy",email:"medplus@store.com",phone:"+91 98765 22222",district:"Hyderabad",state_code:"TS",address:"Jubilee Hills, Hyderabad",is_24x7:false,delivery_available:true,delivery_radius_km:5,approved:true,color:"#059669",rating:4.3,opening_time:"08:00",closing_time:"22:00"}
  ],
  ambus:[
    {id:"a1",operator_name:"Srinivas Rao",email:"ambu1@docnear.com",phone:"+91 99001 11111",alternate_phone:"+91 99001 11112",district:"Hyderabad",state_code:"TS",base_location:"Jubilee Hills",vehicle_type:"Advanced Life Support",vehicle_number:"TS 09 AB 1234",base_fare:500,per_km_rate:20,night_charge_extra:200,service_radius_km:25,has_oxygen:true,has_stretcher:true,has_monitor:true,approved:true,availability_status:"available",color:"#EF4444",rating:4.8,subscription:"pro"},
    {id:"a2",operator_name:"Ramesh Kumar",email:"ambu2@docnear.com",phone:"+91 99002 22222",alternate_phone:"+91 99002 22223",district:"Hyderabad",state_code:"TS",base_location:"Secunderabad",vehicle_type:"Basic Life Support",vehicle_number:"TS 09 CD 5678",base_fare:350,per_km_rate:15,night_charge_extra:150,service_radius_km:30,has_oxygen:true,has_stretcher:true,has_monitor:false,approved:true,availability_status:"available",color:"#DC2626",rating:4.5,subscription:"basic"}
  ],
  labs:[
    {id:"l1",lab_name:"Vijaya Diagnostics",owner_name:"Dr. Vijay Kumar",email:"vijaya@lab.com",phone:"+91 98111 11111",district:"Hyderabad",state_code:"TS",address:"Banjara Hills",lab_type:"full_service",nabl_accredited:true,home_collection:true,home_collection_charge:150,approved:true,color:"#7C4DFF",rating:4.7,subscription:"growth"},
    {id:"l2",lab_name:"Apollo Diagnostics",owner_name:"Raju Sharma",email:"apollo@lab.com",phone:"+91 98111 22222",district:"Hyderabad",state_code:"TS",address:"Jubilee Hills",lab_type:"pathology",nabl_accredited:false,home_collection:true,home_collection_charge:100,approved:true,color:"#8B5CF6",rating:4.4,subscription:"starter"}
  ],
  appts:[
    {id:"ap1",patient_id:"p1",patient_name:"Ananya Patel",doctor_id:"d1",doctor_name:"Dr. Priya Sharma",specialization:"Cardiology",date:new Date(Date.now()+86400000).toISOString().split("T")[0],slot:"10:00 AM",status:"confirmed",fee:800,payment_status:"paid",is_video:false},
    {id:"ap2",patient_id:"p1",patient_name:"Ananya Patel",doctor_id:"d2",doctor_name:"Dr. Rajesh Kumar",specialization:"Neurology",date:new Date(Date.now()+172800000).toISOString().split("T")[0],slot:"3:00 PM",status:"confirmed",fee:1200,payment_status:"paid",is_video:true,meeting_link:"https://meet.jit.si/docnear-demo-001"}
  ],
  labTests:[
    {id:"lt1",lab_id:"l1",test_name:"Complete Blood Count (CBC)",test_name_te:"పూర్తి రక్త పరీక్ష",category:"Blood",price:250,discount:10,home_available:true,report_time:"Same Day",fasting_required:false},
    {id:"lt2",lab_id:"l1",test_name:"Blood Sugar (Fasting)",test_name_te:"చక్కెర పరీక్ష",category:"Blood",price:150,discount:0,home_available:true,report_time:"Same Day",fasting_required:true},
    {id:"lt3",lab_id:"l1",test_name:"Thyroid Profile (T3,T4,TSH)",test_name_te:"థైరాయిడ్",category:"Blood",price:600,discount:15,home_available:true,report_time:"24 Hours",fasting_required:true},
    {id:"lt4",lab_id:"l1",test_name:"Full Body Checkup",test_name_te:"పూర్తి శరీర పరీక్ష",category:"Package",price:2500,discount:20,home_available:true,report_time:"48 Hours",fasting_required:true},
    {id:"lt5",lab_id:"l2",test_name:"HbA1c (Diabetes)",test_name_te:"మధుమేహ పరీక్ష",category:"Blood",price:450,discount:10,home_available:true,report_time:"Same Day",fasting_required:false},
    {id:"lt6",lab_id:"l2",test_name:"Vitamin D",test_name_te:"విటమిన్ డి",category:"Blood",price:800,discount:0,home_available:true,report_time:"48 Hours",fasting_required:false},
    {id:"lt7",lab_id:"l2",test_name:"X-Ray Chest",test_name_te:"ఛాతీ ఎక్స్-రే",category:"Radiology",price:250,discount:0,home_available:false,report_time:"Same Day",fasting_required:false},
    {id:"lt8",lab_id:"l2",test_name:"Ultrasound Abdomen",test_name_te:"అల్ట్రాసౌండ్",category:"Radiology",price:600,discount:0,home_available:false,report_time:"Same Day",fasting_required:false}
  ]
};

/* ════════ UTILS ════════ */
const $=id=>document.getElementById(id);
const gv=id=>($( id)||{}).value?.trim()||"";
const enc=s=>encodeURIComponent(s||"");
const safe=s=>s||"";
const td=()=>new Date().toISOString().split("T")[0];
const ini=n=>safe(n).split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

function avt(n,c="#0A7FAF",sz=48,photoUrl=""){
  if(photoUrl)return `<img src="${photoUrl}" style="width:${sz}px;height:${sz}px;border-radius:50%;object-fit:cover;flex-shrink:0" onerror="this.style.display='none';this.nextSibling.style.display='flex'" /><div class="avatar" style="width:${sz}px;height:${sz}px;background:${c};font-size:${Math.round(sz*.35)}px;display:none">${ini(n)}</div>`;
  return `<div class="avatar" style="width:${sz}px;height:${sz}px;background:${c};font-size:${Math.round(sz*.35)}px">${ini(n)}</div>`;
}
function pill(l,bg="#E3F4FC",c="#0A7FAF"){
  return `<span class="pill" style="background:${bg};color:${c}">${l}</span>`;
}
function sPill(s){
  const m={confirmed:["#D1FAE5","#059669"],pending:["#FEF3C7","#D97706"],cancelled:["#FEE2E2","#DC2626"],completed:["#EDE9FE","#7C4DFF"],available:["#D1FAE5","#059669"],busy:["#FEF3C7","#D97706"],offline:["#F3F4F6","#9CA3AF"]};
  const[bg,c]=m[s]||m.pending;return pill(s.toUpperCase(),bg,c);
}
function toast(msg,err=false){
  const el=$("toast");if(!el)return;
  el.style.background=err?"#EF4444":"#10B981";el.style.color="#fff";
  el.textContent=(err?"❌ ":"✅ ")+msg;el.style.display="block";
  clearTimeout(el._t);el._t=setTimeout(()=>el.style.display="none",4200);
}
function spin(id,msg="Loading..."){const el=$(id);if(el)el.innerHTML=`<div class="loading-box"><div class="spinner"></div>${msg}</div>`;}
function sc(ic,lb,v,bg="#E3F4FC",vc="#0A7FAF",scrollTo=""){
  const click=scrollTo?`onclick="document.getElementById('${scrollTo}')?.scrollIntoView({behavior:'smooth'})" style="cursor:pointer"`:"";
    return `<div class="stat-card" ${click}><div class="stat-icon" style="background:${bg}">${ic}</div><div><div class="stat-val" style="color:${vc}">${v}</div><div class="stat-lbl">${lb}</div></div></div>`;
}
function empty(ic,msg,btn=""){
  return `<div class="empty"><div class="empty-icon">${ic}</div><div class="empty-msg">${msg}</div>${btn}</div>`;
}

/* ── DB with fallback ── */
async function safeGet(tbl,q="",dk=""){
  try{const r=await DB.get(tbl,q);return r;}
  catch(e){A.demo=true;return dk&&DEMO[dk]?DEMO[dk]:[];}
}
async function safePost(tbl,data,fb=null){
  try{return await DB.post(tbl,data);}
  catch(e){if(A.demo&&fb)return fb(data);throw e;}
}

/* ════════ NAVIGATION ════════ */
function showPage(pg){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  const el=document.getElementById("page-"+pg);
  if(el)el.classList.add("active");
  window.scrollTo(0,0);
}

function go(pg){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  const el=$("page-"+pg);if(!el)return;
  el.classList.add("active");window.scrollTo(0,0);
  history.pushState({page:pg},"",window.location.pathname);
  const map={
    landing:rLanding,search:rSearch,
    patientDash:rPatientDash,doctorDash:rDoctorDash,
    storeDash:rStoreDash,ambuDash:rAmbuDash,labDash:rLabDash,
    profile:rProfile,book:rBook,
    stores:rStores,storeDetail:rStoreDetail,
    ambulance:rAmbulance,labsPage:rLabsPage,labDetail:rLabDetail,
    prescOrder:rPrescOrder,patientOrders:rPatientOrders,
    bloodBank:rBloodBank,aiSymptom:rAiSymptom,healthDash:rHealthDash,
    homeServices:rHomeServices,
    hpLogin:()=>showPage('hpLogin'),hpReg:()=>showPage('hpReg'),hpPending:()=>showPage('hpPending'),hpDash:rHPDash,
    hospitalLogin:()=>showPage('hospitalLogin'),hospitalReg:()=>showPage('hospitalReg'),hospitalPending:()=>showPage('hospitalPending'),hospitalDash:rHospitalDash,
    hospitalsPage:loadHospitals,socialFeed:rSocialFeed
  };
  if(map[pg])map[pg]();
}
/* Login అయి ఉంటే directly వెళ్ళు, లేకపోతే patient login కి వెళ్ళు */
/* Phone call — login అయి ఉంటే directly call, లేకపోతే login కి */
function callWithLogin(phone){
  if(!phone||phone==="undefined"||phone==="null")return;
  if(A.user){
    window.location.href="tel:"+phone;
  }else{
    toast("Call చేయడానికి login చేయండి",true);
    setTimeout(()=>go("patientLogin"),1000);
  }
}

function requireLogin(page){
  if(A.user&&A.role==="patient"){
    go(page);
  }else if(A.user){
    // Other roles — patient features కి patient login చెప్పు
    toast("Patient గా login చేయండి",true);
    go("patientLogin");
  }else{
    // Not logged in — patient login కి వెళ్ళు, తర్వాత redirect
    A.pendingPage=page;
    go("patientLogin");
  }
}


/* ════════════════════════════════════════════
   PHOTO UPLOAD — All Providers
════════════════════════════════════════════ */
async function uploadProfilePhoto(file, role, userId){
  if(!file)return null;
  if(file.size > 2*1024*1024){toast("Photo 2MB కంటే తక్కువగా ఉండాలి",true);return null;}
  
  const ext = file.name.split('.').pop().toLowerCase();
  const allowed = ['jpg','jpeg','png','webp'];
  if(!allowed.includes(ext)){toast("JPG, PNG, WebP మాత్రమే upload చేయవచ్చు",true);return null;}
  
  try{
    const fileName = `${role}/${userId}/profile.${ext}`;
    
    const res = await fetch(`${SURL}/storage/v1/object/profiles/${fileName}`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + SKEY,
        "Content-Type": file.type,
        "x-upsert": "true"
      },
      body: file
    });
    
    if(!res.ok){
      const err = await res.json().catch(()=>({}));
      throw new Error(err.message||"Upload failed — bucket permissions check చేయండి");
    }
    return `${SURL}/storage/v1/object/public/profiles/${fileName}`;
  }catch(e){
    toast("Photo upload failed: " + e.message, true);
    return null;
  }
}

function showPhotoUpload(role, userId, currentPhotoUrl){
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:24px;max-width:340px;width:100%">
      <div style="font-size:16px;font-weight:700;color:#1A2B3C;margin-bottom:16px">📷 Profile Photo Upload</div>
      ${currentPhotoUrl ? `<img src="${currentPhotoUrl}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;margin-bottom:12px;display:block"/>` : ''}
      <input type="file" id="photo-upload-input" accept="image/jpeg,image/png,image/webp" 
        style="width:100%;margin-bottom:12px;padding:8px;border:1px solid #E5E7EB;border-radius:8px"/>
      <div style="font-size:11px;color:#9CA3AF;margin-bottom:14px">Max 2MB. JPG, PNG, WebP</div>
      <div style="display:flex;gap:8px">
        <button onclick="this.closest('div[style*=fixed]').remove()" 
          class="btn btn-outline" style="flex:1">Cancel</button>
        <button onclick="handlePhotoUpload('${role}','${userId}',this)" 
          class="btn btn-primary" style="flex:1">📤 Upload</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if(e.target===modal) modal.remove(); });
}

async function handlePhotoUpload(role, userId, btn){
  const input = document.getElementById('photo-upload-input');
  if(!input?.files?.length){toast("Photo select చేయండి",true);return;}
  if(btn){btn.disabled=true;btn.textContent="Uploading...";}
  
  const url = await uploadProfilePhoto(input.files[0], role, userId);
  if(url){
    // Save photo URL to provider table
    const tableMap = {doctor:"doctors",store:"medical_stores",ambulance:"ambulances",
                      lab:"diagnostic_labs",homeprovider:"home_providers",hospital:"hospitals"};
    const table = tableMap[role];
    if(table){
      await DB.patch(table,"id=eq."+userId,{photo_url:url});
      A.user.photo_url = url;
      S.save(A.user, role);
      toast("Photo uploaded successfully! ✅");
      // Update avatar display
      const avatars = document.querySelectorAll('.provider-avatar');
      avatars.forEach(av => { av.src = url; av.style.display = 'block'; });
    }
    // Close modal
    const modal = btn.closest('div[style*=fixed]');
    if(modal) modal.remove();
  }
  if(btn){btn.disabled=false;btn.textContent="📤 Upload";}
}

function logout(){
  S.clear();A.user=null;A.role=null;
  A.cache={docs:[],pats:[],stores:[],labs:[],ambus:[],appts:[],notifs:[]};
  toast("Logged out.");go("landing");
}
function redirectRole(role){
  const r={patient:"patientDash",doctor:"doctorDash",store:"storeDash",ambulance:"ambuDash",lab:"labDash",homeprovider:"hpDash",hospital:"hospitalDash",admin:null};
  if(role==="admin"){setTimeout(()=>{window.location.href="admin.html";},800);return;}
  go(r[role]||"landing");
}

/* ════════ LANGUAGE ════════ */
function setLang(lang){
  A.lang=lang;localStorage.setItem("dn_lang",lang);
  [$("btn-lang-en"),$("btn-lang-te")].forEach((b,i)=>{
    if(!b)return;
    const on=(i===0&&lang==="en")||(i===1&&lang==="te");
    b.style.background=on?"linear-gradient(135deg,#0A7FAF,#074E7A)":"transparent";
    b.style.color=on?"#fff":"#6B7280";
  });
  document.querySelectorAll("[data-en]").forEach(el=>{
    const txt=el.getAttribute("data-"+lang);
    if(txt)el.innerHTML=txt;
  });
  document.querySelectorAll("[data-placeholder-en]").forEach(el=>{
    const ph=el.getAttribute("data-placeholder-"+lang);
    if(ph)el.placeholder=ph;
  });
}

  

  
  
    
    
  

    
    

  
    
    
  

/* ════════ SUBSCRIPTION PLANS RENDER ════════ */
function renderPlans(role,formId){
  const plans=PLANS[role];if(!plans)return "";
  return `<div class="form-group">
    <label class="form-label">Choose Subscription Plan <span>*</span></label>
    <div id="plan-cards-${role}" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:4px">
      ${plans.map(p=>`
      <div class="plan-card ${p.popular?"popular":""}" id="plan-${role}-${p.id}" onclick="selectPlan('${role}','${p.id}')" style="position:relative">
        ${p.popular?`<div style="position:absolute;top:-10px;right:12px;background:#FF6B35;color:#fff;font-size:10px;font-weight:700;padding:2px 10px;border-radius:12px">⭐ POPULAR</div>`:""}
        <div style="font-size:13px;font-weight:700;color:#1A2B3C;margin-bottom:6px">${p.name}</div>
        <div class="plan-price">₹${p.price}</div>
        <div class="plan-period">${p.period}</div>
        <div style="margin-top:10px">
          ${p.features.map(f=>`<div class="plan-feature">✅ <span>${f}</span></div>`).join("")}
        </div>
      </div>`).join("")}
    </div>
    <div id="plan-note-${role}" style="font-size:12px;color:#6B7280;margin-top:6px;padding:8px 12px;background:#F9FAFB;border-radius:8px">
      💡 Select a plan to continue. Payment via Razorpay (UPI/Card/NetBanking).
    </div>
  </div>`;
}
function selectPlan(role,planId){
  const plans=PLANS[role]||[];
  const plan=plans.find(p=>p.id===planId);
  document.querySelectorAll(`#plan-cards-${role} .plan-card`).forEach(c=>c.classList.remove("selected"));
  $(`plan-${role}-${planId}`)?.classList.add("selected");
  window[`_plan_${role}`]=plan;
  const note=$(`plan-note-${role}`);
  if(note&&plan) note.innerHTML=`✅ Selected: <strong>${plan.name}</strong> — ₹${plan.price}${plan.period}. Payment at next step.`;
}

/* ════════ AUTH — PATIENT ════════ */
async function patientLogin(){
  const email=gv("pl-email"),pw=gv("pl-pw");
  if(!email||!pw){toast("Email & password required.",true);return;}
  const btn=$("pl-btn");if(btn){btn.disabled=true;btn.textContent="Signing in...";}
  try{
    const hash=await sha(pw);
    let rows=await safeGet("patients",`email=eq.${enc(email)}&password_hash=eq.${enc(hash)}`);
    if(!rows.length&&A.demo){const d=DEMO.pats.find(p=>p.email===email);if(d&&pw==="patient123")rows=[d];}
    if(!rows.length){toast("Invalid email or password.",true);return;}
    A.user=rows[0];A.role="patient";S.save(rows[0],"patient");
    toast("Welcome, "+rows[0].name+"! 👋");
    if(A.pendingPage){const pg=A.pendingPage;A.pendingPage=null;go(pg);}else{redirectRole("patient");}
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="Sign In";}}
}
async function emailExistsAnywhere(email){
  const tables=["patients","doctors","medical_stores","ambulances","diagnostic_labs","admins"];
  for(const t of tables){
    try{const r=await safeGet(t,`email=eq.${enc(email)}`);if(r.length)return true;}catch{}
  }
  return false;
}         
async function patientRegister(){
  const name=gv("pr-name"),email=gv("pr-email"),pw=gv("pr-pw"),phone=gv("pr-phone"),age=gv("pr-age"),blood=gv("pr-blood"),gender=gv("pr-gender");
  if(!name||!email||!pw||!phone||!age){toast("Fill all required fields.",true);return;}
  if(pw.length<6){toast("Password min 6 characters.",true);return;}
  const btn=$("pr-btn");if(btn){btn.disabled=true;btn.textContent="Creating...";}
  try{
    const hash=await sha(pw);
    if(await emailExistsAnywhere(email)){toast("This email is already registered.",true);return;}
    const r=await safePost("patients",{name,email,password_hash:hash,phone,age:parseInt(age),blood_group:blood,gender},d=>[{...d,id:"p_"+Date.now()}]);
    A.user=r[0];A.role="patient";S.save(r[0],"patient");
    toast("Welcome to DocNear, "+name+"! 🎉");
    if(A.pendingPage){const pg=A.pendingPage;A.pendingPage=null;go(pg);}else{redirectRole("patient");}
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="Create Account";}}
}

/* ════════ AUTH — DOCTOR ════════ */
async function doctorLogin(){
  const email=gv("dl-email"),pw=gv("dl-pw");
  if(!email||!pw){toast("Email & password required.",true);return;}
  const btn=$("dl-btn");if(btn){btn.disabled=true;btn.textContent="Signing in...";}
  try{
    const hash=await sha(pw);
    let rows=await safeGet("doctors",`email=eq.${enc(email)}&password_hash=eq.${enc(hash)}`);
    if(!rows.length&&A.demo){const d=DEMO.docs.find(d=>d.email===email);if(d&&pw==="doctor123")rows=[d];}
    if(!rows.length){toast("Invalid email or password.",true);return;}
    A.user=rows[0];A.role="doctor";S.save(rows[0],"doctor");
    toast("Welcome, "+rows[0].name+"! 👨‍⚕️");redirectRole("doctor");
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="Sign In";}}
}
async function doctorRegister(){
  const f={name:gv("dr-name"),email:gv("dr-email"),pw:gv("dr-pw"),phone:gv("dr-phone"),
    spec:gv("dr-spec"),reg:gv("dr-reg"),hosp:gv("dr-hosp"),loc:gv("dr-loc"),
    exp:gv("dr-exp"),fee:gv("dr-fee"),about:gv("dr-about"),qual:gv("dr-qual")};
  if(!f.name||!f.email||!f.pw||!f.phone||!f.spec||!f.reg||!f.hosp||!f.loc||!f.exp||!f.fee){
    toast("Fill all required fields.",true);return;}
  const btn=$("dr-btn");if(btn){btn.disabled=true;btn.textContent="Submitting...";}
  try{
    const hash=await sha(f.pw);
    if(await emailExistsAnywhere(f.email)){toast("This email is already registered.",true);return;}
    
    await safePost("doctors",{
      name:f.name,email:f.email,password_hash:hash,phone:f.phone,
      specialization:f.spec,reg_number:f.reg,hospital:f.hosp,location:f.loc,city:f.loc,
      experience:parseInt(f.exp),fee:parseInt(f.fee||0),about:f.about,qualifications:f.qual,
      approved:false,color:SPECS.find(s=>s.n===f.spec)?.c||"#0A7FAF",
      slots:["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM","4:00 PM"]
    });
    go("doctorPending");toast("Registration submitted! Admin will verify within 24–48 hrs.");
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="Submit for Review";}}
}

/* ════════ AUTH — STORE ════════ */
async function storeLogin(){
  const email=gv("sl-email"),pw=gv("sl-pw");
  if(!email||!pw){toast("Email & password required.",true);return;}
  const btn=$("sl-btn");if(btn){btn.disabled=true;btn.textContent="Signing in...";}
  try{
    const hash=await sha(pw);
    let rows=await safeGet("medical_stores",`email=eq.${enc(email)}&password_hash=eq.${enc(hash)}`);
    if(!rows.length&&A.demo){const d=DEMO.stores.find(s=>s.email===email);if(d&&pw==="store123")rows=[d];}
    if(!rows.length){toast("Invalid email or password.",true);return;}
    if(!rows[0].approved){toast("Store not yet approved by admin.",true);return;}
    A.user=rows[0];A.role="store";S.save(rows[0],"store");
    toast("Welcome, "+rows[0].store_name+"! 💊");redirectRole("store");
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="Sign In";}}
}
async function storeRegister(){
  const f={owner:gv("sr-owner"),store:gv("sr-store"),email:gv("sr-email"),pw:gv("sr-pw"),
    phone:gv("sr-phone"),addr:gv("sr-address"),lic:gv("sr-license"),gst:gv("sr-gst")};
  if(!f.owner||!f.store||!f.email||!f.pw||!f.phone||!f.addr){toast("Fill all required fields.",true);return;}
  const btn=$("sr-btn");if(btn){btn.disabled=true;btn.textContent="Submitting...";}
  try{
    const hash=await sha(f.pw);
    if(await emailExistsAnywhere(f.email)){toast("This email is already registered.",true);return;}
    await safePost("medical_stores",{
      owner_name:f.owner,store_name:f.store,email:f.email,password_hash:hash,
      phone:f.phone,address:f.addr,drug_license_no:f.lic,gst_number:f.gst,
      approved:false,is_active:true,color:"#10B981",delivery_available:false,is_24x7:false
    });
    toast("Store registration submitted!");go("storePending");
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="Submit for Approval";}}
}

/* ════════ AUTH — AMBULANCE ════════ */
async function ambuLogin(){
  const email=gv("al2-email"),pw=gv("al2-pw");
  if(!email||!pw){toast("Email & password required.",true);return;}
  const btn=$("al2-btn");if(btn){btn.disabled=true;btn.textContent="Signing in...";}
  try{
    const hash=await sha(pw);
    let rows=await safeGet("ambulances",`email=eq.${enc(email)}&password_hash=eq.${enc(hash)}`);
    if(!rows.length&&A.demo){const d=DEMO.ambus.find(a=>a.email===email);if(d&&pw==="ambu123")rows=[d];}
    if(!rows.length){toast("Invalid email or password.",true);return;}
    if(!rows[0].approved){toast("Account not yet approved by admin.",true);return;}
    A.user=rows[0];A.role="ambulance";S.save(rows[0],"ambulance");
    toast("Welcome, "+rows[0].operator_name+"! 🚑");redirectRole("ambulance");
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="Sign In";}}
}
async function ambuRegister(){
  const f={op:gv("ar-operator"),email:gv("ar-email"),pw:gv("ar-pw"),phone:gv("ar-phone"),
    veh:gv("ar-vehicle"),type:gv("ar-type"),pricing:gv("ar-pricing"),loc:gv("ar-location")};
  if(!f.op||!f.email||!f.pw||!f.phone||!f.veh||!f.type||!f.loc){toast("Fill all required fields.",true);return;}
  const btn=$("ar-btn");if(btn){btn.disabled=true;btn.textContent="Submitting...";}
  try{
    const hash=await sha(f.pw);
    await safePost("ambulances",{
      operator_name:f.op,email:f.email,password_hash:hash,phone:f.phone,
      vehicle_number:f.veh,vehicle_type:f.type,pricing_info:f.pricing,
      base_location:f.loc,
      approved:false,availability_status:"offline",color:"#EF4444",
      has_oxygen:true,has_stretcher:true,service_radius_km:20
    });
    go("ambuPending");toast("Ambulance registration submitted!");
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="Submit for Approval";}}
}

/* ════════ AUTH — LAB ════════ */
async function labLogin(){
  const email=gv("ll-email"),pw=gv("ll-pw");
  if(!email||!pw){toast("Email & password required.",true);return;}
  const btn=$("ll-btn");if(btn){btn.disabled=true;btn.textContent="Signing in...";}
  try{
    const hash=await sha(pw);
    let rows=await safeGet("diagnostic_labs",`email=eq.${enc(email)}&password_hash=eq.${enc(hash)}`);
    if(!rows.length&&A.demo){const d=DEMO.labs.find(l=>l.email===email);if(d&&pw==="lab123")rows=[d];}
    if(!rows.length){toast("Invalid email or password.",true);return;}
    if(!rows[0].approved){toast("Lab not yet approved by admin.",true);return;}
    A.user=rows[0];A.role="lab";S.save(rows[0],"lab");
    toast("Welcome, "+rows[0].lab_name+"! 🔬");redirectRole("lab");
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="Sign In";}}
}
async function labRegister(){
  const f={lab:gv("lr-lab"),owner:gv("lr-owner"),email:gv("lr-email"),pw:gv("lr-pw"),
    phone:gv("lr-phone"),type:gv("lr-type"),addr:gv("lr-address"),reg:gv("lr-reg")};
  if(!f.lab||!f.owner||!f.email||!f.pw||!f.phone||!f.type){toast("Fill all required fields.",true);return;}
  const btn=$("lr-btn");if(btn){btn.disabled=true;btn.textContent="Submitting...";}
  try{
    const hash=await sha(f.pw);
    await safePost("diagnostic_labs",{
      lab_name:f.lab,owner_name:f.owner,email:f.email,password_hash:hash,
      phone:f.phone,lab_type:f.type,address:f.addr,lab_registration_no:f.reg,
      approved:false,is_active:true,color:"#7C4DFF",
      home_collection:false,nabl_accredited:false
    });
    go("labPending");toast("Lab registration submitted!");
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="Submit for Approval";}}
}

/* ════════ AUTH — ADMIN ════════ */
async function adminLogin(){
  const email=gv("al-email"),pw=gv("al-pw");
  if(!email||!pw){toast("Email & password required.",true);return;}
  const btn=$("al-btn");if(btn){btn.disabled=true;btn.textContent="Signing in...";}
  try{
    let ok=false;
    const hash=await sha(pw);
    try{const r=await DB.get("admins",`email=eq.${enc(email)}&password_hash=eq.${enc(hash)}&is_active=eq.true`);if(r.length){A.user=r[0];ok=true;}}catch{}
    if(!ok&&A.demo&&email==="admin@docnear.com"&&pw==="admin123"){A.user={name:"Admin",email};ok=true;}
    if(!ok){toast("Invalid admin credentials.",true);return;}
    A.role="admin";S.save(A.user,"admin");
toast("Welcome, Admin! 🛡️");
await new Promise(r=>setTimeout(r,500));
window.location.href="admin.html";
    
  }catch(e){toast(e.message,true);}
  finally{if(btn){btn.disabled=false;btn.textContent="Admin Sign In";}}
}

/* ════════ PAYMENT MODAL ════════ */
function showPaymentModal(role,plan,onSuccess){
  const existing=$("pay-modal");if(existing)existing.remove();
  const modal=document.createElement("div");
  modal.id="pay-modal";
  modal.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9998;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeUp .3s ease";
  modal.innerHTML=`
    <div style="background:#fff;border-radius:20px;padding:28px 24px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3)">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:44px;margin-bottom:10px">💳</div>
        <h3 style="font-family:'Lora',serif;font-size:20px;color:#1A2B3C;margin-bottom:4px">Complete Payment</h3>
        <p style="font-size:13px;color:#6B7280">Activate your <strong>${plan.name}</strong> subscription</p>
      </div>
      <div style="background:#F0F9FF;border-radius:14px;padding:16px;margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div style="font-size:14px;font-weight:600;color:#1A2B3C">${plan.name} Plan</div>
          <div style="font-size:20px;font-weight:800;color:#0A7FAF">₹${plan.price}<span style="font-size:12px;color:#9CA3AF">${plan.period}</span></div>
        </div>
        ${plan.features.map(f=>`<div style="font-size:12px;color:#374151;display:flex;align-items:center;gap:6px;margin-bottom:4px">✅ ${f}</div>`).join("")}
      </div>
      <div style="display:grid;gap:10px;margin-bottom:14px">
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;display:flex;align-items:center;gap:10px;cursor:pointer;border:1.5px solid transparent" id="pay-upi" onclick="selectPayMethod('upi')">
          <span style="font-size:20px">📱</span><div><div style="font-size:13px;font-weight:600">UPI / PhonePe / GPay</div><div style="font-size:11px;color:#9CA3AF">Instant transfer</div></div>
        </div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;display:flex;align-items:center;gap:10px;cursor:pointer;border:1.5px solid transparent" id="pay-card" onclick="selectPayMethod('card')">
          <span style="font-size:20px">💳</span><div><div style="font-size:13px;font-weight:600">Credit / Debit Card</div><div style="font-size:11px;color:#9CA3AF">Visa, Mastercard, RuPay</div></div>
        </div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;display:flex;align-items:center;gap:10px;cursor:pointer;border:1.5px solid transparent" id="pay-nb" onclick="selectPayMethod('netbanking')">
          <span style="font-size:20px">🏦</span><div><div style="font-size:13px;font-weight:600">Net Banking</div><div style="font-size:11px;color:#9CA3AF">All major banks</div></div>
        </div>
      </div>
      <div id="pay-err" style="display:none;background:#FEE2E2;color:#DC2626;padding:8px 12px;border-radius:8px;font-size:12px;margin-bottom:10px"></div>
      <button id="pay-btn" class="btn btn-primary btn-full" style="font-size:15px;padding:13px" onclick="processPayment('${role}',${plan.price},${JSON.stringify(plan).replace(/'/g,'"')})">
        Pay ₹${plan.price} Securely →
      </button>
      <button onclick="document.getElementById('pay-modal').remove()" class="btn btn-ghost btn-full" style="margin-top:8px">Cancel</button>
      <div style="text-align:center;font-size:11px;color:#D1D5DB;margin-top:8px">🔒 Secured by Razorpay · 256-bit SSL</div>
    </div>`;
  document.body.appendChild(modal);
  window._payCallback=onSuccess;
  selectPayMethod("upi");
}
function selectPayMethod(m){
  ["upi","card","nb"].forEach(id=>{
    const el=$("pay-"+id);
    if(el)el.style.borderColor=id===m||(id==="nb"&&m==="netbanking")?"#0A7FAF":"transparent";
  });
  window._payMethod=m;
}
async function processPayment(role,amount,plan){
  const btn=$("pay-btn");if(btn){btn.disabled=true;btn.textContent="Processing...";}
  // Razorpay integration
  if(typeof Razorpay!=="undefined"){
    const opts={
      key:"rzp_live_T1Ne2uFvUISXye",
      amount:amount*100,currency:"INR",
      name:"DocNear",
      description:`${plan.name} Subscription`,
      image:"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><text y='20' font-size='20'>🩺</text></svg>",
      handler:function(resp){
        $("pay-modal")?.remove();
        toast("Payment successful! ₹"+amount+" paid. ✅");
        if(window._payCallback)window._payCallback();
      },
      prefill:{name:A.user?.name||"",email:gv("dr-email")||gv("ar-email")||gv("lr-email")||""},
      theme:{color:"#0A7FAF"},
      modal:{ondismiss:()=>{if(btn){btn.disabled=false;btn.textContent="Pay ₹"+amount+" Securely →";}}}
    };
    new Razorpay(opts).open();
  } else {
    // Demo mode — simulate payment
    setTimeout(()=>{
      $("pay-modal")?.remove();
      toast("Demo: Payment of ₹"+amount+" processed! ✅");
      if(window._payCallback)window._payCallback();
    },1500);
    if(btn) btn.textContent="Processing Demo Payment...";
  }
}

/* ════════ RENDER: LANDING ════════ */
async function rLanding(){
  const ng=$("nav-guest"),nu=$("nav-user");
  if(A.user){
    if(ng)ng.style.display="none";
    if(nu){nu.style.display="flex";if($("nav-user-name"))$("nav-user-name").textContent=A.user.name||A.user.store_name||A.user.operator_name||A.user.lab_name||"";}
  }else{if(ng)ng.style.display="flex";if(nu)nu.style.display="none";}
  setLang(A.lang);
  const sc=$("landing-specs");
  if(sc)sc.innerHTML=SPECS.map(s=>`<div class="spec-card" onclick="A.spec='${s.n}';go('search')" onmouseover="this.style.boxShadow='0 8px 20px ${s.c}33'" onmouseout="this.style.boxShadow=''"><div class="spec-icon">${s.i}</div><div class="spec-name">${s.n}</div></div>`).join("");
  const dc=$("landing-doctors");
  if(dc){
    spin("landing-doctors");
    try{
      let docs=await safeGet("doctors","approved=eq.true&limit=3","docs");
      if(!docs.length)docs=DEMO.docs.slice(0,3);
      A.cache.docs=docs;
      dc.innerHTML=docs.map(d=>docCard(d)).join("");
      if(A.demo)dc.innerHTML+=`<div style="grid-column:1/-1;text-align:center;padding:10px;font-size:12px;color:#F59E0B;background:#FFFBEB;border-radius:8px;margin-top:8px">⚠️ Demo mode — run DOCNEAR_FINAL.sql + DOCNEAR_V2.sql in Supabase SQL Editor</div>`;
    }catch(e){dc.innerHTML=DEMO.docs.slice(0,3).map(d=>docCard(d)).join("");}
  }
  // Load stores slider
  const stc=$("landing-stores");
  if(stc){
    spin("landing-stores");
    safeGet("medical_stores","approved=eq.true&limit=3","stores").then(stores=>{
      if(!stores.length)stores=DEMO.stores?DEMO.stores.slice(0,3):[];
      stc.innerHTML=stores.length?stores.map(s=>`<div class="card" onclick="go('stores')">
        <div style="display:flex;gap:12px;margin-bottom:10px">
          ${avt(s.store_name||s.name,"#10B981",48,s.photo_url||"")}
          <div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1A2B3C">${safe(s.store_name||s.name)}</div>
          <div style="font-size:12px;color:#059669">💊 Medical Store</div>
          <div style="font-size:11px;color:#6B7280">📍 ${safe(s.district||s.city||"—")}</div>
          <div style="font-size:11px;color:${s.is_available!==false?"#059669":"#DC2626"};font-weight:600">${s.is_available!==false?"🟢 Open":"🔴 Closed"}</div></div>
        </div>
        <button class="btn btn-primary" style="width:100%;font-size:12px;padding:7px">Order Medicines</button>
      </div>`).join(""):empty("💊","No stores yet.");
    }).catch(()=>{stc.innerHTML=empty("💊","No stores nearby.");});
  }
  // Load ambulances slider
  const amc=$("landing-ambu");
  if(amc){
    spin("landing-ambu");
    safeGet("ambulances","approved=eq.true&availability_status=eq.available&limit=3","ambus").then(ambus=>{
      if(!ambus.length)ambus=DEMO.ambus?DEMO.ambus.slice(0,3):[];
      amc.innerHTML=ambus.length?ambus.map(a=>`<div class="card" onclick="go('ambulance')">
        <div style="display:flex;gap:12px;margin-bottom:10px">
          ${avt(a.operator_name,"#EF4444",48,a.photo_url||"")}
          <div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1A2B3C">${safe(a.operator_name)}</div>
          <div style="font-size:12px;color:#EF4444">🚑 ${safe(a.vehicle_type||"Ambulance")}</div>
          <div style="font-size:11px;color:#6B7280">📍 ${safe(a.base_location||a.district||"—")}</div>
          <div style="font-size:11px;color:#059669;font-weight:600">🟢 Available</div></div>
        </div>
        <div style="font-size:12px;color:#6B7280;margin-bottom:8px">📞 ${safe(a.phone||"—")}</div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();shareProfile('ambulance','${a.id}','${safe(a.operator_name)}','${safe(a.vehicle_type||'Ambulance')}','${safe(a.district||'')}')" > 📤 Share</button>
          <button class="btn btn-primary" style="flex:1;font-size:12px;padding:7px;background:#EF4444;border-color:#EF4444" onclick="event.stopPropagation();callWithLogin('${safe(a.phone)}')">📞 Call Now</button>
        </div>
      </div>`).join(""):empty("🚑","No ambulances nearby.");
    }).catch(()=>{amc.innerHTML=empty("🚑","No ambulances nearby.");});
  }
  // Load labs slider
  const lbc=$("landing-labs");
  if(lbc){
    spin("landing-labs");
    safeGet("diagnostic_labs","approved=eq.true&limit=3","labs").then(labs=>{
      if(!labs.length)labs=DEMO.labs?DEMO.labs.slice(0,3):[];
      lbc.innerHTML=labs.length?labs.map(l=>`<div class="card" onclick="go('labsPage')">
        <div style="display:flex;gap:12px;margin-bottom:10px">
          ${avt(l.lab_name||l.name,"#7C4DFF",48,l.photo_url||"")}
          <div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1A2B3C">${safe(l.lab_name||l.name)}</div>
          <div style="font-size:12px;color:#7C4DFF">🔬 Diagnostic Lab</div>
          <div style="font-size:11px;color:#6B7280">📍 ${safe(l.district||l.city||"—")}</div>
          <div style="font-size:11px;color:${l.is_available!==false?"#059669":"#DC2626"};font-weight:600">${l.is_available!==false?"🟢 Open":"🔴 Closed"}</div></div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();shareProfile('lab','${l.id}','${safe(l.lab_name||l.name)}','Diagnostic Lab','${safe(l.district||'')}')" > 📤 Share</button>
          <button class="btn btn-primary" style="flex:1;font-size:12px;padding:7px;background:#7C4DFF;border-color:#7C4DFF" onclick="event.stopPropagation();viewLab('${l.id}')">🔬 View & Book</button>
        </div>
      </div>`).join(""):empty("🔬","No labs nearby.");
    }).catch(()=>{lbc.innerHTML=empty("🔬","No labs nearby.");});
  }
  DB.get("doctors","approved=eq.true&limit=1").then(()=>{A.demo=false;}).catch(()=>{A.demo=true;});
  // Dynamic hero stats
  const loadStat=(id,table,q)=>{
    dbq(table+"?"+q+"&select=id").then(r=>{
      const el=$(id);if(el)el.textContent=r.length+"+"
    }).catch(()=>{});
  };
  loadStat("hstat-docs","doctors","approved=eq.true");
  loadStat("hstat-stores","medical_stores","approved=eq.true");
  loadStat("hstat-ambu","ambulances","approved=eq.true");
  loadStat("hstat-labs","diagnostic_labs","approved=eq.true");
  // Home Care Providers on landing
  const hpc=$("landing-homeproviders");
  if(hpc){
    spin("landing-homeproviders");
    dbq("home_providers?approved=eq.true&is_available=eq.true&order=created_at.desc&limit=4").then(providers=>{
      hpc.innerHTML=providers.length?providers.map(p=>hpCard(p)).join(""):empty("🏠","No home care providers yet.");
    }).catch(()=>{hpc.innerHTML=empty("🏠","No home care providers yet.");});
  }
  // Hospitals on landing
  const hosc=$("landing-hospitals");
  if(hosc){
    dbq("hospitals?approved=eq.true&is_active=eq.true&order=created_at.desc&limit=4").then(hospitals=>{
      hosc.innerHTML=hospitals.length?hospitals.map(h=>hospitalCard(h)).join(""):empty("🏥","No hospitals yet.");
    }).catch(()=>{hosc.innerHTML=empty("🏥","No hospitals yet.");});
  }
  // Social feed on landing
  const lf=$("landing-feed");
  if(lf){
    dbq("health_posts?order=created_at.desc&limit=3").then(posts=>{
      lf.innerHTML=posts.length?posts.map(p=>`<div style="background:#fff;border-radius:12px;padding:14px;box-shadow:0 2px 8px rgba(0,0,0,.06)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div style="width:34px;height:34px;border-radius:50%;background:#7C4DFF;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px">${safe(p.author_name||"U").charAt(0).toUpperCase()}</div>
          <div><div style="font-weight:700;font-size:13px;color:#1A2B3C">${safe(p.author_name)}</div><div style="font-size:11px;color:#9CA3AF">${timeAgo(p.created_at)}</div></div>
        </div>
        <div style="font-size:13px;color:#374151;line-height:1.5">${safe(p.content).slice(0,120)}${p.content.length>120?"...":""}</div>
        <div style="font-size:12px;color:#9CA3AF;margin-top:8px">❤️ ${p.likes_count||0} · 💬 ${p.comments_count||0}</div>
      </div>`).join(""):"<div style='text-align:center;padding:20px;color:#9CA3AF'>No posts yet.</div>";
    }).catch(()=>{if(lf)lf.innerHTML="<div style='text-align:center;padding:20px;color:#9CA3AF'>No posts yet.</div>";});
  }
}

/* ════════ DOC CARD ════════ */
function getMapLink(name, location){
  const q=encodeURIComponent((name||"")+" "+(location||""));
  return "https://www.google.com/maps/search/"+q;
}
function docCard(d){
  const sc=(SPECS.find(s=>s.n===d.specialization)||{}).c||"#0A7FAF";
  const isFav=A.cache.favs?.includes(d.id);
  const sub=d.subscription==="yearly"?pill("⭐ Premium","#FEF3C7","#D97706"):d.subscription==="monthly"?pill("✓ Listed","#D1FAE5","#059669"):"";
  return `<div class="card" onclick="viewDoc('${d.id}')">
    <div style="display:flex;gap:12px;margin-bottom:12px">
      ${avt(d.name,d.color||sc,54,d.photo_url||"")}
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
          <div class="doc-name">${safe(d.name)}</div>
          ${d.video_consult?`<span style="font-size:11px" title="Video consult">🎥</span>`:""}
        </div>
        <div class="doc-spec">${safe(d.specialization)}</div>
        <div class="doc-meta">⭐ <strong>${d.rating||"New"}</strong>${d.reviews>0?` <span style="color:#9CA3AF">(${d.reviews})</span>`:""}</div>
        <div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap;align-items:center">${sub}${d.district?`<span style="font-size:10px;color:#9CA3AF">📍 ${d.district}</span>`:""}
          <span style="font-size:10px;font-weight:600;color:${d.is_available!==false?"#059669":"#DC2626"}">${d.is_available!==false?"🟢 Available":"🔴 Offline"}</span>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:13px;font-weight:600;color:#059669">Free Consultation</div>
        <div style="font-size:10px;color:#9CA3AF">per visit</div>
        ${A.role==="patient"?`<button onclick="event.stopPropagation();toggleFav('${d.id}')" style="background:none;border:none;cursor:pointer;font-size:15px;margin-top:3px">${isFav?"❤️":"🤍"}</button>`:""}
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
      <span style="font-size:11px;color:#6B7280">🏥 ${safe(d.hospital)||"—"}</span>
      <span style="font-size:11px;color:#6B7280">🏆 ${d.experience||0}y exp</span>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();viewDoc('${d.id}')">Profile</button>
      <a class="btn btn-outline btn-sm" href="${getMapLink(d.hospital||d.name,d.city||d.location)}" target="_blank" onclick="event.stopPropagation()">📍</a>
      <button class="btn btn-outline btn-sm" onclick="event.stopPropagation();shareProfile('doctor','${d.id}','${safe(d.name)}','${safe(d.specialization)}','${safe(d.district||'')}')" title="Share"> 📤 Share</button>
      <button class="btn btn-primary" style="flex:1;padding:7px 0;font-size:12px${d.is_available===false?";opacity:.5;cursor:not-allowed":""}" ${d.is_available===false?'disabled onclick="event.stopPropagation();toast(\'Doctor is offline right now.\',true)"':`onclick="event.stopPropagation();bookDoc('${d.id}')"`}>${d.is_available===false?"Offline":"Book Now"}</button>
    </div>
  </div>`;
}

/* ════════ APPT CARD ════════ */
function apptCard(a,forDoc=false){
  const bc={confirmed:"#059669",pending:"#D97706",cancelled:"#DC2626",completed:"#7C4DFF"}[a.status]||"#D97706";
  return `<div class="appt-card" style="border-left:4px solid ${bc}">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px">
      <div><div style="font-size:14px;font-weight:700;color:#1A2B3C">${forDoc?safe(a.patient_name):safe(a.doctor_name)}</div>
      <div style="font-size:12px;color:#6B7280">${safe(a.specialization)}</div>
      ${forDoc&&a.patient_phone?`<div style="font-size:12px;color:#0A7FAF;font-weight:600">📞 ${safe(a.patient_phone)}</div>`:""}
      </div>
      ${sPill(a.status)}
    </div>
    <div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap;align-items:center">
      <span style="font-size:12px;color:#6B7280">📅 ${a.date}</span>
      <span style="font-size:12px;color:#6B7280">🕐 ${a.slot}</span>
      ${a.is_video?`<span style="font-size:11px;color:#7C4DFF;font-weight:600">🎥 Video</span>`:""}
    </div>
    ${a.payment_status?`<div style="margin-top:6px">${pill(a.payment_status==="paid"?"💳 Paid":"⏳ Unpaid",a.payment_status==="paid"?"#D1FAE5":"#FEF3C7",a.payment_status==="paid"?"#059669":"#D97706")}</div>`:""}
    ${forDoc&&a.status==="pending"?`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
      <button class="btn btn-red btn-sm" onclick="cancelAppt('${a.id}')">❌ Cancel</button>
      <button class="btn btn-primary btn-sm" onclick="confirmAppt('${a.id}','${a.patient_id}','${a.patient_name}')">✅ Confirm</button>
    </div>`:""}
    ${!forDoc&&(a.status==="pending"||a.status==="confirmed")?`<div style="margin-top:10px"><button class="btn btn-red btn-sm" style="width:100%" onclick="patientCancelAppt('${a.id}')">❌ Cancel Appointment</button></div>`:""}
    ${!forDoc&&(a.status==="cancelled"||a.status==="completed")?`<button style="margin-top:8px;width:100%;padding:5px;background:none;border:1px solid #E5E7EB;border-radius:8px;color:#9CA3AF;font-size:11px;cursor:pointer" onclick="patientDeleteAppt('${a.id}')">🗑️ Delete</button>`:""}
    ${forDoc?`<button style="margin-top:8px;width:100%;padding:5px;background:none;border:1px solid #E5E7EB;border-radius:8px;color:#9CA3AF;font-size:11px;cursor:pointer" onclick="deleteAppt('${a.id}')">🗑️ Delete</button>`:""}
    ${a.status==="confirmed"&&a.is_video&&a.meeting_link?`<button class="btn btn-purple btn-sm" style="margin-top:10px;width:100%" onclick="window.open('${a.meeting_link}','_blank')">🎥 Join Video Call</button>`:""}
  </div>`;
}
async function confirmAppt(apptId, patientId, patientName){
  try{
    const appts=await DB.get("appointments","id=eq."+apptId);
    const a=appts[0];
    await DB.patch("appointments","id=eq."+apptId,{status:"confirmed"});
    await sendNotification(patientId,"patient","Appointment Confirmed ✅",
      "Your appointment with Dr. "+safe(A.user.name)+" on "+safe(a?.date)+" at "+safe(a?.slot)+" has been confirmed!","success");
    toast("Appointment confirmed! Patient notified. ✅");
    rDoctorDash();
  }catch(e){toast(e.message,true);}
}
async function cancelAppt(apptId){
  if(!confirm("Cancel this appointment?"))return;
  try{
    const appts=await DB.get("appointments","id=eq."+apptId);
    const a=appts[0];
    await DB.patch("appointments","id=eq."+apptId,{status:"cancelled"});
    if(a?.patient_id){
      await sendNotification(a.patient_id,"patient","Appointment Cancelled ❌",
        "Your appointment on "+safe(a.date)+" at "+safe(a.slot)+" with Dr. "+safe(A.user.name)+" has been cancelled.","warning");
    }
    toast("Appointment cancelled. Patient notified.");
    rDoctorDash();
  }catch(e){toast(e.message,true);}
}
async function deleteAppt(apptId){
  if(!confirm("Delete this appointment permanently?"))return;
  try{
    await DB.del("appointments","id=eq."+apptId);
    toast("Appointment deleted.");
    rDoctorDash();
  }catch(e){toast(e.message,true);}
}

/* Patient-side appointment cancel/delete */
async function patientCancelAppt(apptId){
  if(!confirm("Cancel this appointment?"))return;
  try{
    const appts=await DB.get("appointments","id=eq."+apptId);
    const a=appts[0];
    await DB.patch("appointments","id=eq."+apptId,{status:"cancelled"});
    if(a?.doctor_id){
      await sendNotification(a.doctor_id,"doctor","Appointment Cancelled ❌",
        "Patient "+safe(A.user.name)+" cancelled the appointment on "+safe(a.date)+" at "+safe(a.slot)+".","warning");
    }
    toast("Appointment cancelled.");
    rPatientDash();
  }catch(e){toast(e.message,true);}
}
async function patientDeleteAppt(apptId){
  if(!confirm("Delete this record permanently?"))return;
  try{
    await DB.del("appointments","id=eq."+apptId);
    toast("Appointment deleted.");
    rPatientDash();
  }catch(e){toast(e.message,true);}
}

/* Patient-side lab booking cancel/delete */
async function patientCancelLab(bookingId){
  if(!confirm("Cancel this lab booking?"))return;
  try{
    const bks=await DB.get("lab_bookings","id=eq."+bookingId);
    const b=bks[0];
    await DB.patch("lab_bookings","id=eq."+bookingId,{status:"cancelled"});
    if(b?.lab_id){
      await sendNotification(b.lab_id,"lab","Booking Cancelled ❌",
        "Patient "+safe(A.user.name)+" cancelled the test "+safe(b.test_name)+".","warning");
    }
    toast("Lab booking cancelled.");
    rPatientDash();
  }catch(e){toast(e.message,true);}
}
async function patientDeleteLab(bookingId){
  if(!confirm("Delete this lab booking permanently?"))return;
  try{
    await DB.del("lab_bookings","id=eq."+bookingId);
    toast("Lab booking deleted.");
    rPatientDash();
  }catch(e){toast(e.message,true);}
}

/* Patient-side medicine order cancel/delete */
async function patientCancelOrder(orderId){
  if(!confirm("Cancel this medicine order?"))return;
  try{
    await DB.patch("prescription_orders","id=eq."+orderId,{status:"cancelled"});
    toast("Order cancelled.");
    rPatientDash();
  }catch(e){toast(e.message,true);}
}
async function patientDeleteOrder(orderId){
  if(!confirm("Delete this order permanently?"))return;
  try{
    await DB.del("prescription_orders","id=eq."+orderId);
    toast("Order deleted.");
    rPatientDash();
  }catch(e){toast(e.message,true);}
}

/* ════════ SEARCH ════════ */
async function rSearch(){
  const na=$("search-nav-actions");
  if(na)na.innerHTML=A.user?`<span style="font-size:12px;font-weight:600;color:#1A2B3C">${A.user.name||A.user.store_name||"User"}</span><button class="btn btn-ghost btn-sm" onclick="logout()">Logout</button>`:`<button class="btn btn-outline btn-sm" onclick="go('patientLogin')">Login</button>`;
  if($("search-back-btn"))$("search-back-btn").onclick=()=>go(A.role==="patient"?"patientDash":"landing");
  const chips=$("search-chips");
  if(chips)chips.innerHTML=[{n:"All",i:""},...SPECS].map(s=>`<button class="chip ${(!A.spec&&s.n==="All")||A.spec===s.n?"active":""}" onclick="setSpec('${s.n==="All"?"":s.n}')">${s.i} ${s.n}</button>`).join("");
  const qi=$("search-q");if(qi)qi.value=A.q;
  await fetchDocs();
}
function setSpec(s){A.spec=s;rSearch();}
async function filterDoctors(){A.q=($("search-q")||{}).value||"";A.spec=($("search-spec")||{}).value||"";document.querySelectorAll(".chip").forEach(c=>{const isAll=c.textContent.trim().startsWith("All");c.classList.toggle("active",isAll?!A.spec:(!!A.spec&&c.textContent.includes(A.spec)));});await fetchDocs();}
async function fetchDocs(){
  const re=$("search-results"),ce=$("search-count");if(!re)return;
  spin("search-results","Finding doctors...");
  try{
    let q="approved=eq.true";
    if(A.spec)q+=`&specialization=eq.${enc(A.spec)}`;
    let docs=await safeGet("doctors",q,"docs");
    if(!docs.length)docs=DEMO.docs;
    if(A.spec)docs=docs.filter(d=>d.specialization===A.spec);
    if(A.q){const v=A.q.toLowerCase();docs=docs.filter(d=>safe(d.name).toLowerCase().includes(v)||safe(d.specialization).toLowerCase().includes(v)||safe(d.hospital).toLowerCase().includes(v)||safe(d.city).toLowerCase().includes(v)||safe(d.location).toLowerCase().includes(v)||safe(d.district).toLowerCase().includes(v));}
    A.cache.docs=[...A.cache.docs.filter(d=>!docs.find(x=>x.id===d.id)),...docs];
    if(ce)ce.textContent=docs.length+" doctor"+(docs.length!==1?"s":"")+" found";
    re.innerHTML=docs.length?docs.map(d=>docCard(d)).join(""):empty("🔍","No doctors found. Try different filters.");
  }catch(e){re.innerHTML=DEMO.docs.map(d=>docCard(d)).join("");}
}

/* ════════ PATIENT DASH ════════ */
async function rPatientDash(){
  if(!A.user){go("patientLogin");return;}
  const u=A.user;
  if($("pd-nav-name"))$("pd-nav-name").textContent=u.name;
  if($("pd-welcome"))$("pd-welcome").textContent="Hello, "+safe(u.name).split(" ")[0]+"! 👋";
  spin("pd-stats");spin("pd-appts","Loading appointments...");spin("pd-doctors","Loading doctors...");
  try{
    const[appts,docs,labBookings,orders]=await Promise.all([
      safeGet("appointments","patient_id=eq."+u.id),
      safeGet("doctors","approved=eq.true&limit=4","docs"),
      safeGet("lab_bookings","patient_id=eq."+u.id),
      safeGet("prescription_orders","patient_id=eq."+u.id)
    ]);
    A.cache.appts=appts.length?appts:DEMO.appts.filter(a=>a.patient_id===u.id);
    A.cache.docs=docs.length?docs:DEMO.docs;
    A.cache.labBookings=labBookings;
    A.cache.orders=orders;
    if($("pd-stats"))$("pd-stats").innerHTML=
      sc("📅","Appointments",A.cache.appts.length,"#E3F4FC","#0A7FAF")+
      sc("✅","Confirmed",A.cache.appts.filter(a=>a.status==="confirmed").length,"#D1FAE5","#059669")+
      sc("🎥","Video",A.cache.appts.filter(a=>a.is_video).length,"#EDE9FE","#7C4DFF")+
      sc("👨‍⚕️","Doctors",new Set(A.cache.appts.map(a=>a.doctor_id)).size,"#FEE9E1","#FF6B35");
    if($("pd-appts"))$("pd-appts").innerHTML=A.cache.appts.length?A.cache.appts.map(a=>apptCard(a)).join(""):empty("📋","No appointments yet.",`<button class="btn btn-primary btn-sm" onclick="go('search')">Book Now</button>`);
    if($("pd-doctors"))$("pd-doctors").innerHTML=A.cache.docs.map(d=>docCard(d)).join("");
    // Home Care Providers
    dbq("home_providers?approved=eq.true&is_available=eq.true&order=created_at.desc&limit=4").then(providers=>{
      if($("pd-homeproviders"))$("pd-homeproviders").innerHTML=providers.length?providers.map(p=>hpCard(p)).join(""):empty("🏠","No home care providers yet.",`<button class="btn btn-primary btn-sm" onclick="go('homeServices')">Book Home Care</button>`);
    }).catch(()=>{if($("pd-homeproviders"))$("pd-homeproviders").innerHTML=empty("🏠","No providers yet.");});
    if($("pd-lab-bookings"))$("pd-lab-bookings").innerHTML=labBookings.length?labBookings.map(b=>`<div class="appt-card" style="border-left:4px solid #7C4DFF">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px">
        <div><div style="font-size:14px;font-weight:700">🧪 ${safe(b.test_name)}</div>
        <div style="font-size:12px;color:#6B7280">₹${b.price||0}</div></div>
        ${sPill(b.status)}
      </div>
      ${b.status==="booked"?`<div style="margin-top:10px"><button class="btn btn-red btn-sm" style="width:100%" onclick="patientCancelLab('${b.id}')">❌ Cancel Booking</button></div>`:""}
      ${(b.status==="cancelled")?`<button style="margin-top:8px;width:100%;padding:5px;background:none;border:1px solid #E5E7EB;border-radius:8px;color:#9CA3AF;font-size:11px;cursor:pointer" onclick="patientDeleteLab('${b.id}')">🗑️ Delete</button>`:""}
    </div>`).join(""):empty("🧪","No lab tests booked yet.",`<button class="btn btn-purple btn-sm" onclick="go('labsPage')">Book a Test</button>`);
    if($("pd-orders"))$("pd-orders").innerHTML=orders.length?orders.map(o=>`<div class="appt-card" style="border-left:4px solid #10B981">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px">
        <div><div style="font-size:14px;font-weight:700">💊 Medicine Order</div>
        <div style="font-size:12px;color:#6B7280">${o.notes?safe(o.notes).slice(0,40):"Prescription order"}</div></div>
        ${pill((o.status||"pending").toUpperCase())}
      </div>
      ${(o.status==="pending")?`<div style="margin-top:10px"><button class="btn btn-red btn-sm" style="width:100%" onclick="patientCancelOrder('${o.id}')">❌ Cancel Order</button></div>`:""}
      ${(o.status==="cancelled"||o.status==="delivered")?`<button style="margin-top:8px;width:100%;padding:5px;background:none;border:1px solid #E5E7EB;border-radius:8px;color:#9CA3AF;font-size:11px;cursor:pointer" onclick="patientDeleteOrder('${o.id}')">🗑️ Delete</button>`:""}
    </div>`).join(""):empty("💊","No medicine orders yet.",`<button class="btn btn-green btn-sm" onclick="go('stores')">Order Medicines</button>`);
  }catch(e){toast("Error: "+e.message,true);}
}

/* ════════ DOCTOR DASH ════════ */
async function rDoctorDash(){
  if(!A.user){go("doctorLogin");return;}
  const u=A.user;
  if($("dd-nav-name"))$("dd-nav-name").textContent=u.name;
  if($("dd-welcome"))$("dd-welcome").textContent="Welcome, "+safe(u.name)+"! 👨‍⚕️";
  if($("dd-meta"))$("dd-meta").innerHTML=`<span>🩺 ${safe(u.specialization)}</span><span>🏥 ${safe(u.hospital)}</span>`;
  setTimeout(()=>loadMyPosts("doctor"),500);
  if($("dd-pending-alert"))$("dd-pending-alert").style.display=u.approved?"none":"flex";
  spin("dd-stats");spin("dd-today-appts","Loading...");spin("dd-all-appts","Loading...");
  try{
    const appts=await safeGet("appointments","doctor_id=eq."+u.id);
    const todayA=appts.filter(a=>a.date===td());
    const rev=appts.filter(a=>a.payment_status==="paid").reduce((s,a)=>s+a.fee,0);
    if($("dd-stats"))$("dd-stats").innerHTML=
      sc("📅","Total",appts.length)+sc("🌅","Today",todayA.length,"#FEE9E1","#FF6B35")+
      sc("💰","Revenue","₹"+rev.toLocaleString(),"#EDE9FE","#7C4DFF")+
      sc("✅","Confirmed",appts.filter(a=>a.status==="confirmed").length,"#D1FAE5","#059669");
    if($("dd-today-appts"))$("dd-today-appts").innerHTML=todayA.length?todayA.map(a=>apptCard(a,true)).join(""):empty("🌿","No appointments today.");
    if($("dd-all-appts"))$("dd-all-appts").innerHTML=appts.length?appts.map(a=>apptCard(a,true)).join(""):empty("📭","No appointments yet.");
    if($("dd-status-pill"))$("dd-status-pill").innerHTML=pill(u.approved?"✓ Approved":"⏳ Pending",u.approved?"#D1FAE5":"#FEF3C7",u.approved?"#059669":"#D97706");
  if($("dd-avail-btn")){
    const av=u.is_available!==false;
    $("dd-avail-btn").textContent=av?"🟢 Available — Click to go Offline":"🔴 Offline — Click to go Online";
    $("dd-avail-btn").style.background=av?"#059669":"#DC2626";
  }
    if($("dd-profile-grid"))$("dd-profile-grid").innerHTML=[
      ["🩺","Specialization",u.specialization],["🏥","Hospital",u.hospital],
      ["📍","Location",u.district||u.city||u.location],["📋","Reg. No.",u.reg_number],
      ["💰","Fee","₹"+u.fee],["💼","Experience",(u.experience||0)+" yrs"],
      ["📞","Phone",u.phone],["🎓","Qualifications",u.qualifications],
      ["💎","Subscription",(u.subscription||"—").toUpperCase()],
      ["🎥","Video Consult",u.video_consult?"✅ Enabled":"❌ Disabled"]
    ].map(([ic,l,v])=>`<div class="dd-info-item"><div class="dd-info-lbl">${ic} ${l}</div><div class="dd-info-val">${safe(v)||"—"}</div></div>`).join("");
    if($("dd-about"))$("dd-about").textContent=u.about||"";
    if($("dd-slots"))$("dd-slots").innerHTML=(u.slots||[]).map(s=>`<span class="profile-slot-tag">🕐 ${s}</span>`).join("");
    if($("dd-video-btn")){const vc=u.video_consult||false;$("dd-video-btn").textContent=vc?"🎥 Video ON — Disable":"🎥 Video OFF — Enable";$("dd-video-btn").style.background=vc?"#7C4DFF":"#9CA3AF";}
  if($("dd-edit-btn"))$("dd-edit-btn").onclick=()=>showEditProfile("doctor");
  if($("dd-banner")){
    if(u.banner_url)$("dd-banner").innerHTML=`<img src="${u.banner_url}" style="width:100%;max-height:140px;object-fit:cover;border-radius:12px;margin-bottom:10px"/>`;
    else $("dd-banner").innerHTML="";
  }
  }catch(e){toast("Error: "+e.message,true);}
}
  


/* ════════ STORE DASH ════════ */
async function rStoreDash(){
  if(!A.user){go("storeLogin");return;}
  const u=A.user;
  if($("sd-nav-name"))$("sd-nav-name").textContent=u.store_name;
  if($("sd-welcome"))$("sd-welcome").textContent="Welcome, "+safe(u.store_name)+"! 💊";
  spin("sd-stats");spin("sd-orders","Loading orders...");
  try{
    const orders=await safeGet("prescription_orders","store_id=eq."+u.id);
    if($("sd-stats"))$("sd-stats").innerHTML=
      sc("📋","Total Orders",orders.length)+
      sc("⏳","Pending",orders.filter(o=>o.status==="pending").length,"#FEF3C7","#D97706")+
      sc("✅","Completed",orders.filter(o=>o.status==="completed").length,"#D1FAE5","#059669")+
      sc("💰","Revenue","₹"+orders.filter(o=>o.payment_status==="paid").reduce((s,o)=>s+(o.total_amount||0),0).toLocaleString(),"#EDE9FE","#7C4DFF");
    if($("sd-orders"))$("sd-orders").innerHTML=orders.length
      ?orders.map(o=>`<div class="appt-card" style="border-left:4px solid ${{"pending":"#D97706","accepted":"#0A7FAF","packed":"#7C4DFF","delivered":"#059669","completed":"#059669","rejected":"#DC2626"}[o.status]||"#9CA3AF"}">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:8px">
          <div><div style="font-size:14px;font-weight:700">${safe(o.patient_name)||"Patient"}</div><div style="font-size:12px;color:#6B7280">📞 ${safe(o.patient_phone)||"—"}</div></div>
          ${pill((o.status||"pending").toUpperCase())}
        </div>
        ${o.notes?`<div style="font-size:12px;color:#6B7280">📝 ${o.notes}</div>`:""}
        ${o.delivery_address?`<div style="font-size:12px;color:#6B7280">📍 ${safe(o.delivery_address)}</div>`:""}
        ${o.is_urgent?`<span style="font-size:11px;background:#FEE2E2;color:#DC2626;padding:2px 8px;border-radius:6px;font-weight:600">🚨 URGENT</span>`:""}
        ${o.prescription_url?`<a href="${o.prescription_url}" target="_blank" class="btn btn-outline btn-sm" style="margin-top:8px;display:inline-block">📄 View Prescription</a>`:""}
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          ${o.status==="pending"?`<button class="btn btn-green btn-sm" onclick="updateOrder('${o.id}','accepted')">✅ Accept</button><button class="btn btn-red btn-sm" onclick="updateOrder('${o.id}','rejected')">❌ Reject</button>`:""}
          ${o.status==="accepted"?`<button class="btn btn-primary btn-sm" onclick="updateOrder('${o.id}','packed')">📦 Packed</button>`:""}
          ${o.status==="packed"?`<button class="btn btn-green btn-sm" onclick="updateOrder('${o.id}','delivered')">🚴 Delivered</button>`:""}
        </div>
        <button style="margin-top:8px;width:100%;padding:5px;background:none;border:1px solid #E5E7EB;border-radius:8px;color:#9CA3AF;font-size:11px;cursor:pointer" onclick="deleteOrder('${o.id}')">🗑️ Delete</button>
      </div>`).join("")
      :empty("📋","No orders yet. Prescription orders from patients will appear here.");
    if($("sd-avail-btn")){
    const av=u.is_available!==false;
    $("sd-avail-btn").textContent=av?"🟢 Store Open — Click to Close":"🔴 Store Closed — Click to Open";
    $("sd-avail-btn").style.background=av?"#059669":"#DC2626";
  }
  if($("sd-edit-btn"))$("sd-edit-btn").onclick=()=>showEditProfile("store");
  if($("sd-banner")){
    if(u.banner_url)$("sd-banner").innerHTML=`<img src="${u.banner_url}" style="width:100%;max-height:140px;object-fit:cover;border-radius:12px;margin-bottom:10px"/>`;
    else $("sd-banner").innerHTML="";
  }
  if($("sd-info"))$("sd-info").innerHTML=[
      ["🏪","Store Name",u.store_name],["👤","Owner",u.owner_name],
      ["📞","Phone",u.phone],["📍","Address",u.address||u.district],
      ["🕐","Hours",u.is_24x7?"24×7":(u.opening_time||"09:00")+" - "+(u.closing_time||"21:00")],
      ["🚴","Delivery",u.delivery_available?u.delivery_radius_km+"km":"Not Available"],
      ["💊","Drug License",u.drug_license_no||"—"],["✅","Status",u.approved?"Approved":"Pending"]
    ].map(([ic,l,v])=>`<div class="dd-info-item"><div class="dd-info-lbl">${ic} ${l}</div><div class="dd-info-val">${safe(v)||"—"}</div></div>`).join("");
  }catch(e){toast("Error: "+e.message,true);}
}
async function updateOrder(id,status){
  try{
    const ord=await DB.get("prescription_orders","id=eq."+id);
    const o=ord[0];
    await DB.patch("prescription_orders","id=eq."+id,{status}).catch(()=>{});
    if(o?.patient_id){
      const msgs={accepted:"Your order has been accepted! ✅",rejected:"Your order was rejected. ❌",packed:"Your order is packed and ready! 📦",delivered:"Your order has been delivered! 🚴"};
      await sendNotification(o.patient_id,"patient","Order Update",msgs[status]||"Order status: "+status,status==="rejected"?"warning":"success");
    }
    toast("Order: "+status+". Patient notified.");rStoreDash();
  }catch(e){toast(e.message,true);}
}
async function deleteOrder(id){
  if(!confirm("Delete this order permanently?"))return;
  try{await DB.del("prescription_orders","id=eq."+id);toast("Order deleted.");rStoreDash();}
  catch(e){toast(e.message,true);}
}

/* ════════ AMBULANCE DASH ════════ */
async function rAmbuDash(){
  if(!A.user){go("ambuLogin");return;}
  const u=A.user;
  if($("amd-nav-name"))$("amd-nav-name").textContent=u.operator_name;
  if($("amd-welcome"))$("amd-welcome").textContent="Welcome, "+safe(u.operator_name)+"! 🚑";
  if($("amd-stats"))$("amd-stats").innerHTML=
    sc("🚑","Vehicle",safe(u.vehicle_number)||"—")+
    sc("📍","Location",safe(u.base_location||u.district)||"—","#FEE9E1","#FF6B35")+
    sc("📞","Phone",safe(u.phone)||"—","#EDE9FE","#7C4DFF")+
    sc("🔴","Status",u.availability_status==="available"?"🟢 Online":"🔴 Offline","#D1FAE5","#059669");
  if($("amd-avail-btn")){
    const av=u.availability_status||"offline";
    $("amd-avail-btn").textContent=av==="available"?"🟢 Available — Click to go Offline":av==="busy"?"🟡 Busy":"🔴 Offline — Click to go Online";
    $("amd-avail-btn").style.background=av==="available"?"#059669":av==="busy"?"#D97706":"#DC2626";
  }
  if($("amd-info"))$("amd-info").innerHTML=[
    ["🚑","Vehicle No.",u.vehicle_number],["🚗","Type",u.vehicle_type],
    ["📞","Phone",u.phone],["📞","Alt. Phone",u.alternate_phone],
    ["📍","Base Location",u.base_location||u.district],
    ["💬","Pricing",u.pricing_info||"Contact for pricing"],
    ["💎","Subscription",(u.subscription||"—").toUpperCase()],
    ["✅","Status",u.approved?"Approved":"Pending Review"]
  ].map(([ic,l,v])=>`<div class="dd-info-item"><div class="dd-info-lbl">${ic} ${l}</div><div class="dd-info-val">${safe(v)||"—"}</div></div>`).join("");
  if($("amd-equipment"))$("amd-equipment").innerHTML=[
    ["🩸","Oxygen",u.has_oxygen],["🛏️","Stretcher",u.has_stretcher],
    ["📊","Monitor",u.has_monitor],["💨","Ventilator",u.has_ventilator],["⚡","Defibrillator",u.has_defibrillator]
  ].map(([ic,n,has])=>`<span style="padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;background:${has?"#D1FAE5":"#F3F4F6"};color:${has?"#059669":"#9CA3AF"}">${ic} ${n}: ${has?"✓":"✗"}</span>`).join("");
}
async function toggleAvailability(){
  if(!A.user)return;
  const cur=A.user.availability_status||"offline";
  const next=cur==="available"?"offline":"available";
  try{await DB.patch("ambulances","id=eq."+A.user.id,{availability_status:next}).catch(()=>{});A.user.availability_status=next;S.save(A.user,"ambulance");toast("Status: "+next);rAmbuDash();}
  catch(e){toast(e.message,true);}
}
async function toggleDoctorAvailability(){
  if(!A.user)return;
  const cur=A.user.is_available!==false;
  const next=!cur;
  try{
    const res=await DB.patch("doctors","id=eq."+A.user.id,{is_available:next});
    A.user.is_available=next;S.save(A.user,"doctor");
    toast("Status: "+(next?"Online 🟢":"Offline 🔴"));rDoctorDash();
  }catch(e){toast("Failed to update status: "+e.message,true);}
}
  async function toggleVideoConsult(){
  if(!A.user)return;
  const next=!A.user.video_consult;
  try{
    await DB.patch("doctors","id=eq."+A.user.id,{video_consult:next});
    A.user.video_consult=next;S.save(A.user,"doctor");
    toast(next?"Video Consult Enabled 🎥":"Video Consult Disabled");rDoctorDash();
  }catch(e){toast(e.message,true);}
}
async function toggleStoreAvailability(){
  if(!A.user)return;
  const cur=A.user.is_available!==false;
  const next=!cur;
  try{
    const res=await DB.patch("medical_stores","id=eq."+A.user.id,{is_available:next});
    A.user.is_available=next;S.save(A.user,"store");
    toast("Status: "+(next?"Open 🟢":"Closed 🔴"));rStoreDash();
  }catch(e){toast("Failed to update status: "+e.message,true);}
}
async function toggleLabAvailability(){
  if(!A.user)return;
  const cur=A.user.is_available!==false;
  const next=!cur;
  try{
    const res=await DB.patch("diagnostic_labs","id=eq."+A.user.id,{is_available:next});
    A.user.is_available=next;S.save(A.user,"lab");
    toast("Status: "+(next?"Open 🟢":"Closed 🔴"));rLabDash();
  }catch(e){toast("Failed to update status: "+e.message,true);}
}

/* ════════ LAB DASH ════════ */
async function rLabDash(){
  if(!A.user){go("labLogin");return;}
  const u=A.user;
  if($("ld-avail-btn")){
    const av=u.is_available!==false;
    $("ld-avail-btn").textContent=av?"🟢 Lab Open — Click to Close":"🔴 Lab Closed — Click to Open";
    $("ld-avail-btn").style.background=av?"#059669":"#DC2626";
  }
  if($("lab-edit-btn"))$("lab-edit-btn").onclick=()=>showEditProfile("lab");
  if($("lab-banner")){
    if(u.banner_url)$("lab-banner").innerHTML=`<img src="${u.banner_url}" style="width:100%;max-height:140px;object-fit:cover;border-radius:12px;margin-bottom:10px"/>`;
    else $("lab-banner").innerHTML="";
  }
  if($("ld-nav-name"))$("ld-nav-name").textContent=u.lab_name;
  if($("ld-welcome"))$("ld-welcome").textContent="Welcome, "+safe(u.lab_name)+"! 🔬";
  spin("ld-stats");spin("ld-bookings","Loading...");spin("ld-tests","Loading tests...");
  try{
    const[bk,tests]=await Promise.all([
      safeGet("lab_bookings","lab_id=eq."+u.id),
      safeGet("lab_tests","lab_id=eq."+u.id+"&is_active=eq.true")
    ]);
    if($("ld-stats"))$("ld-stats").innerHTML=
      sc("📅","Bookings",bk.length)+sc("⏳","Pending",bk.filter(b=>b.status==="booked").length,"#FEF3C7","#D97706")+
      sc("✅","Completed",bk.filter(b=>b.status==="completed").length,"#D1FAE5","#059669")+
      sc("🧪","Tests",tests.length,"#EDE9FE","#7C4DFF");
    if($("ld-bookings"))$("ld-bookings").innerHTML=bk.length?bk.map(b=>`<div class="appt-card" style="border-left:4px solid #7C4DFF">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px">
        <div><div style="font-size:14px;font-weight:700">${safe(b.patient_name)||"Patient"}</div>
        <div style="font-size:12px;color:#0A7FAF;font-weight:600">📞 ${safe(b.patient_phone)||"—"}</div>
        <div style="font-size:12px;color:#6B7280">🧪 ${safe(b.test_name)||"—"} · ₹${b.price||0}</div></div>
        ${sPill(b.status)}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
        ${b.status==="booked"?`<button class="btn btn-red btn-sm" onclick="cancelLabBooking('${b.id}')">❌ Cancel</button>
        <button class="btn btn-primary btn-sm" onclick="confirmLabBooking('${b.id}','${b.patient_id}','${safe(b.test_name)}')">✅ Confirm</button>`:""}
      </div>
      <button style="margin-top:8px;width:100%;padding:5px;background:none;border:1px solid #E5E7EB;border-radius:8px;color:#9CA3AF;font-size:11px;cursor:pointer" onclick="deleteLabBooking('${b.id}')">🗑️ Delete</button>
    </div>`).join(""):empty("📅","No bookings yet.");
    if($("ld-tests"))$("ld-tests").innerHTML=tests.length?`<div style="display:grid;gap:8px">`+tests.map(t=>`<div style="background:#F9FAFB;border-radius:10px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px"><div><div style="font-size:13px;font-weight:600;color:#1A2B3C">${t.test_name}</div><div style="font-size:11px;color:#9CA3AF">${t.category} · ${t.report_time||"Same Day"}</div></div><div style="font-size:13px;font-weight:600;color:#7C4DFF">₹${t.price}</div></div>`).join("")+"</div>":empty("🧪","No tests added yet.",`<button class="btn btn-purple btn-sm" onclick="showAddTestForm()">+ Add Test</button>`);
    if($("ld-info"))$("ld-info").innerHTML=[
      ["🔬","Lab Name",u.lab_name],["👤","Owner",u.owner_name],
      ["📞","Phone",u.phone],["📍","Address",u.address||u.district],
      ["🏷️","Lab Type",(u.lab_type||"").replace("_"," ")],["📋","License No.",u.lab_registration_no],
      ["🏠","Home Collection",u.home_collection?"Yes - ₹"+u.home_collection_charge:"No"],
      ["💎","Subscription",(u.subscription||"—").toUpperCase()],
      ["✅","Status",u.approved?"Approved":"Pending"]
    ].map(([ic,l,v])=>`<div class="dd-info-item"><div class="dd-info-lbl">${ic} ${l}</div><div class="dd-info-val">${safe(v)||"—"}</div></div>`).join("");
  }catch(e){toast("Error: "+e.message,true);}
}
async function confirmLabBooking(bookingId,patientId,testName){
  try{
    await DB.patch("lab_bookings","id=eq."+bookingId,{status:"sample_collected"});
    if(patientId&&patientId!=="undefined"){
      await sendNotification(patientId,"patient","Lab Test Confirmed ✅",
        "Your test "+testName+" has been confirmed by "+safe(A.user.lab_name)+".","success");
    }
    toast("Booking confirmed! Patient notified. ✅");
    rLabDash();
  }catch(e){toast(e.message,true);}
}
async function cancelLabBooking(bookingId){
  if(!confirm("Cancel this booking?"))return;
  try{
    const bk=await DB.get("lab_bookings","id=eq."+bookingId);
    const b=bk[0];
    await DB.patch("lab_bookings","id=eq."+bookingId,{status:"cancelled"});
    if(b?.patient_id){
      await sendNotification(b.patient_id,"patient","Lab Test Cancelled ❌",
        "Your test "+safe(b.test_name)+" with "+safe(A.user.lab_name)+" has been cancelled.","warning");
    }
    toast("Booking cancelled. Patient notified.");
    rLabDash();
  }catch(e){toast(e.message,true);}
}
async function deleteLabBooking(bookingId){
  if(!confirm("Delete this booking permanently?"))return;
  try{await DB.del("lab_bookings","id=eq."+bookingId);toast("Booking deleted.");rLabDash();}
  catch(e){toast(e.message,true);}
}
function showAddTestForm(){const f=$("add-test-form");if(f)f.style.display=f.style.display==="none"?"block":"none";}
async function addLabTest(){
  if(!A.user)return;
  const name=gv("test-name"),cat=gv("test-cat"),price=gv("test-price"),time=gv("test-time");
  if(!name||!cat||!price){toast("Fill all fields.",true);return;}
  try{await DB.post("lab_tests",{lab_id:A.user.id,test_name:name,category:cat,price:parseInt(price),report_time:time||"Same Day",is_active:true,home_available:A.user.home_collection||false});toast("Test added! 🧪");if($("add-test-form"))$("add-test-form").style.display="none";rLabDash();}catch(e){toast(e.message,true);}
}

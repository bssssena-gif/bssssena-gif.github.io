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
  {n:"General Medicine",i:"🏥",c:"#009688"},{n:"Gynecology",i:"🌸",c:"#E91E63"}
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

function avt(n,c="#0A7FAF",sz=48){
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
function logout(){
  S.clear();A.user=null;A.role=null;
  A.cache={docs:[],pats:[],stores:[],labs:[],ambus:[],appts:[],notifs:[]};
  toast("Logged out.");go("landing");
}
function redirectRole(role){
  const r={patient:"patientDash",doctor:"doctorDash",store:"storeDash",ambulance:"ambuDash",lab:"labDash",homeprovider: "home_providers",  hospital: "hospitals",admin:null};
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
    toast("Welcome, "+rows[0].name+"! 👋");redirectRole("patient");
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
    toast("Welcome to DocNear, "+name+"! 🎉");redirectRole("patient");
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
          ${avt(s.store_name||s.name,"#10B981",48)}
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
          ${avt(a.operator_name,"#EF4444",48)}
          <div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1A2B3C">${safe(a.operator_name)}</div>
          <div style="font-size:12px;color:#EF4444">🚑 ${safe(a.vehicle_type||"Ambulance")}</div>
          <div style="font-size:11px;color:#6B7280">📍 ${safe(a.base_location||a.district||"—")}</div>
          <div style="font-size:11px;color:#059669;font-weight:600">🟢 Available</div></div>
        </div>
        <div style="font-size:12px;color:#6B7280;margin-bottom:8px">📞 ${safe(a.phone||"—")}</div>
        <button class="btn btn-primary" style="width:100%;font-size:12px;padding:7px;background:#EF4444;border-color:#EF4444">Book Ambulance</button>
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
          ${avt(l.lab_name||l.name,"#7C4DFF",48)}
          <div style="flex:1"><div style="font-size:14px;font-weight:700;color:#1A2B3C">${safe(l.lab_name||l.name)}</div>
          <div style="font-size:12px;color:#7C4DFF">🔬 Diagnostic Lab</div>
          <div style="font-size:11px;color:#6B7280">📍 ${safe(l.district||l.city||"—")}</div>
          <div style="font-size:11px;color:${l.is_available!==false?"#059669":"#DC2626"};font-weight:600">${l.is_available!==false?"🟢 Open":"🔴 Closed"}</div></div>
        </div>
        <button class="btn btn-primary" style="width:100%;font-size:12px;padding:7px;background:#7C4DFF;border-color:#7C4DFF">Book Lab Test</button>
      </div>`).join(""):empty("🔬","No labs nearby.");
    }).catch(()=>{lbc.innerHTML=empty("🔬","No labs nearby.");});
  }
  DB.get("doctors","approved=eq.true&limit=1").then(()=>{A.demo=false;}).catch(()=>{A.demo=true;});
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
      ${avt(d.name,d.color||sc,54)}
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
      <div style="font-size:16px;font-weight:700;color:#059669">🆓 Free</div>
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
function storeCard(s){
  let isOpen=s.is_available!==false;
  return `<div class="card" onclick="viewStore('${s.id}')">
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
      <a href="tel:${s.phone}" class="btn btn-outline btn-sm" onclick="event.stopPropagation()">📞 Call</a>
      <a href="${getMapLink(s.store_name||s.name,s.district||s.city)}" target="_blank" class="btn btn-outline btn-sm" onclick="event.stopPropagation()">📍 Map</a>
      <button class="btn btn-green" style="flex:1;padding:7px 0;font-size:12px" onclick="event.stopPropagation();prescForStore('${s.id}')">📋 Order Medicines</button>
    </div>
  </div>`;
}
function viewStore(id){A.store=A.cache.stores.find(s=>s.id===id);go("storeDetail");}
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
      <a href="tel:${s.phone}" class="btn btn-outline btn-full">📞 Call Now</a>
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
        <a href="tel:${a.phone}" class="btn btn-outline btn-full">📞 Call Now</a>
        <a href="${getMapLink(a.operator_name,a.base_location||a.district)}" target="_blank" class="btn btn-outline btn-full">📍 Map</a>
        <a href="tel:${a.alternate_phone||a.phone}" class="btn btn-red btn-full">🚑 Emergency</a>
      </div>
    </div>`).join("");
  }catch(e){listEl.innerHTML=DEMO.ambus.map(a=>`<div class="card"><div style="font-size:15px;font-weight:700;margin-bottom:8px">${safe(a.operator_name)}</div><a href="tel:${a.phone}" class="btn btn-red btn-full">📞 ${a.phone}</a></div>`).join("");}
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
  return `<div class="card" onclick="viewLab('${l.id}')">
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
      <a href="tel:${l.phone}" class="btn btn-outline btn-sm" onclick="event.stopPropagation()">📞 Call</a>
      <a href="${getMapLink(l.lab_name||l.name,l.district||l.city)}" target="_blank" class="btn btn-outline btn-sm" onclick="event.stopPropagation()">📍 Map</a>
      <button class="btn btn-purple" style="flex:1;padding:7px 0;font-size:12px" onclick="event.stopPropagation();viewLab('${l.id}')">Book Tests</button>
    </div>
  </div>`;
}
async function viewLab(id){
  A.lab=A.cache.labs.find(l=>l.id===id)||DEMO.labs.find(l=>l.id===id);go("labDetail");
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
    <a href="tel:${l.phone}" class="btn btn-outline btn-full">📞 Call to Book</a>
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
            <button class="btn btn-red btn-sm" onclick="deleteMedicalRecord('${r.id}')">🗑️</button>
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
        ${d.phone?`<a href="tel:${safe(d.phone)}" class="btn btn-primary btn-sm" style="margin-top:10px;width:100%;display:block;text-align:center;background:#DC2626">📞 Contact Donor</a>`:""}
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
      <td style="padding:8px;text-align:center"><button onclick="deleteVital('${v.id}')" style="background:none;border:none;cursor:pointer;color:#9CA3AF;font-size:14px">🗑️</button></td>
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
  // Hide booking form initially
  const bookingForm=$("hs-booking-form");if(bookingForm)bookingForm.style.display="none";
  const sel=$("hs-selected-provider");if(sel)sel.style.display="none";
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
      ${avt(p.name,typeColor,54)}
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
    <button class="btn btn-primary" style="width:100%" onclick="selectHSProvider('${p.id}','${safe(p.name)}','${safe(p.service_type)}')">📅 Book This Provider</button>
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
          <div style="font-size:12px;color:#6B7280">📞 <a href="tel:${safe(b.phone)}" style="color:#0891B2">${safe(b.phone)}</a></div>
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
      ${h.phone?`<a href="tel:${safe(h.phone)}" class="btn btn-primary btn-sm" style="background:#DC2626;flex:1;text-align:center">📞 Call</a>`:""}
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
    if(A.user&&A.role){
      creator.style.display="block";
      const av=$("feed-post-avatar");
      if(av){av.textContent=safe(A.user.name||A.user.store_name||"U").charAt(0).toUpperCase();}
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
      ${A.user&&(p.author_id===A.user.id||A.role==="admin")?`<button onclick="deletePost('${p.id}')" style="background:none;border:none;cursor:pointer;color:#9CA3AF;font-size:12px;margin-left:auto">🗑️</button>`:""}
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
            ${A.user&&(c.author_id===A.user.id)?`<button onclick="deleteComment('${c.id}','${c.post_id}',this)" style="background:none;border:none;cursor:pointer;color:#9CA3AF;font-size:11px;padding:0">🗑️</button>`:""}
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

document.addEventListener("DOMContentLoaded",()=>{
  // Initial state push — Android back button కి
  history.replaceState({page:"landing"},"",window.location.pathname);
  const sess=S.load();
  const params=new URLSearchParams(window.location.search);
  const fromAdmin=params.get("from")==="admin";
  if(fromAdmin){history.replaceState(null,"",window.location.pathname);}
  if(sess&&!fromAdmin){
    A.user=sess.u;A.role=sess.r;
    refreshUserData(sess.r,sess.u.id).then(()=>redirectRole(sess.r));
  }
  else if(sess&&fromAdmin){A.user=sess.u;A.role=sess.r;rLanding();}
  else rLanding();
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

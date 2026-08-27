/* CivicFix - vanilla JavaScript application */
const STORAGE_KEY = "civicfix_reports_v1";
const THEME_KEY = "civicfix_theme";
const CATEGORIES = ["Pothole","Streetlight","Garbage","Water leakage","Road damage","Drainage","Traffic signal","Public safety","Other"];
const DEPARTMENTS = {
  "Pothole":"Roads & Transport","Streetlight":"Electrical Services","Garbage":"Waste Management",
  "Water leakage":"Water & Utilities","Road damage":"Roads & Transport","Drainage":"Water & Utilities",
  "Traffic signal":"Traffic Management","Public safety":"Public Safety","Other":"Municipal Services"
};
const CATEGORY_ICONS = {"Pothole":"P","Streetlight":"S","Garbage":"G","Water leakage":"W","Road damage":"R","Drainage":"D","Traffic signal":"T","Public safety":"!" ,"Other":"O"};
const CATEGORY_COLORS = {"Pothole":"#d64545","Streetlight":"#d88700","Garbage":"#0f9d72","Water leakage":"#1769ff","Road damage":"#7657d9","Drainage":"#0891b2","Traffic signal":"#ef5da8","Public safety":"#334155","Other":"#64748b"};
const CITY_CENTER = [13.0827,80.2707];
let reports = [];
let dashboardMap, fullMap;
let mapMarkers = {dashboard:[], full:[]};
let charts = {};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function uid(){ return "CF-" + Math.random().toString(36).slice(2,7).toUpperCase() + "-" + Date.now().toString().slice(-4); }
function dateOnly(d){ return new Date(d+"T12:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); }
function daysBetween(a,b){ return Math.max(1, Math.round((new Date(b)-new Date(a))/86400000)); }
function escapeHTML(str){ return String(str ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c])); }
function toast(message,type="success"){ const el=document.createElement("div"); el.className=`toast ${type}`; el.textContent=message; $("#toastContainer").appendChild(el); setTimeout(()=>el.remove(),3200); }

function makeDemoReports(){
  const raw = [
    ["Pothole on Mount Road","Large pothole affecting two lanes near the bus stop.","Pothole","Anna Salai","2026-08-21","High",3,4,3,"Resolved",-4],
    ["Streetlight out near school","Three lamps are not working on the eastern footpath.","Streetlight","Adyar Main Road","2026-08-20","High",3,3,3,"In Progress",-2],
    ["Overflowing community bin","Waste collection point has been overflowing since yesterday.","Garbage","T. Nagar Market","2026-08-19","Medium",2,3,1,"Assigned",-1],
    ["Water leaking into road","Continuous water flow from a damaged roadside pipe.","Water leakage","Velachery Main Road","2026-08-18","High",4,4,3,"In Progress",-1],
    ["Broken road surface","Uneven surface and loose gravel creating a driving hazard.","Road damage","Nungambakkam High Road","2026-08-17","Medium",2,3,2,"Resolved",-5],
    ["Blocked storm drain","Drain grate is blocked with leaves and plastic.","Drainage","Besant Nagar","2026-08-16","Medium",2,2,1,"Resolved",-7],
    ["Traffic signal timing issue","Signal stays red for unusually long periods during peak hours.","Traffic signal","Guindy Junction","2026-08-15","High",3,4,2,"In Progress",-3],
    ["Unsafe open construction area","Unprotected edge beside a public walkway needs barriers.","Public safety","Mylapore","2026-08-14","High",4,3,3,"Assigned",-2],
    ["Roadside garbage pile","Mixed waste accumulated beside the residential lane.","Garbage","Royapettah","2026-08-12","Low",1,2,1,"Resolved",-10],
    ["Pothole cluster","Multiple potholes forming after recent rainfall.","Pothole","Perambur","2026-08-11","Medium",2,3,2,"Resolved",-8],
    ["Damaged street sign","Directional sign is bent and difficult to read.","Other","Egmore","2026-08-09","Low",1,1,0,"Reported",0],
    ["Drain overflow","Stormwater is backing up onto the service road.","Drainage","Tambaram","2026-08-07","High",3,4,3,"Resolved",-11],
    ["Broken pedestrian crossing","Crossing markings are faded and difficult to see.","Road damage","Alandur","2026-08-05","Medium",2,2,2,"Resolved",-13],
    ["Streetlight flickering","Lamp flickers and turns off intermittently.","Streetlight","Thiruvanmiyur","2026-08-03","Low",1,1,1,"Resolved",-9],
    ["Water seepage","Water is pooling around a damaged utility cover.","Water leakage","Kodambakkam","2026-08-01","Medium",2,2,2,"Assigned",-4],
    ["Damaged traffic sign","Stop sign has been damaged at a busy crossing.","Traffic signal","Kilpauk","2026-07-29","High",3,3,3,"Resolved",-15],
    ["Illegal dumping","Construction debris dumped beside the canal.","Garbage","Maduravoyal","2026-07-25","Medium",2,3,1,"Resolved",-17],
    ["Pothole near hospital","Deep pothole close to the emergency entrance.","Pothole","Saidapet","2026-07-22","High",4,3,3,"Resolved",-18]
  ];
  const coords = [[13.0569,80.2425],[13.0067,80.2570],[13.0418,80.2341],[12.9815,80.2180],[13.0565,80.2350],[13.0004,80.2660],[13.0108,80.2066],[13.0339,80.2676],[13.0536,80.2609],[13.1177,80.2151],[13.0732,80.2609],[12.9249,80.1000],[13.0034,80.2019],[12.9830,80.2600],[12.9830,80.2690],[13.0500,80.2200],[13.0600,80.1700],[13.0213,80.2210]];
  return raw.map((r,i)=>{
    const [title,description,category,location,date,priority,severity,affected,safety,status,offset] = r;
    const resolutionDate = status==="Resolved" ? new Date(new Date(date+"T12:00:00").getTime()+Math.abs(offset)*86400000).toISOString().slice(0,10) : null;
    const history = buildHistory(status,date,resolutionDate);
    return {id:`CF-${String(2400+i).padStart(4,"0")}`,title,description,category,location,date,priority,severity,affected,safety,status,department:DEPARTMENTS[category],resolutionDate,lat:coords[i][0],lng:coords[i][1],history,createdAt:new Date(date+"T12:00:00").getTime()};
  });
}
function buildHistory(status,date,resolutionDate){
  const steps=["Reported","Assigned","In Progress","Resolved"];
  const idx=steps.indexOf(status);
  return steps.map((s,i)=>{
    if(i>idx) return {status:s,date:null};
    let d=new Date(date+"T12:00:00"); d.setDate(d.getDate()+i);
    if(s==="Resolved" && resolutionDate) d=new Date(resolutionDate+"T12:00:00");
    return {status:s,date:d.toISOString().slice(0,10)};
  });
}
function loadReports(){
  const saved=localStorage.getItem(STORAGE_KEY);
  reports=saved ? JSON.parse(saved) : makeDemoReports();
  if(!saved) saveReports();
}
function saveReports(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(reports)); }

function priorityScore(category,severity,affected,safety){
  const categoryWeight={Pothole:2,Streetlight:1,Garbage:1,"Water leakage":2,"Road damage":2,Drainage:2,"Traffic signal":3,"Public safety":3,Other:1}[category]||1;
  const score=categoryWeight*1.15 + Number(severity)*1.7 + Number(affected)*1.4 + Number(safety)*2.2;
  return score>=16 ? "High" : score>=10 ? "Medium" : "Low";
}
function priorityReason(category,severity,affected,safety){
  const parts=[];
  if(["Traffic signal","Public safety"].includes(category)) parts.push("safety-sensitive category");
  if(Number(severity)>=3) parts.push("high severity");
  if(Number(affected)>=3) parts.push("large affected population");
  if(Number(safety)>=2) parts.push("elevated safety risk");
  return parts.length ? parts.join(" + ") : "lower combined risk factors";
}
function badge(type,text=type){ return `<span class="badge ${type.toLowerCase().replaceAll(" ","-")}">${escapeHTML(text)}</span>`; }

function renderStats(){
  const total=reports.length, open=reports.filter(r=>r.status==="Reported").length, progress=reports.filter(r=>["Assigned","In Progress"].includes(r.status)).length, resolved=reports.filter(r=>r.status==="Resolved").length, high=reports.filter(r=>r.priority==="High").length;
  const data=[["Total reports",total,"All citizen reports","◉"],["Open reports",open,"Awaiting assignment","○"],["In progress",progress,"Assigned or being handled","↻"],["Resolved",resolved,`${total?Math.round(resolved/total*100):0}% of all reports`,"✓"],["High priority",high,"Requires close attention","!"]];
  $("#statGrid").innerHTML=data.map(x=>`<div class="stat-card"><div class="stat-top"><span class="stat-label">${x[0]}</span><span class="stat-icon">${x[3]}</span></div><div class="stat-value">${x[1]}</div><div class="stat-note">${x[2]}</div></div>`).join("");
}
function renderRecent(){
  const items=[...reports].sort((a,b)=>b.createdAt-a.createdAt).slice(0,6);
  $("#recentReports").innerHTML=items.map(r=>`<div class="activity-item"><div><div class="activity-title">${escapeHTML(r.title)}</div><div class="activity-meta">${escapeHTML(r.location)} · ${dateOnly(r.date)}</div></div>${badge(r.priority.toLowerCase(),r.priority)}</div>`).join("");
}
function renderPriority(){
  const items=reports.filter(r=>r.priority==="High"&&r.status!=="Resolved").sort((a,b)=>b.severity-a.severity).slice(0,5);
  $("#priorityList").innerHTML=items.length?items.map(r=>`<div class="priority-row"><span class="priority-dot"></span><strong>${escapeHTML(r.title)}</strong><small>${escapeHTML(r.location)}</small>${badge(r.status,r.status)}</div>`).join(""):`<div class="empty-state" style="padding:30px 0"><p>No unresolved high-priority reports.</p></div>`;
}
function renderMiniChart(){
  const statuses=["Reported","Assigned","In Progress","Resolved"];
  const counts=statuses.map(s=>reports.filter(r=>r.status===s).length), max=Math.max(...counts,1);
  $("#miniStatusChart").innerHTML=`<div class="mini-bars">${counts.map((n,i)=>`<div class="mini-bar-group"><span class="mini-bar-value">${n}</span><div class="mini-bar" style="height:${Math.max(5,n/max*145)}px"></div><span class="mini-bar-label">${statuses[i]}</span></div>`).join("")}</div>`;
}
function renderReports(){
  const q=$("#searchInput").value.toLowerCase().trim(), cat=$("#categoryFilter").value, pri=$("#priorityFilter").value, stat=$("#statusFilter").value, sort=$("#sortFilter").value;
  let rows=reports.filter(r=>(!q||[r.id,r.title,r.location,r.description].join(" ").toLowerCase().includes(q))&&(!cat||r.category===cat)&&(!pri||r.priority===pri)&&(!stat||r.status===stat));
  rows.sort((a,b)=>sort==="newest"?b.createdAt-a.createdAt:a.createdAt-b.createdAt);
  $("#reportsTable").innerHTML=rows.map(r=>`<tr><td><div class="issue-cell"><div class="issue-avatar">${CATEGORY_ICONS[r.category]||"O"}</div><div><div class="issue-name">${escapeHTML(r.title)}</div><div class="issue-id">${r.id} · ${escapeHTML(r.location)}</div></div></div></td><td>${escapeHTML(r.category)}</td><td>${badge(r.priority.toLowerCase(),r.priority)}</td><td>${badge(r.status,r.status)}</td><td>${escapeHTML(r.department)}</td><td>${dateOnly(r.date)}</td><td><button class="row-action" data-detail="${r.id}">View</button></td></tr>`).join("");
  $("#emptyState").classList.toggle("hidden",rows.length>0);
}
function populateCategories(){
  $("#categoryFilter").innerHTML='<option value="">All categories</option>'+CATEGORIES.map(c=>`<option>${c}</option>`).join("");
  $("#formCategory").innerHTML=CATEGORIES.map(c=>`<option>${c}</option>`).join("");
}

function markerIcon(category){
  return L.divIcon({className:"custom-marker",html:`<div style="width:25px;height:25px;border-radius:50%;background:${CATEGORY_COLORS[category]||"#64748b"};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.25);display:grid;place-items:center;color:white;font-size:9px;font-weight:800">${CATEGORY_ICONS[category]||"O"}</div>`,iconSize:[25,25],iconAnchor:[12,12]});
}
function popup(r){ return `<strong>${escapeHTML(r.title)}</strong><p>${escapeHTML(r.category)} · ${escapeHTML(r.location)}</p><div>${badge(r.priority.toLowerCase(),r.priority)} ${badge(r.status,r.status)}</div>`; }
function createMap(id){
  const map=L.map(id,{scrollWheelZoom:false}).setView(CITY_CENTER,11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
  return map;
}
function renderMap(map,type){
  mapMarkers[type].forEach(m=>m.remove()); mapMarkers[type]=[];
  reports.forEach(r=>{ if(!r.lat||!r.lng)return; const m=L.marker([r.lat,r.lng],{icon:markerIcon(r.category)}).addTo(map).bindPopup(popup(r)); mapMarkers[type].push(m); });
}
function initMaps(){
  if(!dashboardMap) dashboardMap=createMap("dashboardMap");
  renderMap(dashboardMap,"dashboard");
  if(!fullMap) fullMap=createMap("fullMap");
  renderMap(fullMap,"full");
  setTimeout(()=>{dashboardMap.invalidateSize();fullMap.invalidateSize()},100);
}
function renderLegend(){
  $("#mapLegend").innerHTML=CATEGORIES.map(c=>`<span class="legend-chip"><i class="legend-dot" style="background:${CATEGORY_COLORS[c]}"></i>${c}</span>`).join("");
}

function canvasSetup(canvas){
  const rect=canvas.getBoundingClientRect(), dpr=window.devicePixelRatio||1;
  canvas.width=rect.width*dpr; canvas.height=rect.height*dpr;
  const ctx=canvas.getContext("2d"); ctx.scale(dpr,dpr); return {ctx,w:rect.width,h:rect.height};
}
function drawBar(canvas,labels,values,horizontal=false){
  const {ctx,w,h}=canvasSetup(canvas), max=Math.max(...values,1);
  ctx.clearRect(0,0,w,h); ctx.font="10px system-ui"; ctx.fillStyle="#7c899a";
  const pad={l:horizontal?115:35,r:15,t:15,b:35}; const cw=w-pad.l-pad.r,ch=h-pad.t-pad.b;
  ctx.strokeStyle=getComputedStyle(document.body).getPropertyValue("--line");ctx.lineWidth=1;
  for(let i=0;i<4;i++){const y=pad.t+ch*i/3;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();}
  if(horizontal){
    const bh=Math.min(24,(ch/labels.length)*.58);
    labels.forEach((lab,i)=>{const y=pad.t+i*(ch/labels.length)+(ch/labels.length-bh)/2;ctx.fillStyle="#687689";ctx.textAlign="right";ctx.fillText(lab,pad.l-9,y+bh/2+3);ctx.fillStyle="#4f8fff";ctx.fillRect(pad.l,y,(cw*values[i]/max),bh);ctx.fillStyle="#34445a";ctx.textAlign="left";ctx.fillText(values[i],pad.l+cw*values[i]/max+6,y+bh/2+3);});
  }else{
    const bw=Math.min(46,cw/labels.length*.55); const gap=cw/labels.length;
    labels.forEach((lab,i)=>{const x=pad.l+i*gap+(gap-bw)/2, bh=ch*values[i]/max;ctx.fillStyle="#4f8fff";ctx.fillRect(x,pad.t+ch-bh,bw,bh);ctx.fillStyle="#34445a";ctx.textAlign="center";ctx.fillText(values[i],x+bw/2,pad.t+ch-bh-6);ctx.fillStyle="#7c899a";ctx.fillText(lab,x+bw/2,pad.t+ch+18);});
  }
}
function drawLine(canvas,labels,values){
  const {ctx,w,h}=canvasSetup(canvas), max=Math.max(...values,1), pad={l:35,r:15,t:20,b:35},cw=w-pad.l-pad.r,ch=h-pad.t-pad.b;
  ctx.clearRect(0,0,w,h);ctx.font="10px system-ui";ctx.strokeStyle=getComputedStyle(document.body).getPropertyValue("--line");
  for(let i=0;i<4;i++){const y=pad.t+ch*i/3;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();}
  const pts=values.map((v,i)=>[pad.l+(cw*(values.length===1?0:i/(values.length-1))),pad.t+ch-(v/max)*ch]);
  ctx.strokeStyle="#1769ff";ctx.lineWidth=3;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();
  pts.forEach((p,i)=>{ctx.fillStyle="#fff";ctx.strokeStyle="#1769ff";ctx.lineWidth=2;ctx.beginPath();ctx.arc(p[0],p[1],4,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle="#687689";ctx.textAlign="center";ctx.fillText(labels[i],p[0],h-10);ctx.fillStyle="#34445a";ctx.fillText(values[i],p[0],p[1]-9);});
}
function drawDoughnut(canvas,labels,values){
  const {ctx,w,h}=canvasSetup(canvas), total=values.reduce((a,b)=>a+b,0)||1,cx=w*.38,cy=h/2,r=Math.min(w*.27,h*.36);
  ctx.clearRect(0,0,w,h);let start=-Math.PI/2;const cols=["#1769ff","#7657d9","#d88700","#0f9d72"];
  values.forEach((v,i)=>{const end=start+v/total*Math.PI*2;ctx.beginPath();ctx.arc(cx,cy,r,start,end);ctx.lineWidth=30;ctx.strokeStyle=cols[i];ctx.stroke();start=end;});
  ctx.fillStyle=getComputedStyle(document.body).getPropertyValue("--text");ctx.font="800 20px system-ui";ctx.textAlign="center";ctx.fillText(total,cx,cy+6);
  ctx.font="9px system-ui";ctx.fillStyle="#7c899a";ctx.fillText("reports",cx,cy+21);
  labels.forEach((l,i)=>{const y=cy-42+i*24;ctx.fillStyle=cols[i];ctx.fillRect(w*.7,y-6,8,8);ctx.fillStyle="#526174";ctx.textAlign="left";ctx.fillText(`${l}  ${values[i]}`,w*.7+14,y);});
}
function renderAnalytics(){
  drawBar($("#categoryChart"),CATEGORIES,reports.reduce((a,r)=>(a[r.category]=(a[r.category]||0)+1,a),{}),true);
  const catCounts=CATEGORIES.map(c=>reports.filter(r=>r.category===c).length);
  drawBar($("#categoryChart"),CATEGORIES,catCounts,true);
  const areaMap={};reports.forEach(r=>areaMap[r.location]=(areaMap[r.location]||0)+1);const areas=Object.entries(areaMap).sort((a,b)=>b[1]-a[1]).slice(0,8);drawBar($("#areaChart"),areas.map(x=>x[0]),areas.map(x=>x[1]),true);
  const resolved=reports.filter(r=>r.status==="Resolved"), resByCat=CATEGORIES.map(c=>{const rs=resolved.filter(r=>r.category===c);return rs.length?Math.round(rs.reduce((s,r)=>s+daysBetween(r.date,r.resolutionDate),0)/rs.length*10)/10:0});drawBar($("#resolutionChart"),CATEGORIES,resByCat,true);
  const months=["Mar","Apr","May","Jun","Jul","Aug"], monthly=months.map((m,idx)=>reports.filter(r=>new Date(r.date).getMonth()===idx+2).length);drawLine($("#monthlyChart"),months,monthly);
  const statuses=["Reported","Assigned","In Progress","Resolved"], sc=statuses.map(s=>reports.filter(r=>r.status===s).length);drawDoughnut($("#statusChart"),statuses,sc);
}
function openDetail(id){
  const r=reports.find(x=>x.id===id); if(!r)return;
  $("#detailTitle").textContent=r.title;
  const history=r.history||buildHistory(r.status,r.date,r.resolutionDate), steps=["Reported","Assigned","In Progress","Resolved"], current=steps.indexOf(r.status);
  $("#detailContent").innerHTML=`<div class="detail-header"><div class="issue-avatar">${CATEGORY_ICONS[r.category]||"O"}</div><div><h3>${escapeHTML(r.id)}</h3><div class="detail-meta">${escapeHTML(r.category)} · ${escapeHTML(r.location)}</div></div><div style="margin-left:auto">${badge(r.priority.toLowerCase(),r.priority)} ${badge(r.status,r.status)}</div></div>
  <div class="detail-grid"><div class="detail-card"><span>Assigned department</span><strong>${escapeHTML(r.department)}</strong></div><div class="detail-card"><span>Report date</span><strong>${dateOnly(r.date)}</strong></div><div class="detail-card"><span>Resolution date</span><strong>${r.resolutionDate?dateOnly(r.resolutionDate):"Pending"}</strong></div><div class="detail-card"><span>Smart priority factors</span><strong>${escapeHTML(priorityReason(r.category,r.severity,r.affected,r.safety))}</strong></div></div>
  <div class="detail-description">${escapeHTML(r.description)}</div><span class="eyebrow">STATUS TIMELINE</span><div class="timeline">${history.map((h,i)=>`<div class="timeline-item ${i<=current?"done":""}"><strong>${h.status}</strong><small>${h.date?dateOnly(h.date):"Awaiting next stage"}</small></div>`).join("")}</div>`;
  $("#detailModal").classList.remove("hidden");
}
function openReportModal(){
  $("#reportForm").reset();$("#imagePreview").classList.add("hidden");$("#imagePreview").removeAttribute("src");$("#reportModal").classList.remove("hidden");
  const d=new Date();$("#reportForm [name=date]").value=d.toISOString().slice(0,10);updateSmartPriority();
}
function closeModal(id){$("#"+id).classList.add("hidden");}

function setupNavigation(){
  $$("[data-view]").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.view)));
  $("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
}
function showView(view){
  $$(".view").forEach(v=>v.classList.remove("active"));$("#"+view+"View").classList.add("active");
  $$(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.view===view));
  $("#pageTitle").textContent={dashboard:"Dashboard",reports:"Issue reports",map:"City map",analytics:"Analytics"}[view]||"Dashboard";
  $("#sidebar").classList.remove("open");
  if(view==="map"){setTimeout(()=>fullMap.invalidateSize(),50)}
  if(view==="analytics"){setTimeout(renderAnalytics,60)}
}
function setupForm(){
  const form=$("#reportForm"), imageInput=$("#imageInput");
  ["category","severity","affected","safety"].forEach(n=>form.elements[n].addEventListener("change",updateSmartPriority));
  imageInput.addEventListener("change",()=>{const file=imageInput.files[0];if(!file)return;const reader=new FileReader();reader.onload=e=>{$("#imagePreview").src=e.target.result;$("#imagePreview").classList.remove("hidden")};reader.readAsDataURL(file)});
  form.addEventListener("submit",e=>{
    e.preventDefault();const data=new FormData(form);const category=data.get("category"),severity=data.get("severity"),affected=data.get("affected"),safety=data.get("safety");
    const priority=priorityScore(category,severity,affected,safety), date=data.get("date");
    const finish=r=>{const coords=[CITY_CENTER[0]+(Math.random()-.5)*.22,CITY_CENTER[1]+(Math.random()-.5)*.25];reports.unshift({id:uid(),title:data.get("title"),description:data.get("description"),category,location:data.get("location"),date,priority,severity:Number(severity),affected:Number(affected),safety:Number(safety),status:"Reported",department:DEPARTMENTS[category],resolutionDate:null,lat:coords[0],lng:coords[1],history:buildHistory("Reported",date,null),createdAt:Date.now(),image:r||null});saveReports();renderAll();closeModal("reportModal");toast(`Report submitted as ${priority} priority.`);showView("reports");};
    const file=imageInput.files[0]; if(file){const reader=new FileReader();reader.onload=()=>finish(reader.result);reader.readAsDataURL(file)}else finish(null);
  });
}
function updateSmartPriority(){const f=$("#reportForm"),p=priorityScore(f.elements.category.value,f.elements.severity.value,f.elements.affected.value,f.elements.safety.value);$("#smartPriority").textContent=p;$("#smartPriority").style.color=p==="High"?"var(--danger)":p==="Medium"?"var(--warning)":"var(--success)";$("#priorityReason").textContent=priorityReason(f.elements.category.value,f.elements.severity.value,f.elements.affected.value,f.elements.safety.value);}
function renderAll(){renderStats();renderRecent();renderPriority();renderMiniChart();renderReports();renderLegend();if(dashboardMap)renderMap(dashboardMap,"dashboard");if(fullMap)renderMap(fullMap,"full");}

function init(){
  loadReports();populateCategories();renderAll();initMaps();setupNavigation();setupForm();
  ["#searchInput","#categoryFilter","#priorityFilter","#statusFilter","#sortFilter"].forEach(s=>$(s).addEventListener("input",renderReports));
  $("#heroReportBtn").onclick=openReportModal;$("#reportsNewBtn").onclick=openReportModal;$("#sidebarReportBtn").onclick=openReportModal;
  document.addEventListener("click",e=>{const detail=e.target.closest("[data-detail]");if(detail)openDetail(detail.dataset.detail);const close=e.target.closest("[data-close]");if(close)closeModal(close.dataset.close);});
  $("#themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem(THEME_KEY,document.body.classList.contains("dark")?"dark":"light");setTimeout(()=>{renderAnalytics();dashboardMap?.invalidateSize();fullMap?.invalidateSize()},50)};
  if(localStorage.getItem(THEME_KEY)==="dark")document.body.classList.add("dark");
  window.addEventListener("resize",()=>{if($("#analyticsView").classList.contains("active"))renderAnalytics()});
  $("#notificationBtn").onclick=()=>toast("No new service alerts. You're up to date.");
}
document.addEventListener("DOMContentLoaded",init);

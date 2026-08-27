const CATEGORIES=["Food","Transport","Shopping","Bills","Entertainment","Education","Healthcare","Salary","Other"];
const EXPENSE_CATEGORIES=CATEGORIES.filter(x=>x!=="Salary");
const METHODS=["UPI","Cash","Credit Card","Debit Card","Bank Transfer"];
const KEY="spendwise_v1";
const state={transactions:[],budget:50000,categoryBudgets:{},theme:"light",editingId:null,modalType:"expense",period:30,charts:{}};

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=n=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Math.round(n||0));
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random();
const dateISO=d=>new Date(d).toISOString().slice(0,10);
const today=new Date();
const monthStart=new Date(today.getFullYear(),today.getMonth(),1);
const lastMonthStart=new Date(today.getFullYear(),today.getMonth()-1,1);
const fmtDate=s=>new Date(s+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
const esc=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

function save(){localStorage.setItem(KEY,JSON.stringify({transactions:state.transactions,budget:state.budget,categoryBudgets:state.categoryBudgets,theme:state.theme}));}
function load(){
  const raw=localStorage.getItem(KEY);
  if(raw){try{Object.assign(state,JSON.parse(raw));return;}catch{}}
  state.transactions=demoData(); state.budget=50000;
  state.categoryBudgets={Food:10000,Transport:5000,Shopping:7000,Bills:9000,Entertainment:4000,Education:5000,Healthcare:4000,Other:3000};
  state.theme="light"; save();
}
function demoData(){
  const names=[
    ["Monthly Salary",45000,"Salary","Bank Transfer","income"],["Swiggy",540,"Food","UPI","expense"],["Zomato",680,"Food","UPI","expense"],
    ["Amazon",2499,"Shopping","Credit Card","expense"],["Uber",420,"Transport","UPI","expense"],["Grocery Store",3650,"Food","Debit Card","expense"],
    ["Electricity Bill",1820,"Bills","UPI","expense"],["Internet Bill",999,"Bills","UPI","expense"],["Netflix",649,"Entertainment","Credit Card","expense"],
    ["Pharmacy",760,"Healthcare","UPI","expense"],["Fuel",2200,"Transport","Credit Card","expense"],["College Fees",4500,"Education","Bank Transfer","expense"],
    ["Myntra",1890,"Shopping","Credit Card","expense"],["Spotify",119,"Entertainment","UPI","expense"],["Cafe Coffee",390,"Food","UPI","expense"],
    ["Grocery Store",2980,"Food","Debit Card","expense"],["Uber",310,"Transport","UPI","expense"],["Electricity Bill",1450,"Bills","UPI","expense"],
    ["Swiggy",470,"Food","UPI","expense"],["Amazon",1399,"Shopping","Credit Card","expense"],["Freelance Project",8500,"Other","Bank Transfer","income"],
    ["Pharmacy",540,"Healthcare","UPI","expense"],["Fuel",1800,"Transport","Debit Card","expense"],["Movie Tickets",760,"Entertainment","Credit Card","expense"],
    ["Zomato",520,"Food","UPI","expense"],["Online Course",2400,"Education","Credit Card","expense"],["Grocery Store",3210,"Food","Debit Card","expense"],
    ["Internet Bill",999,"Bills","UPI","expense"],["Uber",360,"Transport","UPI","expense"],["Shopping",2850,"Shopping","Credit Card","expense"],
    ["Monthly Salary",45000,"Salary","Bank Transfer","income"],["Electricity Bill",1720,"Bills","UPI","expense"],["Swiggy",590,"Food","UPI","expense"],
    ["Fuel",2050,"Transport","Credit Card","expense"],["Pharmacy",430,"Healthcare","UPI","expense"],["Netflix",649,"Entertainment","Credit Card","expense"],
    ["Grocery Store",2760,"Food","Debit Card","expense"],["Amazon",1799,"Shopping","Credit Card","expense"]
  ];
  return names.map((x,i)=>({id:uid(),description:x[0],amount:x[1],category:x[2],method:x[3],type:x[4],date:dateISO(new Date(today.getTime()-i*1.8*864e5))}));
}
function currentTransactions(){return state.transactions.filter(t=>new Date(t.date+"T00:00:00")>=monthStart);}
function sums(list=currentTransactions()){return {income:list.filter(t=>t.type==="income").reduce((a,t)=>a+t.amount,0),expense:list.filter(t=>t.type==="expense").reduce((a,t)=>a+t.amount,0)}}
function monthSums(offset=0){const d=new Date(today.getFullYear(),today.getMonth()+offset,1),e=new Date(today.getFullYear(),today.getMonth()+offset+1,1);return sums(state.transactions.filter(t=>{const x=new Date(t.date+"T00:00:00");return x>=d&&x<e}));}
function percentChange(a,b){return b===0?(a===0?0:100):((a-b)/Math.abs(b))*100;}
function icon(cat){return ({Food:"🍜",Transport:"🚗",Shopping:"🛍",Bills:"◈",Entertainment:"♪",Education:"▣",Healthcare:"✚",Salary:"↗",Other:"•"})[cat]||"•";}

function renderOverview(){
  const s=sums(), prev=monthSums(-1), savings=s.income-s.expense;
  $("#balanceValue").textContent=money(state.transactions.reduce((a,t)=>a+(t.type==="income"?t.amount:-t.amount),0));
  $("#balanceChange").textContent=(percentChange(s.income-s.expense,prev.income-prev.expense)>=0?"+":"")+percentChange(s.income-s.expense,prev.income-prev.expense).toFixed(0)+"%";
  $("#heroIncome").textContent=money(s.income);$("#heroExpense").textContent=money(s.expense);$("#heroSavings").textContent=money(savings);
  $("#incomeValue").textContent=money(s.income);$("#expenseValue").textContent=money(s.expense);$("#savingValue").textContent=money(savings);
  $("#incomeCompare").textContent=(percentChange(s.income,prev.income)>=0?"+":"")+percentChange(s.income,prev.income).toFixed(0)+"%";
  $("#expenseCompare").textContent=(percentChange(s.expense,prev.expense)>=0?"+":"")+percentChange(s.expense,prev.expense).toFixed(0)+"%";
  $("#savingCompare").textContent=(percentChange(savings,prev.income-prev.expense)>=0?"+":"")+percentChange(savings,prev.income-prev.expense).toFixed(0)+"%";
  $("#savingRate").textContent=s.income?Math.round(savings/s.income*100)+"%":"0%";
  const spent=s.expense, rem=state.budget-spent, pct=state.budget?spent/state.budget*100:0;
  ["budgetTitle","budgetPageTotal"].forEach(id=>$( "#"+id).textContent=money(state.budget));
  ["budgetSpent","budgetPageSpent"].forEach(id=>$( "#"+id).textContent=money(spent));
  ["budgetRemaining","budgetPageRemaining"].forEach(id=>$( "#"+id).textContent=money(rem));
  setProgress("#budgetProgress",pct);setProgress("#budgetPageProgress",pct);
  $("#budgetPercent").textContent=Math.round(pct)+"% used";$("#budgetPagePct").textContent=Math.round(pct)+"% used";
  const st=statusFor(pct);setStatus("#budgetStatus",st);setStatus("#budgetPageStatus",st);
  $("#budgetWarning").textContent=pct>100?`You've overspent your monthly budget by ${money(Math.abs(rem))}.`:pct>90?"You're close to your monthly limit. Consider slowing discretionary spending.":pct>70?"You're in the warning zone. Keep an eye on non-essential spending.":"You're on track to stay within your monthly budget.";
  $("#recentTransactions").innerHTML=state.transactions.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).map(txRow).join("");
  renderSparks();
  renderHealth();
}
function setProgress(sel,p){const el=$(sel);if(!el)return;el.style.width=Math.min(100,Math.max(0,p))+"%";el.style.background=p>100?"var(--red)":p>90?"#e05252":p>70?"#d99a22":"var(--green)";}
function statusFor(p){return p>100?["critical","Overspent"]:p>90?["critical","Critical"]:p>70?["warning","Warning"]:["healthy","Healthy"];}
function setStatus(sel,[cls,text]){const e=$(sel);e.className="status "+cls;e.textContent=text;}
function txRow(t){
  return `<div class="transaction-row"><div class="tx-main"><div class="tx-icon">${icon(t.category)}</div><div><strong>${esc(t.description)}</strong><small>${esc(t.category)}</small></div></div><span class="tx-meta">${fmtDate(t.date)}</span><span class="tx-meta tx-method">${esc(t.method)}</span><span class="tx-amount ${t.type}">${t.type==="income"?"+":"−"}${money(t.amount)}</span><button class="tx-delete" title="Delete transaction" data-delete="${t.id}">⋯</button></div>`;
}
function renderSparks(){
  const ids=[["incomeSpark","income"],["expenseSpark","expense"],["savingSpark","saving"],["rateSpark","rate"]];
  ids.forEach(([id,type])=>{const data=[];for(let i=5;i>=0;i--){const s=monthSums(-i);data.push(type==="income"?s.income:type==="expense"?s.expense:type==="saving"?s.income-s.expense:s.income?(s.income-s.expense)/s.income*100:0)};spark(id,data);});
}
function spark(id,data){const el=$("#"+id);if(!el)return;const ctx=el.getContext("2d");ctx.clearRect(0,0,el.width,el.height);const max=Math.max(...data,1),min=Math.min(...data,0),w=el.width,h=el.height;ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue("--green");ctx.lineWidth=2;ctx.beginPath();data.forEach((v,i)=>{const x=i*(w-2)/(data.length-1)+1,y=h-3-(v-min)/(max-min||1)*(h-7);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();}

function renderTransactions(){
  const q=$("#transactionSearch").value.toLowerCase(),type=$("#typeFilter").value,cat=$("#categoryFilter").value,method=$("#methodFilter").value,sort=$("#sortFilter").value;
  let arr=state.transactions.filter(t=>(!q||`${t.description} ${t.category} ${t.method}`.toLowerCase().includes(q))&&(type==="all"||t.type===type)&&(cat==="all"||t.category===cat)&&(method==="all"||t.method===method));
  arr.sort((a,b)=>sort==="newest"?b.date.localeCompare(a.date):sort==="oldest"?a.date.localeCompare(b.date):sort==="high"?b.amount-a.amount:a.amount-b.amount);
  $("#transactionTable").innerHTML=arr.map(t=>`<tr><td><div class="tx-main"><div class="tx-icon">${icon(t.category)}</div><div><strong>${esc(t.description)}</strong><small>${esc(t.category)} · ${t.type}</small></div></div></td><td>${fmtDate(t.date)}</td><td>${esc(t.method)}</td><td class="tx-amount ${t.type}">${t.type==="income"?"+":"−"}${money(t.amount)}</td><td><button class="text-btn" data-edit="${t.id}">Edit</button> <button class="tx-delete" data-delete="${t.id}" aria-label="Delete">×</button></td></tr>`).join("");
  $("#transactionEmpty").classList.toggle("hidden",arr.length>0);
}
function fillFilters(){
  $("#categoryFilter").innerHTML='<option value="all">All categories</option>'+CATEGORIES.map(c=>`<option>${c}</option>`).join("");
  $("#methodFilter").innerHTML='<option value="all">All methods</option>'+METHODS.map(c=>`<option>${c}</option>`).join("");
  $("#category").innerHTML=EXPENSE_CATEGORIES.map(c=>`<option>${c}</option>`).join("")+'<option>Salary</option><option>Other</option>';
  $("#method").innerHTML=METHODS.map(c=>`<option>${c}</option>`).join("");
  $("#budgetCategory").innerHTML=EXPENSE_CATEGORIES.map(c=>`<option>${c}</option>`).join("")+'<option>Other</option>';
}

function openTx(type="expense",id=null){
  state.editingId=id;state.modalType=type;
  const tx=id&&state.transactions.find(t=>t.id===id);
  $("#modalTitle").textContent=tx?"Edit transaction":"Add transaction";
  $$(".type-toggle button").forEach(b=>b.classList.toggle("active",b.dataset.type=== (tx?.type||type)));
  $("#transactionId").value=id||"";$("#amount").value=tx?.amount||"";$("#category").value=tx?.category||"Food";$("#date").value=tx?.date||dateISO(today);$("#method").value=tx?.method||"UPI";$("#description").value=tx?.description||"";
  $("#transactionModal").classList.remove("hidden");setTimeout(()=>$("#amount").focus(),50);
}
function closeTx(){$("#transactionModal").classList.add("hidden");state.editingId=null}
function submitTx(e){
  e.preventDefault();
  const type=$(".type-toggle button.active").dataset.type,amount=Number($("#amount").value);
  if(!amount||amount<=0){toast("Enter a valid amount",true);return}
  const obj={id:state.editingId||uid(),type,amount,category:$("#category").value,date:$("#date").value,method:$("#method").value,description:$("#description").value.trim()};
  if(!obj.description){toast("Add a description",true);return}
  if(state.editingId){const i=state.transactions.findIndex(t=>t.id===state.editingId);state.transactions[i]=obj}else state.transactions.push(obj);
  save();closeTx();renderAll();toast(state.editingId?"Transaction updated":"Transaction added");
}
function deleteTx(id){if(!confirm("Delete this transaction?"))return;state.transactions=state.transactions.filter(t=>t.id!==id);save();renderAll();toast("Transaction deleted");}

function renderBudgets(){
  const expenses=currentTransactions().filter(t=>t.type==="expense");
  $("#categoryBudgets").innerHTML=Object.entries(state.categoryBudgets).map(([cat,b])=>{
    const spent=expenses.filter(t=>t.category===cat).reduce((a,t)=>a+t.amount,0),p=b?spent/b*100:0,st=statusFor(p);
    return `<article class="category-budget-card"><div class="cat-head"><strong>${icon(cat)} ${cat}</strong><div class="cat-actions"><button data-edit-budget="${esc(cat)}">Edit</button><button data-delete-budget="${esc(cat)}">×</button></div></div><div class="numbers"><span>Spent <strong>${money(spent)}</strong></span><span>Budget <strong>${money(b)}</strong></span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100,p)}%;background:${p>100?'var(--red)':p>90?'#e05252':p>70?'#d99a22':'var(--green)'}"></div></div><div class="remaining">${p>100?`Overspent by ${money(spent-b)}`:`${money(b-spent)} remaining`} · <span class="status ${st[0]}">${st[1]}</span></div></article>`;
  }).join("")||`<div class="empty-state"><div>◫</div><h3>No budgets found</h3><p>Create a category budget to start planning.</p></div>`;
}
function openBudget(){ $("#monthlyBudgetInput").value=state.budget;$("#budgetModal").classList.remove("hidden");}
function openCatBudget(cat=null){$("#categoryBudgetOld").value=cat||"";$("#budgetCategory").value=cat||EXPENSE_CATEGORIES[0];$("#categoryBudgetAmount").value=cat?state.categoryBudgets[cat]:"";$("#categoryBudgetModal").classList.remove("hidden");}
function saveCatBudget(e){e.preventDefault();const cat=$("#budgetCategory").value,amount=Number($("#categoryBudgetAmount").value),old=$("#categoryBudgetOld").value;if(!amount){toast("Enter a valid budget",true);return}if(old&&old!==cat)delete state.categoryBudgets[old];state.categoryBudgets[cat]=amount;save();$("#categoryBudgetModal").classList.add("hidden");renderAll();toast("Category budget saved");}

function rangeData(days){
  const end=new Date(today),start=new Date(today);start.setDate(start.getDate()-days+1);
  const list=state.transactions.filter(t=>{const d=new Date(t.date+"T00:00:00");return d>=start&&d<=end});
  const labels=[],income=[],expense=[],saving=[];
  if(days<=30){for(let i=days-1;i>=0;i--){const d=new Date(today);d.setDate(d.getDate()-i);const key=dateISO(d),day=list.filter(t=>t.date===key),s=sums(day);labels.push(d.toLocaleDateString("en-IN",{day:"numeric",month:"short"}));income.push(s.income);expense.push(s.expense);saving.push(s.income-s.expense)}}
  else{const months=days<=90?3:days<=180?6:12;for(let i=months-1;i>=0;i--){const d=new Date(today.getFullYear(),today.getMonth()-i,1),key=d.getMonth();const arr=list.filter(t=>{const x=new Date(t.date+"T00:00:00");return x.getFullYear()===d.getFullYear()&&x.getMonth()===key});const s=sums(arr);labels.push(d.toLocaleDateString("en-IN",{month:"short",year:"2-digit"}));income.push(s.income);expense.push(s.expense);saving.push(s.income-s.expense)}}
  return {labels,income,expense,saving,list};
}
function chart(id,type,data,opts={}){
  if(state.charts[id])state.charts[id].destroy();
  const ctx=$("#"+id);if(!ctx)return;
  const dark=document.documentElement.dataset.theme==="dark",grid=dark?"#303743":"#e8edf2",text=getComputedStyle(document.documentElement).getPropertyValue("--muted");
  state.charts[id]=new Chart(ctx,{type,data,options:{responsive:true,maintainAspectRatio:false,animation:{duration:650},plugins:{legend:{display:opts.legend??false,labels:{color:text,usePointStyle:true,font:{size:10}}}},scales:opts.scales===false?{}:{x:{grid:{display:false},ticks:{color:text,font:{size:9},maxTicksLimit:8}},y:{grid:{color:grid},ticks:{color:text,font:{size:9},callback:v=>"₹"+Intl.NumberFormat("en-IN",{notation:"compact",maximumFractionDigits:1}).format(v)}}}}});
}
function renderAnalytics(){
  const d=rangeData(state.period),cats={},methods={};
  d.list.filter(t=>t.type==="expense").forEach(t=>{cats[t.category]=(cats[t.category]||0)+t.amount});
  d.list.forEach(t=>{methods[t.method]=(methods[t.method]||0)+t.amount});
  const totalExp=Object.values(cats).reduce((a,b)=>a+b,0),months=Math.max(1,state.period/30);
  $("#avgMonthlySpend").textContent=money(totalExp/months);$("#avgMonthlySaving").textContent=money((d.saving.reduce((a,b)=>a+b,0))/months);
  const top=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0];$("#highestCategory").textContent=top?.[0]||"—";
  const byDay={};d.list.filter(t=>t.type==="expense").forEach(t=>byDay[t.date]=(byDay[t.date]||0)+t.amount);const day=Object.entries(byDay).sort((a,b)=>b[1]-a[1])[0];$("#highestDay").textContent=day?fmtDate(day[0]):"—";
  $("#avgDailySpend").textContent=money(totalExp/Math.max(1,state.period));$("#totalTransactions").textContent=d.list.length;
  chart("cashflowChart","line",{labels:d.labels,datasets:[{label:"Income",data:d.income,borderColor:"#16a36a",backgroundColor:"rgba(22,163,106,.08)",fill:true,tension:.35,pointRadius:0},{label:"Expenses",data:d.expense,borderColor:"#e05252",backgroundColor:"rgba(224,82,82,.04)",fill:true,tension:.35,pointRadius:0}]},{legend:true});
  chart("monthlyChart","bar",{labels:d.labels,datasets:[{label:"Expenses",data:d.expense,backgroundColor:"#7658e8",borderRadius:6}]});
  chart("savingsChart","line",{labels:d.labels,datasets:[{label:"Savings",data:d.saving,borderColor:"#4776e6",backgroundColor:"rgba(71,118,230,.10)",fill:true,tension:.35,pointRadius:0}]});
  chart("categoryChart","doughnut",{labels:Object.keys(cats),datasets:[{data:Object.values(cats),backgroundColor:["#4776e6","#7658e8","#16a36a","#d99a22","#e05252","#22a9b8","#e07b39","#8b9aad"],borderWidth:0}]},{legend:true,scales:false});
  chart("methodChart","doughnut",{labels:Object.keys(methods),datasets:[{data:Object.values(methods),backgroundColor:["#16a36a","#4776e6","#7658e8","#d99a22","#e05252"],borderWidth:0}]},{legend:true,scales:false});
}
function renderInsights(){
  const s=sums(),prev=monthSums(-1),cats={},prevCats={};
  currentTransactions().filter(t=>t.type==="expense").forEach(t=>cats[t.category]=(cats[t.category]||0)+t.amount);
  state.transactions.filter(t=>t.type==="expense"&&new Date(t.date+"T00:00:00")>=lastMonthStart&&new Date(t.date+"T00:00:00")<monthStart).forEach(t=>prevCats[t.category]=(prevCats[t.category]||0)+t.amount);
  const top=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0],rate=s.income?s.income-s.expense:savings=0;
  const savingRate=s.income?(s.income-s.expense)/s.income*100:0, pct=state.budget?s.expense/state.budget*100:0;
  $("#insightHeadline").textContent=savingRate>=30?"You're building strong financial momentum.":pct>90?"Your spending is approaching the monthly limit.":"Your financial picture is stable—keep optimizing.";
  $("#insightSub").textContent=`${money(s.income-s.expense)} saved this month with ${Math.round(pct)}% of your budget used.`;
  const insights=[];
  if(top){const ch=percentChange(top[1],prevCats[top[0]]||0);insights.push(["Category signal",`${top[0]} represents ${Math.round(top[1]/Math.max(s.expense,1)*100)}% of your expenses${ch>0?` and is up ${Math.round(ch)}% from last month`:""}.`]);}
  insights.push(["Savings",savingRate>=30?`Your savings rate is ${Math.round(savingRate)}%, above the 30% target.`:`Your savings rate is ${Math.round(savingRate)}%. A small reduction in discretionary spending could improve it.`]);
  insights.push(["Budget",pct>100?`You've exceeded your monthly budget by ${money(s.expense-state.budget)}.`:pct>90?`Only ${money(state.budget-s.expense)} remains in your monthly budget.`:`You're currently on track to stay within your monthly budget.`]);
  insights.push(["Consistency",`You made ${s.income?state.transactions.filter(t=>t.type==="expense"&&new Date(t.date+"T00:00:00")>=monthStart).length:0} expense transactions this month. Fewer impulse purchases can make your cash flow easier to predict.`]);
  $("#insightGrid").innerHTML=insights.map(x=>`<article class="insight-card"><div class="insight-icon">✦</div><div><h3>${x[0]}</h3><p>${x[1]}</p></div></article>`).join("");
  renderHealth();
}
function renderHealth(){
  const s=sums(),saveRate=s.income?Math.max(0,Math.min(100,(s.income-s.expense)/s.income*100)):0,budget=state.budget?Math.max(0,100-s.expense/state.budget*100):0;
  const daily={};currentTransactions().filter(t=>t.type==="expense").forEach(t=>daily[t.date]=(daily[t.date]||0)+t.amount);const vals=Object.values(daily);const avg=vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;const variance=vals.length?Math.sqrt(vals.reduce((a,b)=>a+(b-avg)**2,0)/vals.length):0;const consistency=Math.max(0,100-Math.min(100,variance/Math.max(avg,1)*70));
  const expenseControl=Math.max(0,Math.min(100,100-(s.expense/Math.max(s.income,1))*100));
  const score=Math.round(saveRate*.4+budget*.25+expenseControl*.2+consistency*.15);
  $("#healthScore").textContent=score;$("#healthDetailScore").textContent=`${score} / 100`;$("#healthLabel").textContent=score>=80?"Excellent":score>=65?"Good":score>=50?"Fair":"Needs attention";
  $("#healthDetailText").textContent=`Your score is based on a ${Math.round(saveRate)}% savings rate, ${Math.round(budget)}% budget adherence, ${Math.round(expenseControl)}% expense control and ${Math.round(consistency)}% spending consistency.`;
  const deg=Math.round(score*3.6);$("#healthRing").style.background=`radial-gradient(circle,var(--surface) 57%,transparent 58%),conic-gradient(var(--green) 0deg ${deg}deg,var(--surface-2) ${deg}deg 360deg)`;
  $("#healthFactors").innerHTML=[["Savings rate",saveRate],["Budget",budget],["Expense control",expenseControl],["Consistency",consistency]].map(x=>`<div class="factor"><span>${x[0]}</span><strong>${Math.round(x[1])}</strong></div>`).join("");
}
function navigate(page){$$(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+page));$$("[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===page));$("#sidebar").classList.remove("open");if(page==="analytics")renderAnalytics();if(page==="insights")renderInsights();}
function applyTheme(){document.documentElement.dataset.theme=state.theme;$("#sidebarThemeText").textContent=state.theme==="dark"?"Light mode":"Dark mode";$$("[data-theme-choice]").forEach(b=>b.classList.toggle("active",b.dataset.themeChoice===state.theme));}
function toast(msg,error=false){const el=document.createElement("div");el.className="toast"+(error?" error":"");el.textContent=msg;$("#toastContainer").append(el);setTimeout(()=>el.remove(),2600);}
function exportCSV(){const rows=[["Date","Type","Amount","Category","Payment Method","Description"],...state.transactions.map(t=>[t.date,t.type,t.amount,t.category,t.method,t.description])];const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="spendwise-transactions.csv";a.click();URL.revokeObjectURL(url);toast("CSV exported");}
function renderAll(){renderOverview();renderTransactions();renderBudgets();renderInsights();if($("#page-analytics").classList.contains("active"))renderAnalytics();applyTheme();}

document.addEventListener("click",e=>{
  const page=e.target.closest("[data-page]");if(page){navigate(page.dataset.page);return}
  const add=e.target.closest("[data-add]");if(add){openTx(add.dataset.add);return}
  const del=e.target.closest("[data-delete]");if(del){deleteTx(del.dataset.delete);return}
  const edit=e.target.closest("[data-edit]");if(edit){openTx("expense",edit.dataset.edit);return}
  const eb=e.target.closest("[data-edit-budget]");if(eb){openCatBudget(eb.dataset.editBudget);return}
  const db=e.target.closest("[data-delete-budget]");if(db){delete state.categoryBudgets[db.dataset.deleteBudget];save();renderAll();toast("Category budget deleted");return}
  if(e.target.closest("#closeModal")||e.target.closest("#cancelModal"))closeTx();
  if(e.target.closest(".close-budget"))$("#budgetModal").classList.add("hidden");
  if(e.target.closest(".close-cat-budget"))$("#categoryBudgetModal").classList.add("hidden");
});
$$(".type-toggle button").forEach(b=>b.addEventListener("click",()=>{$$(".type-toggle button").forEach(x=>x.classList.remove("active"));b.classList.add("active");if(b.dataset.type==="income")$("#category").value="Salary"}));
$("#transactionForm").addEventListener("submit",submitTx);
$("#budgetForm").addEventListener("submit",e=>{e.preventDefault();const v=Number($("#monthlyBudgetInput").value);if(!v){toast("Enter a valid budget",true);return}state.budget=v;save();$("#budgetModal").classList.add("hidden");renderAll();toast("Monthly budget updated");});
$("#categoryBudgetForm").addEventListener("submit",saveCatBudget);
$("#editBudget").addEventListener("click",openBudget);$("#addCategoryBudget").addEventListener("click",()=>openCatBudget());
$("#exportCsv").addEventListener("click",exportCSV);
["transactionSearch","typeFilter","categoryFilter","methodFilter","sortFilter"].forEach(id=>$("#"+id).addEventListener("input",renderTransactions));
$("#globalSearch").addEventListener("input",e=>{navigate("transactions");$("#transactionSearch").value=e.target.value;renderTransactions()});
$("#headerTheme").addEventListener("click",()=>{state.theme=state.theme==="dark"?"light":"dark";save();applyTheme();renderAll()});
$("#sidebarTheme").addEventListener("click",()=>{state.theme=state.theme==="dark"?"light":"dark";save();applyTheme();renderAll()});
$$("[data-theme-choice]").forEach(b=>b.addEventListener("click",()=>{state.theme=b.dataset.themeChoice;save();applyTheme();renderAll()}));
$("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#resetData").addEventListener("click",()=>{if(confirm("Reset SpendWise to fresh demo data?")){localStorage.removeItem(KEY);load();renderAll();toast("Demo data restored")}});
$$(".segmented button").forEach(b=>b.addEventListener("click",()=>{$$(".segmented button").forEach(x=>x.classList.remove("active"));b.classList.add("active");state.period=Number(b.dataset.period);renderAnalytics()}));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeTx();$("#budgetModal").classList.add("hidden");$("#categoryBudgetModal").classList.add("hidden")}});

load();fillFilters();renderAll();

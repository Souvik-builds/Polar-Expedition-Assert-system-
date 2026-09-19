/* ---------- Authentication ---------- */
function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function applyUser(username) {
  const displayName = username.trim();
  const greetingName = document.getElementById("greetingName");
  const userAvatar = document.getElementById("userAvatar");
  if (greetingName) greetingName.textContent = displayName;
  if (userAvatar) userAvatar.textContent = initials(displayName) || "U";
}

function showApp(username) {
  applyUser(username);
  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("appShell").classList.remove("hidden");
}

function showAuth() {
  document.getElementById("appShell").classList.add("hidden");
  document.getElementById("authScreen").classList.remove("hidden");
  const form = document.getElementById("loginForm");
  if (form) form.reset();
}

function initAuth() {
  const loginForm = document.getElementById("loginForm");
  const authError = document.getElementById("authError");
  const logoutBtn = document.getElementById("logoutBtn");

  const savedUser = sessionStorage.getItem("trishanku_user");
  if (savedUser) {
    showApp(savedUser);
  } else {
    showAuth();
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!username || password.length < 4) {
      authError.classList.remove("hidden");
      return;
    }
    authError.classList.add("hidden");
    sessionStorage.setItem("trishanku_user", username);
    showApp(username);
  });

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("trishanku_user");
    showAuth();
  });
}

document.addEventListener("DOMContentLoaded", initAuth);

/* ---------- Application data ---------- */
const inventory = [
  {name:"Diesel Fuel",category:"Fuel",station:"Bharati",quantity:4200,burn:100,status:"Normal"},
  {name:"Food Supplies",category:"Food",station:"Maitri",quantity:850,burn:30,status:"Normal"},
  {name:"Medical Kits",category:"Medical",station:"Bharati",quantity:24,burn:2,status:"Low"},
  {name:"Heating Fuel",category:"Fuel",station:"Maitri",quantity:1100,burn:58,status:"Critical"},
  {name:"Research Equipment",category:"Equipment",station:"Bharati",quantity:65,burn:1,status:"Normal"},
  {name:"Emergency Rations",category:"Food",station:"Maitri",quantity:120,burn:8,status:"Low"}
];

let alerts = [
  {title:"Heating fuel is approaching critical level",description:"Maitri Station · Review resupply schedule",time:"12 min ago"},
  {title:"Medical kits below recommended threshold",description:"Bharati Station · Inventory replenishment needed",time:"35 min ago"},
  {title:"Emergency rations require monitoring",description:"Maitri Station · Consumption rate increased",time:"1 hr ago"}
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function renderAlerts(targetId) {
  const target = $(targetId);
  target.innerHTML = alerts.length ? alerts.map(a => `
    <div class="alert-item">
      <div class="alert-symbol">⚠</div>
      <div class="alert-content"><strong>${a.title}</strong><p>${a.description}</p></div>
      <time>${a.time}</time>
    </div>`).join("") : "<p style='font-size:12px;color:#789'>No pending alerts.</p>";
}

function statusFor(item) {
  const days = item.burn > 0 ? item.quantity / item.burn : 999;
  if (days < 20) return "Critical";
  if (days < 40) return "Low";
  return "Normal";
}

function renderInventory() {
  const search = $("#searchInput").value.toLowerCase();
  const category = $("#categoryFilter").value;
  const filtered = inventory.filter(item =>
    (item.name.toLowerCase().includes(search) || item.station.toLowerCase().includes(search)) &&
    (category === "all" || item.category === category)
  );
  $("#inventoryTable").innerHTML = filtered.map(item => {
    const status = statusFor(item);
    return `<tr>
      <td><strong>${item.name}</strong></td><td>${item.category}</td><td>${item.station}</td>
      <td>${item.quantity.toLocaleString()}</td><td>${item.burn}/day</td>
      <td><span class="table-status ${status.toLowerCase()}">${status}</span></td>
    </tr>`;
  }).join("");
  $("#totalItems").textContent = inventory.reduce((sum, item) => sum + item.quantity, 0).toLocaleString();
  $("#lowStockCount").textContent = inventory.filter(item => statusFor(item) !== "Normal").length;
}

function showSection(sectionId) {
  $$(".page-section").forEach(section => section.classList.remove("active-section"));
  $(`#${sectionId}`).classList.add("active-section");
  $$(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.section === sectionId));
  const titles = {dashboard:"Mission Dashboard",inventory:"Inventory Management",forecast:"AI Forecasting",logistics:"Logistics & Map",alerts:"Alerts & Notifications",shipments:"Shipment Control Center"};
  $("#pageTitle").textContent = titles[sectionId];
  $("#sidebar").classList.remove("open");
}

function drawChart() {
  const canvas = $("#consumptionChart");
  const ctx = canvas.getContext("2d");
  const width = canvas.width, height = canvas.height;
  ctx.clearRect(0,0,width,height);
  const points = [100,92,83,75,65,56,48,40,32,24,15];
  const left=35, right=20, top=20, bottom=35;
  const chartW=width-left-right, chartH=height-top-bottom;

  ctx.strokeStyle="#e4eef2"; ctx.lineWidth=1;
  for(let i=0;i<=4;i++){
    const y=top+(chartH/4)*i;
    ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(width-right,y);ctx.stroke();
  }
  ctx.beginPath();
  points.forEach((p,i)=>{
    const x=left+(chartW/(points.length-1))*i;
    const y=top+chartH-(p/100)*chartH;
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  });
  ctx.strokeStyle="#1b91b0";ctx.lineWidth=3;ctx.stroke();

  ctx.lineTo(width-right,height-bottom);ctx.lineTo(left,height-bottom);ctx.closePath();
  ctx.fillStyle="rgba(91,191,208,.14)";ctx.fill();

  points.forEach((p,i)=>{
    const x=left+(chartW/(points.length-1))*i;
    const y=top+chartH-(p/100)*chartH;
    ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle="#1b91b0";ctx.fill();
  });
}

$$(".nav-item").forEach(button => button.addEventListener("click", () => showSection(button.dataset.section)));
$$("[data-go]").forEach(button => button.addEventListener("click", () => showSection(button.dataset.go)));
$("#menuBtn").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$("#alertButton").addEventListener("click", () => showSection("alerts"));
$("#refreshBtn").addEventListener("click", () => { renderInventory(); renderAlerts("#dashboardAlerts"); renderAlerts("#allAlerts"); drawChart(); $("#refreshBtn").textContent="✓ Updated"; setTimeout(()=>$("#refreshBtn").textContent="↻ Refresh data",1200); });
$("#searchInput").addEventListener("input", renderInventory);
$("#categoryFilter").addEventListener("change", renderInventory);

$("#addItemBtn").addEventListener("click", () => $("#itemModal").classList.remove("hidden"));
$("#closeModalBtn").addEventListener("click", () => $("#itemModal").classList.add("hidden"));
$("#itemModal").addEventListener("click", (event) => { if(event.target.id==="itemModal") $("#itemModal").classList.add("hidden"); });

$("#itemForm").addEventListener("submit", (event) => {
  event.preventDefault();
  inventory.push({
    name: $("#itemName").value,
    category: $("#itemCategory").value,
    station: $("#itemStation").value,
    quantity: Number($("#itemQuantity").value),
    burn: Number($("#itemBurn").value),
    status: "Normal"
  });
  renderInventory();
  $("#itemForm").reset();
  $("#itemModal").classList.add("hidden");
  showSection("inventory");
});

$("#clearAlertsBtn").addEventListener("click", () => {
  alerts = [];
  renderAlerts("#dashboardAlerts");
  renderAlerts("#allAlerts");
});

renderInventory();
renderAlerts("#dashboardAlerts");
renderAlerts("#allAlerts");
drawChart();
window.addEventListener("resize", drawChart);

const shipments = [
  {id:"TRI-001",destination:"Maitri Station",cargo:"Heating fuel · 1,100 L",departure:"18 Sep 2026",eta:"22 Sep 2026",status:"In transit",progress:65},
  {id:"TRI-002",destination:"Bharati Station",cargo:"Medical kits · 40 units",departure:"20 Sep 2026",eta:"25 Sep 2026",status:"Loading",progress:20},
  {id:"TRI-003",destination:"Maitri Station",cargo:"Food supplies · 850 kg",departure:"10 Sep 2026",eta:"16 Sep 2026",status:"Delivered",progress:100}
];
let shipmentActivity = [
  {title:"TRI-001 reached checkpoint 2",description:"Heading toward Maitri Station",time:"10 min ago"},
  {title:"TRI-002 loading started",description:"Medical supplies being prepared at depot",time:"42 min ago"},
  {title:"TRI-003 delivery confirmed",description:"Food supplies received at Maitri Station",time:"Yesterday"}
];
let selectedShipment = null;

function shipmentStatusClass(status){
  return status.toLowerCase().replace(" ","-");
}
function renderShipments(){
  const search = ($("#shipmentSearch")?.value || "").toLowerCase();
  const filter = $("#shipmentFilter")?.value || "all";
  const rows = shipments.filter(s =>
    (s.id.toLowerCase().includes(search) || s.destination.toLowerCase().includes(search) || s.cargo.toLowerCase().includes(search)) &&
    (filter === "all" || s.status === filter)
  );
  $("#shipmentsTable").innerHTML = rows.map(s => `
    <tr>
      <td><strong>${s.id}</strong></td><td>${s.destination}</td><td>${s.cargo}</td>
      <td>${s.departure}</td><td>${s.eta}</td>
      <td><span class="table-status ${s.status==="Delivered"?"normal":s.status==="Delayed"?"critical":s.status==="Loading"?"low":"normal"}">${s.status}</span></td>
      <td><button class="text-btn shipment-view-btn" data-id="${s.id}">View</button></td>
    </tr>`).join("") || `<tr><td colspan="7">No shipments found.</td></tr>`;
  $$(".shipment-view-btn").forEach(btn => btn.addEventListener("click", () => openShipment(btn.dataset.id)));
}
function renderShipmentActivity(){
  $("#shipmentActivity").innerHTML = shipmentActivity.map(a => `
    <div class="alert-item"><div class="alert-symbol">🚢</div><div class="alert-content"><strong>${a.title}</strong><p>${a.description}</p></div><time>${a.time}</time></div>
  `).join("");
}
function openShipment(id){
  selectedShipment = shipments.find(s => s.id === id);
  if(!selectedShipment) return;
  $("#shipmentModalTitle").textContent = selectedShipment.id + " · Shipment details";
  $("#shipmentDetails").innerHTML = `
    <div class="detail-row"><span>Destination</span><strong>${selectedShipment.destination}</strong></div>
    <div class="detail-row"><span>Cargo</span><strong>${selectedShipment.cargo}</strong></div>
    <div class="detail-row"><span>Departure</span><strong>${selectedShipment.departure}</strong></div>
    <div class="detail-row"><span>ETA</span><strong>${selectedShipment.eta}</strong></div>
    <div class="detail-row"><span>Status</span><strong>${selectedShipment.status}</strong></div>
    <div class="detail-row"><span>Progress</span><strong>${selectedShipment.progress}%</strong></div>`;
  $("#shipmentModal").classList.remove("hidden");
}
function advanceSelectedShipment(){
  if(!selectedShipment) return;
  const order = ["Loading","In transit","Delivered"];
  const current = order.indexOf(selectedShipment.status);
  if(selectedShipment.status === "Delivered"){
    selectedShipment.status = "Loading"; selectedShipment.progress = 20;
  }else{
    selectedShipment.status = order[Math.min(current+1, order.length-1)];
    selectedShipment.progress = selectedShipment.status === "In transit" ? 65 : 100;
  }
  shipmentActivity.unshift({title:selectedShipment.id+" status updated",description:"New status: "+selectedShipment.status,time:"Just now"});
  renderShipments(); renderShipmentActivity(); openShipment(selectedShipment.id);
}
function openNewShipment(){
  const id = "TRI-" + String(shipments.length+1).padStart(3,"0");
  shipments.push({id,destination:"Bharati Station",cargo:"General supplies · 100 units",departure:"20 Sep 2026",eta:"27 Sep 2026",status:"Loading",progress:10});
  renderShipments(); renderShipmentActivity(); showSection("shipments");
  shipmentActivity.unshift({title:id+" created",description:"New shipment added to the simulation",time:"Just now"});
  renderShipmentActivity();
}
function attachCardActions(){
  $$("[data-go]").forEach(el => {
    const action = () => showSection(el.dataset.go);
    el.addEventListener("click", action);
    el.addEventListener("keydown", e => {if(e.key==="Enter" || e.key===" "){e.preventDefault();action();}});
  });
  $$("[data-shipment]").forEach(el => {
    const action = () => openShipment(el.dataset.shipment === "A" ? "TRI-001" : el.dataset.shipment === "B" ? "TRI-002" : "TRI-003");
    el.addEventListener("click", action);
    el.addEventListener("keydown", e => {if(e.key==="Enter" || e.key===" "){e.preventDefault();action();}});
  });
}
$("#shipmentSearch").addEventListener("input", renderShipments);
$("#shipmentFilter").addEventListener("change", renderShipments);
$("#newShipmentBtn").addEventListener("click", openNewShipment);
$("#advanceShipmentBtn").addEventListener("click", advanceSelectedShipment);
$("#closeShipmentModalBtn").addEventListener("click", () => $("#shipmentModal").classList.add("hidden"));
$("#closeShipmentDetailsBtn").addEventListener("click", () => $("#shipmentModal").classList.add("hidden"));
$("#shipmentModal").addEventListener("click", e => {if(e.target.id==="shipmentModal") $("#shipmentModal").classList.add("hidden");});

const originalShowSection = showSection;
showSection = function(sectionId){
  originalShowSection(sectionId);
  if(sectionId === "shipments"){renderShipments();renderShipmentActivity();}
};

const originalRenderInventory = renderInventory;
renderInventory = function(){originalRenderInventory();};
renderShipments();
renderShipmentActivity();
attachCardActions();

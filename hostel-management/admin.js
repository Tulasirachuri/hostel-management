/**
 * admin.js — Warden Admin Panel Logic
 * Handles: login, dashboard stats, student CRUD,
 *          mess bill management, notices, room allocation.
 */

/* ─── Admin Credentials ─── */
const admins = [
  { name: "Dr. Meena Iyer",    email: "warden@university.edu", password: "admin123", initials: "MI" },
  { name: "Mr. Suresh Rao",    email: "suresh@university.edu", password: "admin456", initials: "SR" }
];

let currentAdmin = null;

/* ─── Utilities ─── */
function initials(name) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}
function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function todayStr() {
  return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function toast(msg, isError = false) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.style.background = isError ? "#991b1b" : "#1d4ed8";
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 3000);
}
function openModal(id) { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }

/* ─── Login / Logout ─── */
function adminLogin() {
  const email = document.getElementById("adminEmail").value.trim().toLowerCase();
  const pass  = document.getElementById("adminPass").value;
  const admin = admins.find(a => a.email === email && a.password === pass);
  const errEl = document.getElementById("adminError");

  if (!admin) { errEl.style.display = "block"; return; }
  errEl.style.display = "none";
  currentAdmin = admin;

  document.getElementById("wardenName").textContent   = admin.name;
  document.getElementById("wardenAvatar").textContent = admin.initials;
  document.getElementById("adminLoginView").style.display = "none";
  document.getElementById("adminDash").style.display      = "flex";

  renderDashboard();
  renderStudentsTable();
  renderBillsTable();
  renderNotices();
  renderRooms();
  populateBillStudentDropdown();
  populateBillFilterDropdown();
}

function adminLogout() {
  currentAdmin = null;
  document.getElementById("adminEmail").value = "";
  document.getElementById("adminPass").value  = "";
  document.getElementById("adminDash").style.display      = "none";
  document.getElementById("adminLoginView").style.display = "flex";
  aShowPage("dashboard", document.querySelector("[data-page='dashboard']"));
}

document.getElementById("adminPass").addEventListener("keydown", e => { if (e.key === "Enter") adminLogin(); });
document.getElementById("adminEmail").addEventListener("keydown", e => { if (e.key === "Enter") adminLogin(); });

/* ─── Navigation ─── */
function aShowPage(name, el) {
  document.querySelectorAll(".a-page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".a-nav").forEach(n => n.classList.remove("active"));
  document.getElementById("apage-" + name).classList.add("active");
  if (el) el.classList.add("active");
}

/* ─── DASHBOARD ─── */
function renderDashboard() {
  const students = database.students;
  const allBills = students.flatMap(s => s.bills);
  const totalDue = students.flatMap(s => s.bills.filter(b => b.status !== "paid"))
                           .reduce((a, b) => a + b.breakfast + b.lunch + b.dinner, 0);
  const overdue  = allBills.filter(b => b.status === "overdue").length;

  document.getElementById("adminMetrics").innerHTML = `
    <div class="a-metric"><div class="a-metric-label">Total Students</div><div class="a-metric-value blue">${students.length}</div></div>
    <div class="a-metric"><div class="a-metric-label">Total Bills</div><div class="a-metric-value">${allBills.length}</div></div>
    <div class="a-metric"><div class="a-metric-label">Overdue Bills</div><div class="a-metric-value red">${overdue}</div></div>
    <div class="a-metric"><div class="a-metric-label">Total Outstanding</div><div class="a-metric-value amber">${formatINR(totalDue)}</div></div>
  `;

  const overdueBills = students.flatMap(s =>
    s.bills.filter(b => b.status === "overdue").map(b => ({...b, studentName: s.name}))
  );
  document.getElementById("overdueBody").innerHTML = overdueBills.length
    ? overdueBills.map(b => `<tr>
        <td>${b.studentName}</td>
        <td>${b.month}</td>
        <td>${formatINR(b.breakfast + b.lunch + b.dinner)}</td>
      </tr>`).join("")
    : `<tr><td colspan="3" style="color:#475569;padding:14px 12px;">No overdue bills 🎉</td></tr>`;

  document.getElementById("recentNoticesAdmin").innerHTML = database.notices.slice(0, 4).map(n =>
    `<div style="display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #1e2235;align-items:flex-start;">
       <div style="width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0;background:${n.type==='blue'?'#3b82f6':n.type==='amber'?'#f59e0b':'#ef4444'}"></div>
       <div>
         <div style="font-size:13px;color:#cbd5e1">${n.text}</div>
         <div style="font-size:11px;color:#475569;margin-top:2px">${n.date}</div>
       </div>
     </div>`
  ).join("");
}

/* ─── STUDENTS ─── */
function renderStudentsTable() {
  const q = (document.getElementById("studentSearch")?.value || "").toLowerCase();
  const rows = database.students.filter(s =>
    !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
       || s.room.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q)
  );

  document.getElementById("studentsBody").innerHTML = rows.length
    ? rows.map(s => {
        const due = s.bills.filter(b => b.status !== "paid")
                           .reduce((a, b) => a + b.breakfast + b.lunch + b.dinner, 0);
        return `<tr>
          <td><strong style="color:#e2e8f0">${s.name}</strong><br><span style="font-size:12px;color:#475569">${s.email}</span></td>
          <td>${s.rollNo}</td>
          <td>${s.hostel}</td>
          <td>${s.room}</td>
          <td>${s.course}, ${s.year}</td>
          <td style="color:${due>0?'#f87171':'#4ade80'};font-weight:600">${formatINR(due)}</td>
          <td>
            <button class="a-icon-btn" onclick="viewStudent(${s.id})">View</button>
            <button class="a-icon-btn" onclick="editStudent(${s.id})">Edit</button>
            <button class="a-icon-btn danger" onclick="deleteStudent(${s.id})">Delete</button>
          </td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="7" style="color:#475569;padding:16px 12px;">No students found.</td></tr>`;
}

function openAddStudent() {
  document.getElementById("studentModalTitle").textContent = "Add New Student";
  document.getElementById("editStudentId").value = "";
  ["f_name","f_roll","f_email","f_pass","f_course","f_phone","f_room"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("f_year").value    = "1st Year";
  document.getElementById("f_hostel").value  = "Himalaya Block";
  openModal("studentModal");
}

function editStudent(id) {
  const s = database.students.find(s => s.id === id);
  if (!s) return;
  document.getElementById("studentModalTitle").textContent = "Edit Student";
  document.getElementById("editStudentId").value = s.id;
  document.getElementById("f_name").value   = s.name;
  document.getElementById("f_roll").value   = s.rollNo;
  document.getElementById("f_email").value  = s.email;
  document.getElementById("f_pass").value   = s.password;
  document.getElementById("f_course").value = s.course;
  document.getElementById("f_year").value   = s.year;
  document.getElementById("f_hostel").value = s.hostel;
  document.getElementById("f_room").value   = s.room;
  document.getElementById("f_phone").value  = s.phone;
  openModal("studentModal");
}

function saveStudent() {
  const name   = document.getElementById("f_name").value.trim();
  const email  = document.getElementById("f_email").value.trim();
  const pass   = document.getElementById("f_pass").value.trim();
  const rollNo = document.getElementById("f_roll").value.trim();
  if (!name || !email || !pass || !rollNo) { toast("Please fill all required fields.", true); return; }

  const existingId = parseInt(document.getElementById("editStudentId").value);
  if (existingId) {
    const s = database.students.find(s => s.id === existingId);
    s.name     = name;
    s.email    = email;
    s.password = pass;
    s.rollNo   = rollNo;
    s.course   = document.getElementById("f_course").value;
    s.year     = document.getElementById("f_year").value;
    s.hostel   = document.getElementById("f_hostel").value;
    s.room     = document.getElementById("f_room").value;
    s.phone    = document.getElementById("f_phone").value;
    toast("Student updated successfully!");
  } else {
    const newId = Math.max(0, ...database.students.map(s => s.id)) + 1;
    database.students.push({
      id: newId, name, email, password: pass, rollNo,
      course:  document.getElementById("f_course").value,
      year:    document.getElementById("f_year").value,
      hostel:  document.getElementById("f_hostel").value,
      room:    document.getElementById("f_room").value,
      phone:   document.getElementById("f_phone").value,
      bills: []
    });
    toast("Student added successfully!");
  }

  closeModal("studentModal");
  renderStudentsTable();
  renderDashboard();
  populateBillStudentDropdown();
  populateBillFilterDropdown();
  renderRooms();
}

function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student? All their bill data will also be removed.")) return;
  database.students = database.students.filter(s => s.id !== id);
  toast("Student deleted.");
  renderStudentsTable();
  renderDashboard();
  renderBillsTable();
  populateBillStudentDropdown();
  populateBillFilterDropdown();
  renderRooms();
}

function viewStudent(id) {
  const s = database.students.find(s => s.id === id);
  if (!s) return;
  const ini = initials(s.name);
  const due = s.bills.filter(b => b.status !== "paid")
                     .reduce((a, b) => a + b.breakfast + b.lunch + b.dinner, 0);
  document.getElementById("viewStudentBody").innerHTML = `
    <div class="vs-header">
      <div class="vs-avatar">${ini}</div>
      <div><div class="vs-name">${s.name}</div><div class="vs-email">${s.email}</div></div>
    </div>
    <div class="vs-grid">
      ${[["Roll No", s.rollNo],["Course",s.course],["Year",s.year],["Phone",s.phone],
         ["Hostel",s.hostel],["Room",s.room],["Outstanding",formatINR(due)]].map(([l,v])=>
        `<div class="vs-item"><label>${l}</label><span>${v}</span></div>`).join("")}
    </div>
    <div class="vs-bills-title">Bill History (${s.bills.length} bills)</div>
    <table class="a-table">
      <thead><tr><th>Month</th><th>Total</th><th>Status</th></tr></thead>
      <tbody>
        ${s.bills.length ? s.bills.map(b => `<tr>
          <td>${b.month}</td>
          <td>${formatINR(b.breakfast+b.lunch+b.dinner)}</td>
          <td><span class="s-badge s-${b.status}">${capitalize(b.status)}</span></td>
        </tr>`).join("") : `<tr><td colspan="3" style="color:#475569;padding:10px">No bills yet.</td></tr>`}
      </tbody>
    </table>`;
  openModal("viewStudentModal");
}

/* ─── BILLS ─── */
function populateBillStudentDropdown() {
  document.getElementById("b_student").innerHTML =
    database.students.map(s => `<option value="${s.id}">${s.name} (${s.room})</option>`).join("");
  updateBillTotal();
}

function populateBillFilterDropdown() {
  const sel = document.getElementById("billStudentFilter");
  const prev = sel.value;
  sel.innerHTML = `<option value="">All Students</option>` +
    database.students.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  sel.value = prev;
}

function updateBillTotal() {
  const b = +document.getElementById("b_breakfast").value || 0;
  const l = +document.getElementById("b_lunch").value     || 0;
  const d = +document.getElementById("b_dinner").value    || 0;
  document.getElementById("billTotalPreview").textContent = formatINR(b + l + d);
}
["b_breakfast","b_lunch","b_dinner"].forEach(id => {
  document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateBillTotal);
  });
});

function renderBillsTable() {
  const studentFilter = document.getElementById("billStudentFilter")?.value || "";
  const statusFilter  = document.getElementById("billStatusFilter")?.value  || "";

  let rows = [];
  database.students.forEach(s => {
    s.bills.forEach((b, idx) => {
      if (studentFilter && s.id !== parseInt(studentFilter)) return;
      if (statusFilter && b.status !== statusFilter) return;
      rows.push({ s, b, idx });
    });
  });

  document.getElementById("billsBody").innerHTML = rows.length
    ? rows.map(({ s, b, idx }) => {
        const total = b.breakfast + b.lunch + b.dinner;
        return `<tr>
          <td><strong style="color:#e2e8f0">${s.name}</strong><br><span style="font-size:12px;color:#475569">${s.room}</span></td>
          <td>${b.month}</td>
          <td>${formatINR(b.breakfast)}</td>
          <td>${formatINR(b.lunch)}</td>
          <td>${formatINR(b.dinner)}</td>
          <td><strong>${formatINR(total)}</strong></td>
          <td><span class="s-badge s-${b.status}">${capitalize(b.status)}</span></td>
          <td>
            <button class="a-icon-btn" onclick="editBill(${s.id},${idx})">Edit</button>
            <button class="a-icon-btn danger" onclick="deleteBill(${s.id},${idx})">Delete</button>
          </td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="8" style="color:#475569;padding:16px 12px;">No bills found.</td></tr>`;
}

function openAddBill() {
  document.getElementById("billModalTitle").textContent = "Add Mess Bill";
  document.getElementById("editBillStudentId").value = "";
  document.getElementById("editBillIndex").value     = "";
  ["b_breakfast","b_lunch","b_dinner"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("b_month").value  = "";
  document.getElementById("b_status").value = "pending";
  updateBillTotal();
  openModal("billModal");
}

function editBill(studentId, billIdx) {
  const s = database.students.find(s => s.id === studentId);
  const b = s.bills[billIdx];
  document.getElementById("billModalTitle").textContent   = "Edit Mess Bill";
  document.getElementById("editBillStudentId").value       = studentId;
  document.getElementById("editBillIndex").value           = billIdx;
  document.getElementById("b_student").value               = studentId;
  document.getElementById("b_month").value                 = b.month;
  document.getElementById("b_breakfast").value             = b.breakfast;
  document.getElementById("b_lunch").value                 = b.lunch;
  document.getElementById("b_dinner").value                = b.dinner;
  document.getElementById("b_status").value                = b.status;
  updateBillTotal();
  openModal("billModal");
}

function saveBill() {
  const month     = document.getElementById("b_month").value.trim();
  const breakfast = parseInt(document.getElementById("b_breakfast").value) || 0;
  const lunch     = parseInt(document.getElementById("b_lunch").value)     || 0;
  const dinner    = parseInt(document.getElementById("b_dinner").value)    || 0;
  const status    = document.getElementById("b_status").value;
  const studentId = parseInt(document.getElementById("b_student").value);

  if (!month) { toast("Please enter a month.", true); return; }

  const existingStudentId = parseInt(document.getElementById("editBillStudentId").value);
  const existingIdx       = parseInt(document.getElementById("editBillIndex").value);

  if (!isNaN(existingStudentId) && !isNaN(existingIdx) && document.getElementById("editBillStudentId").value !== "") {
    const s = database.students.find(s => s.id === existingStudentId);
    s.bills[existingIdx] = { month, breakfast, lunch, dinner, status };
    toast("Bill updated!");
  } else {
    const s = database.students.find(s => s.id === studentId);
    s.bills.unshift({ month, breakfast, lunch, dinner, status });
    toast("Bill added!");
  }

  closeModal("billModal");
  renderBillsTable();
  renderDashboard();
}

function deleteBill(studentId, billIdx) {
  if (!confirm("Delete this bill?")) return;
  const s = database.students.find(s => s.id === studentId);
  s.bills.splice(billIdx, 1);
  toast("Bill deleted.");
  renderBillsTable();
  renderDashboard();
}

/* ─── NOTICES ─── */
function renderNotices() {
  document.getElementById("noticesAdminList").innerHTML = database.notices.map((n, i) =>
    `<div class="a-notice-card">
       <div class="a-notice-left">
         <div class="a-notice-dot nd-${n.type}"></div>
         <div>
           <div class="a-notice-text">${n.text}</div>
           <div class="a-notice-date">${n.date}</div>
         </div>
       </div>
       <div class="a-notice-actions">
         <button class="a-icon-btn danger" onclick="deleteNotice(${i})">Delete</button>
       </div>
     </div>`
  ).join("") || `<div style="color:#475569;padding:1rem">No notices posted.</div>`;
}

function openAddNotice() {
  document.getElementById("n_text").value = "";
  document.getElementById("n_type").value = "blue";
  openModal("noticeModal");
}

function saveNotice() {
  const text = document.getElementById("n_text").value.trim();
  const type = document.getElementById("n_type").value;
  if (!text) { toast("Please enter notice text.", true); return; }
  database.notices.unshift({ text, type, date: todayStr() });
  closeModal("noticeModal");
  renderNotices();
  renderDashboard();
  toast("Notice posted!");
}

function deleteNotice(idx) {
  if (!confirm("Delete this notice?")) return;
  database.notices.splice(idx, 1);
  renderNotices();
  renderDashboard();
  toast("Notice deleted.");
}

/* ─── ROOMS ─── */
function renderRooms() {
  const blocks = {};
  database.students.forEach(s => {
    if (!blocks[s.hostel]) blocks[s.hostel] = [];
    blocks[s.hostel].push({ room: s.room, name: s.name });
  });

  // Add some vacant placeholders per block
  const allBlocks = ["Himalaya Block","Ganga Block","Kaveri Block","Saraswati Block"];
  const vacantPlaceholders = {
    "Himalaya Block":  ["A-201","A-202","A-203","A-205","A-206"],
    "Ganga Block":     ["B-111","B-112","B-113","B-114"],
    "Kaveri Block":    ["C-301","C-302","C-303","C-306"],
    "Saraswati Block": ["D-101","D-102","D-103","D-104"]
  };

  document.getElementById("roomsGrid").innerHTML = allBlocks.map(block => {
    const occupied = blocks[block] || [];
    const vacants  = (vacantPlaceholders[block] || [])
      .filter(r => !occupied.find(o => o.room === r));

    return `<div class="rooms-block">
      <div class="rooms-block-title">${block}</div>
      <div class="rooms-row">
        ${occupied.map(o => `
          <div class="room-tile occupied">
            <div class="room-tile-num">${o.room}</div>
            <div class="room-tile-name">${o.name.split(" ")[0]}</div>
          </div>`).join("")}
        ${vacants.map(r => `
          <div class="room-tile vacant">
            <div class="room-tile-num">${r}</div>
            <div class="room-tile-vacant">Vacant</div>
          </div>`).join("")}
      </div>
    </div>`;
  }).join("");
}

/* ─── Init bill inputs after DOM ready ─── */
window.addEventListener("load", () => {
  ["b_breakfast","b_lunch","b_dinner"].forEach(id => {
    document.getElementById(id).addEventListener("input", updateBillTotal);
  });
});

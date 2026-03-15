/**
 * app.js — Application Logic
 * Handles login, logout, navigation, and rendering dashboard data.
 */

let currentStudent = null;

/* ─── Utility ─── */

function initials(name) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

function formatINR(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ─── Login / Logout ─── */

function doLogin() {
  const email   = document.getElementById("emailInput").value.trim();
  const pass    = document.getElementById("passInput").value;
  const errEl   = document.getElementById("loginError");
  const student = database.authenticate(email, pass);

  if (!student) {
    errEl.style.display = "block";
    return;
  }

  errEl.style.display = "none";
  currentStudent = student;
  populateDashboard(student);

  document.getElementById("loginView").style.display = "none";
  document.getElementById("dashView").style.display  = "flex";
}

function doLogout() {
  currentStudent = null;
  document.getElementById("emailInput").value = "";
  document.getElementById("passInput").value  = "";
  document.getElementById("dashView").style.display  = "none";
  document.getElementById("loginView").style.display = "flex";

  // Reset sidebar to Overview
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.querySelector("[data-page='overview']").classList.add("active");
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("page-overview").classList.add("active");
}

// Allow pressing Enter in the password field
document.getElementById("passInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter") doLogin();
});
document.getElementById("emailInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter") doLogin();
});

/* ─── Navigation ─── */

function showPage(name, el) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById("page-" + name).classList.add("active");
  if (el) el.classList.add("active");
}

/* ─── Populate Dashboard ─── */

function populateDashboard(s) {
  const ini = initials(s.name);

  // Top bar
  document.getElementById("topAvatar").textContent = ini;
  document.getElementById("topName").textContent   = s.name;

  // ── Overview ──
  document.getElementById("studentFirstName").textContent = s.name.split(" ")[0];
  document.getElementById("metRoom").textContent          = s.room;
  document.getElementById("metHostel").textContent        = s.hostel.split(" ")[0];
  document.getElementById("metCount").textContent         = s.bills.length;

  const dueTotal = s.bills
    .filter(b => b.status !== "paid")
    .reduce((acc, b) => acc + b.breakfast + b.lunch + b.dinner, 0);
  document.getElementById("metDue").textContent = formatINR(dueTotal);

  // Recent bills (last 3)
  document.getElementById("recentBills").innerHTML = s.bills.slice(0, 3).map(b => {
    const total = b.breakfast + b.lunch + b.dinner;
    return `<tr>
      <td>${b.month}</td>
      <td>${formatINR(total)}</td>
      <td><span class="status-badge status-${b.status}">${capitalize(b.status)}</span></td>
    </tr>`;
  }).join("");

  // ── All Bills ──
  document.getElementById("allBills").innerHTML = s.bills.map(b => {
    const total = b.breakfast + b.lunch + b.dinner;
    return `<tr>
      <td>${b.month}</td>
      <td>${formatINR(b.breakfast)}</td>
      <td>${formatINR(b.lunch)}</td>
      <td>${formatINR(b.dinner)}</td>
      <td><strong>${formatINR(total)}</strong></td>
      <td><span class="status-badge status-${b.status}">${capitalize(b.status)}</span></td>
    </tr>`;
  }).join("");

  const grandTotal = s.bills.reduce((a, b) => a + b.breakfast + b.lunch + b.dinner, 0);
  const paidTotal  = s.bills.filter(b => b.status === "paid")
                            .reduce((a, b) => a + b.breakfast + b.lunch + b.dinner, 0);
  document.getElementById("billSummary").innerHTML =
    `<span>Total billed: <b>${formatINR(grandTotal)}</b></span>
     <span>Paid: <b style="color:#27ae60">${formatINR(paidTotal)}</b></span>
     <span>Outstanding: <b style="color:#c0392b">${formatINR(grandTotal - paidTotal)}</b></span>`;

  // ── Profile ──
  document.getElementById("profileAvatar").textContent = ini;
  document.getElementById("profileName").textContent   = s.name;
  document.getElementById("profileEmail").textContent  = s.email;

  const profileFields = [
    ["Roll Number", s.rollNo],
    ["Course",      s.course],
    ["Year",        s.year],
    ["Phone",       s.phone],
    ["Hostel",      s.hostel],
    ["Room No.",    s.room]
  ];
  document.getElementById("profileGrid").innerHTML = profileFields.map(([label, value]) =>
    `<div class="profile-item">
       <label>${label}</label>
       <span>${value}</span>
     </div>`
  ).join("");

  // ── Notices ──
  document.getElementById("noticeList").innerHTML = database.notices.map(n =>
    `<div class="notice-item">
       <div class="notice-dot dot-${n.type}"></div>
       <div>
         <div class="notice-text">${n.text}</div>
         <div class="notice-date">${n.date}</div>
       </div>
     </div>`
  ).join("");
}

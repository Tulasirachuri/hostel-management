# 🏠 HostelMS — Hostel Management System

A student-facing hostel management web app where students can log in and view their mess bills, profile, and hostel notices.

---

## 📁 Project Structure

```
hostel-management/
├── index.html    ← Main HTML (all pages/views)
├── style.css     ← All styling
├── db.js         ← Student database + authentication
├── app.js        ← Application logic
└── README.md     ← This file
```

---

## 🚀 How to Run

### Option 1 — Just open the file (simplest)
1. Download/unzip the project folder
2. Double-click `index.html`
3. It opens directly in your browser — no server needed!

### Option 2 — Using VS Code Live Server (recommended)
1. Install [VS Code](https://code.visualstudio.com/)
2. Install the **Live Server** extension (by Ritwick Dey)
3. Open the `hostel-management` folder in VS Code
4. Right-click `index.html` → **"Open with Live Server"**
5. App opens at `http://127.0.0.1:5500`

### Option 3 — Python local server
```bash
# Python 3
cd hostel-management
python -m http.server 8000
# Open http://localhost:8000 in your browser
```

### Option 4 — Node.js local server
```bash
cd hostel-management
npx serve .
# Or: npx http-server .
```

---

## 🔑 Demo Login Accounts

| Email                      | Password | Student       |
|----------------------------|----------|---------------|
| arjun@university.edu       | pass123  | Arjun Kumar   |
| priya@university.edu       | pass456  | Priya Sharma  |
| rahul@university.edu       | pass789  | Rahul Verma   |

---

## ✨ Features

- **Login system** — validates email + password
- **Overview dashboard** — room info, due amount, recent bills
- **Mess Bills** — full history with Breakfast / Lunch / Dinner breakdown
- **Bill statuses** — Paid / Pending / Overdue with color badges
- **Profile page** — student details (name, roll no, course, hostel, room, phone)
- **Notices board** — hostel announcements
- **Responsive** — works on mobile and desktop

---

## ➕ How to Add a New Student

Open `db.js` and add a new entry to the `students` array:

```javascript
{
  id: 4,
  name: "Sneha Patel",
  email: "sneha@university.edu",
  password: "mypassword",
  rollNo: "2023IT033",
  hostel: "Saraswati Block",
  room: "D-101",
  phone: "9988776655",
  course: "B.Tech IT",
  year: "1st Year",
  bills: [
    { month: "March 2025", breakfast: 600, lunch: 1000, dinner: 850, status: "pending" }
  ]
}
```

---

## 🔮 How to Upgrade to a Real Backend

This demo uses in-memory JS data. To make it production-ready:

1. **Backend**: Use Node.js (Express) or Python (Django/Flask)
2. **Database**: MySQL / PostgreSQL / MongoDB to store students & bills
3. **Authentication**: Hash passwords with bcrypt, use JWT tokens
4. **API**: Replace `database.authenticate()` with a `fetch()` call to your API
5. **Admin panel**: Add a warden login to manage students and post bills

---

## 🛠 Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Structure  | HTML5                   |
| Styling    | CSS3 (vanilla)          |
| Logic      | JavaScript (vanilla)    |
| Database   | In-memory JS object     |
| Server     | None required (static)  |

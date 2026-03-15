/**
 * db.js — Student Database
 * 
 * In a real application, this data would come from a backend server
 * connected to a database like MySQL or MongoDB.
 * For this demo, we store everything in a JavaScript object.
 * 
 * Each student object has:
 *   id, name, email, password, rollNo, hostel, room,
 *   phone, course, year, and bills[]
 */

const database = {
  students: [
    {
      id: 1,
      name: "Arjun Kumar",
      email: "arjun@university.edu",
      password: "pass123",
      rollNo: "2021CS045",
      hostel: "Himalaya Block",
      room: "A-204",
      phone: "9876543210",
      course: "B.Tech CSE",
      year: "3rd Year",
      bills: [
        { month: "March 2025",    breakfast: 650, lunch: 1100, dinner: 950,  status: "pending"  },
        { month: "February 2025", breakfast: 600, lunch: 1050, dinner: 900,  status: "paid"     },
        { month: "January 2025",  breakfast: 620, lunch: 1080, dinner: 920,  status: "paid"     },
        { month: "December 2024", breakfast: 580, lunch: 1020, dinner: 880,  status: "overdue"  },
        { month: "November 2024", breakfast: 630, lunch: 1090, dinner: 930,  status: "paid"     }
      ]
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya@university.edu",
      password: "pass456",
      rollNo: "2022EC021",
      hostel: "Ganga Block",
      room: "B-110",
      phone: "9823456701",
      course: "B.Tech ECE",
      year: "2nd Year",
      bills: [
        { month: "March 2025",    breakfast: 610, lunch: 1020, dinner: 890,  status: "pending"  },
        { month: "February 2025", breakfast: 590, lunch: 1000, dinner: 870,  status: "paid"     },
        { month: "January 2025",  breakfast: 605, lunch: 1010, dinner: 860,  status: "paid"     }
      ]
    },
    {
      id: 3,
      name: "Rahul Verma",
      email: "rahul@university.edu",
      password: "pass789",
      rollNo: "2020ME008",
      hostel: "Kaveri Block",
      room: "C-305",
      phone: "9912345678",
      course: "B.Tech Mech",
      year: "4th Year",
      bills: [
        { month: "March 2025",    breakfast: 670, lunch: 1150, dinner: 1000, status: "overdue"  },
        { month: "February 2025", breakfast: 640, lunch: 1100, dinner: 960,  status: "overdue"  },
        { month: "January 2025",  breakfast: 660, lunch: 1120, dinner: 980,  status: "paid"     }
      ]
    }
  ],

  notices: [
    { text: "Mess menu revised for April 2025 — check the notice board for details.", date: "Mar 10, 2025", type: "blue"  },
    { text: "Water supply disruption on Mar 14 from 10 AM – 2 PM due to maintenance.",date: "Mar 9, 2025",  type: "amber" },
    { text: "March mess bills now available. Due date: March 25, 2025.",              date: "Mar 5, 2025",  type: "blue"  },
    { text: "Overdue bills: please clear pending dues to avoid penalty charges.",     date: "Mar 1, 2025",  type: "red"   },
    { text: "Warden meeting scheduled for all block representatives on Mar 18.",      date: "Feb 28, 2025", type: "blue"  }
  ],

  /**
   * Authenticate a student by email and password.
   * Returns the student object if found, or null.
   */
  authenticate: function(email, password) {
    return this.students.find(
      s => s.email.toLowerCase() === email.toLowerCase() && s.password === password
    ) || null;
  }
};

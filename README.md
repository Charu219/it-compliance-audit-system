# 🛡️ IT Compliance Audit System

A full-stack compliance audit management platform with role-based access control for Admins, Auditors, and Departments.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Axios, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (JSON Web Tokens) |
| File Uploads | Multer |

---

## 📁 Project Structure

```
it-compliance/
├── backend/
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   ├── auditController.js
│   │   ├── checklistController.js
│   │   ├── assignmentController.js
│   │   ├── evidenceController.js
│   │   ├── resultController.js
│   │   ├── userController.js
│   │   └── dashboardController.js
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Audit.js
│   │   ├── Checklist.js
│   │   ├── Assignment.js
│   │   ├── Evidence.js
│   │   └── Result.js
│   ├── routes/              # Express routes
│   ├── middleware/          # Auth + Multer
│   ├── uploads/             # Uploaded evidence files
│   ├── seed.js              # Demo data seeder
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Layout.js
        │   ├── Sidebar.js
        │   ├── ProtectedRoute.js
        │   └── StatusBadge.js
        ├── context/
        │   └── AuthContext.js
        ├── pages/
        │   ├── Login.js
        │   ├── admin/
        │   │   ├── Dashboard.js
        │   │   ├── Audits.js
        │   │   ├── Checklists.js
        │   │   ├── Assignments.js
        │   │   ├── Users.js
        │   │   └── Reports.js
        │   ├── auditor/
        │   │   ├── Dashboard.js
        │   │   ├── Audits.js
        │   │   └── Review.js
        │   └── department/
        │       ├── Dashboard.js
        │       ├── Tasks.js
        │       └── Evidence.js
        ├── services/
        │   └── api.js        # All Axios API calls
        ├── styles/
        │   └── global.css
        ├── App.js
        └── index.js
```

---

## 🚀 How to Run

### Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally (or MongoDB Atlas URI)
- **npm** or **yarn**

---

### Step 1: Clone / navigate to the project

```bash
cd it-compliance
```

---

### Step 2: Set up the Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment (edit .env if needed)
# Default settings in .env:
#   PORT=5000
#   MONGO_URI=mongodb://localhost:27017/it_compliance
#   JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Seed demo data (optional but recommended)
node seed.js

# Start the backend server
npm run dev
# OR: node server.js
```

Backend will run at: **http://localhost:5000**

---

### Step 3: Set up the Frontend

```bash
# Open a new terminal, navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Start the React dev server
npm start
```

Frontend will run at: **http://localhost:3000**

> The frontend proxies API calls to `http://localhost:5000` automatically via `"proxy"` in package.json.

---

### Step 4: Login with Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | password123 |
| Auditor | auditor@demo.com | password123 |
| IT Department | dept@demo.com | password123 |
| Finance Department | finance@demo.com | password123 |

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Audits
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/audits | All roles |
| POST | /api/audits | Admin only |
| PUT | /api/audits/:id | Admin only |
| DELETE | /api/audits/:id | Admin only |

### Checklists
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/checklists?auditId=X | All roles |
| POST | /api/checklists | Admin only |
| POST | /api/checklists/bulk | Admin only |
| DELETE | /api/checklists/:id | Admin only |

### Evidence (File Upload)
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/evidence | Department only |
| GET | /api/evidence?checklistId=X | All roles |
| DELETE | /api/evidence/:id | Admin, Department |

### Results (Auditor Reviews)
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/results | Auditor only |
| GET | /api/results?auditId=X | All roles |
| GET | /api/results/checklist/:id | All roles |

### Dashboard
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/dashboard/admin | Admin only |
| GET | /api/dashboard/auditor | Auditor only |
| GET | /api/dashboard/department | Department only |

---

## 🔄 Typical Workflow

```
1. Admin creates an Audit (e.g., "ISO 27001 Q4 2024")
2. Admin adds Checklist items to the audit (assigns to departments)
3. Admin assigns an Auditor to the audit
4. Department users log in, view their tasks, upload evidence files
5. Auditor reviews checklists, views uploaded evidence, marks status:
   → Pending / In-Progress / Compliant / Non-Compliant / N/A
   → Adds remarks and optional score
6. Admin views Reports dashboard with compliance statistics
7. Admin generates per-audit reports with breakdown by category/department
```

---

## 🎨 UI Features

- **Dark theme** professional dashboard interface
- **Role-based sidebar** navigation
- **Interactive charts** (Recharts pie + bar charts)
- **Drag & drop** file uploads
- **Real-time statistics** on dashboards
- **Responsive modals** for create/edit operations
- **Status badges** with color coding
- **Search and filter** functionality

---

## 🔒 Security Features

- Passwords hashed with **bcryptjs** (salt rounds: 12)
- JWT tokens expire in **7 days**
- Role-based middleware protects all sensitive routes
- File type validation on uploads (max 10MB)
- CORS configured for localhost:3000 only

---

## 🛠️ Example API Calls with Axios (Frontend)

```javascript
// Login
const res = await axios.post('/api/auth/login', {
  email: 'admin@demo.com',
  password: 'password123'
});
const token = res.data.token;

// Get audits (with JWT)
const audits = await axios.get('/api/audits', {
  headers: { Authorization: `Bearer ${token}` }
});

// Upload evidence (Department)
const formData = new FormData();
formData.append('file', fileObject);
formData.append('checklistId', 'CHECKLIST_ID');
formData.append('auditId', 'AUDIT_ID');
formData.append('description', 'Encryption certificate');
await axios.post('/api/evidence', formData, {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});

// Save auditor review
await axios.post('/api/results', {
  checklistId: 'CHECKLIST_ID',
  auditId: 'AUDIT_ID',
  status: 'compliant',
  remarks: 'All encryption policies verified and properly implemented',
  score: 95
}, { headers: { Authorization: `Bearer ${token}` } });
```

---

## 🐛 Troubleshooting

**MongoDB not connecting?**
- Ensure MongoDB is running: `sudo systemctl start mongod` (Linux) or via MongoDB Compass
- Check your MONGO_URI in `.env`

**Frontend not connecting to backend?**
- Ensure backend is running on port 5000
- The `"proxy": "http://localhost:5000"` in frontend/package.json handles this

**File uploads not working?**
- The `uploads/` folder is created automatically by Multer
- Check file size (max 10MB) and type restrictions

**JWT errors?**
- Clear localStorage in browser and log in again
- Check JWT_SECRET is set in `.env`
"# it-compliance-audit-system" 

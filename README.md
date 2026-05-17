# Enterprise Management System (ERP + CRM + HRM + CMS)

A complete MERN Stack enterprise management platform for internal company use.

## 🚀 Features

### Authentication
- Admin Login with JWT
- Forgot / Reset Password (email)
- Protected Routes

### CRM Module
- Client Management (CRUD, notes, payment history)
- Lead Management (CRUD, source tracking, conversion to client)

### HRM Module
- Employee Management (CRUD, departments, documents)
- Attendance Tracking (daily, monthly reports)
- Leave Management (request, approve/reject)

### Payroll Module
- Monthly Salary Generation
- Bonus & Deduction Management
- PDF Salary Slip Download

### Accounts Module
- Income Tracking
- Expense Management
- Financial Reports & Analytics

### CMS Module
- Website Page Management
- Blog System with SEO
- Dynamic Content Management

### Infrastructure
- Domain Name Management with Expiry Alerts
- Server/Hosting Management

### Task Management
- Create, Assign, Track Tasks
- Progress Tracking
- Comments & Priorities

### Additional Features
- Real-time Notifications (Socket.io)
- Activity Logs
- Reports with Excel Export
- Dark Mode UI
- Responsive Design
- Recharts Analytics

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Redux Toolkit, Recharts, Framer Motion |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB + Mongoose |
| Auth | JWT, bcryptjs |
| File Upload | Multer + Cloudinary |
| Email | Nodemailer |
| PDF | PDFKit |
| Excel | ExcelJS |

## 📁 Project Structure

```
CRM/
├── server/                     # Backend
│   ├── config/                 # DB, Cloudinary, Email config
│   ├── controllers/            # Route handlers
│   ├── middleware/              # Auth, Error, Upload
│   ├── models/                 # 16 Mongoose models
│   ├── routes/                 # 17 route files
│   ├── utils/                  # Helpers, email, seed
│   └── server.js               # Entry point
│
├── client/                     # Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI + Layout
│   │   ├── layouts/            # Dashboard Layout
│   │   ├── pages/              # 16+ page components
│   │   ├── redux/              # Store + Slices
│   │   ├── services/           # API service layer
│   │   └── App.jsx             # Main routing
│   └── index.html
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
# Install backend dependencies
cd server
cp .env.example .env
npm install

# Install frontend dependencies
cd ../client
cp .env.example .env
npm install
```

### 2. Configure Environment Variables

Edit `server/.env`:
```env
MONGO_URI=mongodb+srv://your_connection_string
JWT_SECRET=your_secret_key
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=admin123
```

### 3. Seed Admin Account

```bash
cd server
npm run seed
```

### 4. Start Development

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Visit: `http://localhost:5173`
Login: `admin@company.com` / `admin123`

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy dist/ folder to Vercel
```

### Backend (Render/Railway)
- Set environment variables
- Start command: `npm start`
- Build command: `npm install`

### Database
- Use MongoDB Atlas for production

## 📊 API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | `/api/auth/*` |
| Dashboard | `/api/dashboard/*` |
| Clients | `/api/clients/*` |
| Leads | `/api/leads/*` |
| Employees | `/api/employees/*` |
| Attendance | `/api/attendance/*` |
| Leaves | `/api/leaves/*` |
| Salary | `/api/salary/*` |
| Income | `/api/income/*` |
| Expenses | `/api/expenses/*` |
| Domains | `/api/domains/*` |
| Servers | `/api/servers/*` |
| Blogs | `/api/blogs/*` |
| Tasks | `/api/tasks/*` |
| CMS | `/api/cms/*` |
| Notifications | `/api/notifications/*` |
| Reports | `/api/reports/*` |

## 📝 License

Private - Internal Company Use Only

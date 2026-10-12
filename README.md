# Expense Voucher Management System (ABC Company)

A web-based **Expense Voucher Management System** built for **ABC Company** (Prachay Securities Private Limited). This application digitizes the end-to-end employee reimbursement workflow: expense voucher drafting, submission with employee digital signatures, Director review and signature-based approval/rejection, and Accounts Team audit and payment disbursement.

---

## 🌟 Key Highlights & Feature Matrix

| Feature | Employee | Director (Admin) | Accounts Team |
| :--- | :---: | :---: | :---: |
| **Secure JWT Authentication & Session Management** | ✅ | ✅ | ✅ |
| **Role-Based Access Control (RBAC)** | ✅ | ✅ | ✅ |
| **Create Expense Voucher (Saved as Draft)** | ✅ | ❌ | ❌ |
| **Edit / Delete Draft Vouchers** | ✅ | ❌ | ❌ |
| **Submit Voucher for Approval (Read-only once submitted)** | ✅ | ❌ | ❌ |
| **Digital Signature Support (Image Upload & Canvas Pad)** | ✅ | ✅ | ❌ |
| **Pending Approvals Queue** | ❌ | ✅ | ❌ |
| **Approve Voucher (Mandatory Director Signature)** | ❌ | ✅ | ❌ |
| **Reject Voucher (Mandatory Rejection Reason)** | ❌ | ✅ | ❌ |
| **View Own Vouchers Only** | ✅ | ❌ | ❌ |
| **View All Organization Vouchers** | ❌ | ✅ | ✅ |
| **Multi-Criteria Search & Filter (Bonus Feature)** | ✅ | ✅ | ✅ |
| **Print & Download Official Expense Voucher (PDF/Print)** | ✅ | ✅ | ✅ |
| **Role-Specific Real-Time KPI Dashboards** | ✅ | ✅ | ✅ |

---

## 🛠️ Technology Stack

- **Frontend**: React 19 (Vite), Pure Vanilla CSS Custom Design System (Glassmorphism, dark/light theme, micro-animations), Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express.js RESTful API, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), File & Signature Uploads (`multer`).
- **Database**: SQLite with `better-sqlite3` (Zero-config, embedded, self-contained relational database; compatible schema for PostgreSQL / MySQL).
- **Architecture**: Modular layered architecture with dedicated routes, controllers, middleware, and database models.

---

## 🚀 Quick Start & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node.js v24)
- **npm**: v9.0.0 or higher

### 1. Installation
Clone the repository and install all dependencies:
```bash
# Clone the repository
git clone <repo-url>
cd "voucher project"

# Install root, backend, and frontend dependencies in one command:
npm run install:all
```
*(Or manually run `npm install` in root, `cd server && npm install`, and `cd client && npm install`)*

### 2. Environment Configuration
The project comes pre-configured with default `.env` files. You can customize them using `.env.example`:
```bash
# Server configuration (.env file inside /server)
PORT=5000
JWT_SECRET=super_secret_jwt_key_expense_voucher_2026_xyz
CLIENT_URL=http://localhost:5173
DATABASE_FILE=./data/vouchers.db
```

### 3. Initialize & Seed Database
Seed the SQLite database with default users and test vouchers across all lifecycle states:
```bash
npm run seed
```

### 4. Run the Application
Start both the Express backend (`http://localhost:5000`) and the React Vite client (`http://localhost:5173`) concurrently:
```bash
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`**

---

## 👥 Default Demo Credentials

For quick evaluation, click the **"Quick Demo Credentials"** buttons on the login screen or use these credentials:

| Role | Email | Password | Name | Department | Permissions / Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Employee** | `employee@abc.com` | `employee123` | Rahul Sharma | Engineering | Can create drafts, upload signatures, submit vouchers, edit/delete own drafts. |
| **Employee 2** | `ananya@abc.com` | `employee123` | Ananya Iyer | Marketing | Demonstrates strict tenant isolation between employees. |
| **Director** | `director@abc.com` | `director123` | Dr. Vikram Malhotra | Executive Board | Approves vouchers (with signature), rejects with mandatory reason, views all vouchers. |
| **Accounts** | `accounts@abc.com` | `accounts123` | Priya Sundaram | Finance & Accounts | Monitors approved payout pipeline, filters, views all signatures, prints official vouchers. |

---

## 🗄️ Database Schema Explanation

The relational database schema is stored in `database/schema.sql` and `server/config/database.js`.

### 1. `users` Table
Stores registered enterprise users, role permissions, and default digital signatures:
- `id` (INTEGER, Primary Key): Unique user ID.
- `name` (VARCHAR): User's full name.
- `email` (VARCHAR, Unique): Work email address for login.
- `password_hash` (VARCHAR): Bcrypt salted hash (10 rounds).
- `role` (VARCHAR): Role enum (`'employee'`, `'director'`, `'accounts'`).
- `employee_code` (VARCHAR): Organizational ID (e.g., `EMP-1042`).
- `department` (VARCHAR): Assigned business department.
- `signature_url` (TEXT): Stored signature image path.
- `created_at` (DATETIME): Account creation timestamp.

### 2. `vouchers` Table
Stores expense vouchers and tracks the complete approval lifecycle:
- `id` (INTEGER, Primary Key): Unique auto-increment record ID.
- `voucher_number` (VARCHAR, Unique): Auto-generated sequential voucher identifier (e.g., `EV-2026-0001`).
- `voucher_date` (DATE): Generation date.
- `expense_date` (DATE, Mandatory): Incurred expense date.
- `department` (VARCHAR, Mandatory): Responsible business unit.
- `expense_title` (VARCHAR, Mandatory): High-level title/purpose.
- `expense_category` (VARCHAR): Category (Travel, Software, Meals, Equipment, Supplies, etc.).
- `expense_description` (TEXT): Itemized details and business justification.
- `amount` (DECIMAL, Mandatory): Claim amount (> 0).
- `employee_id` (INTEGER, Foreign Key): References `users(id)`.
- `employee_name` (VARCHAR): Denormalized employee name for historic integrity.
- `employee_code` (VARCHAR): Employee organizational code.
- `employee_signature` (TEXT): Employee signature image path or drawn signature data.
- `status` (VARCHAR): `'Draft'` | `'Pending Approval'` | `'Approved'` | `'Rejected'`.
- `director_id` (INTEGER, Foreign Key): References approving `users(id)`.
- `director_name` (VARCHAR): Approving Director's name.
- `director_signature` (TEXT): Director approval signature (mandatory upon approval).
- `approval_date` (DATETIME): Timestamp when Director signed approval.
- `rejection_reason` (TEXT): Mandatory rejection reason provided by Director.
- `created_at` (DATETIME): Audit creation timestamp.
- `updated_at` (DATETIME): Audit update timestamp.

### 3. Indexes
Optimized query performance for search, multi-criteria filtering, and dashboards:
- `idx_vouchers_status`
- `idx_vouchers_employee_id`
- `idx_vouchers_expense_date`
- `idx_vouchers_department`
- `idx_vouchers_category`
- `idx_vouchers_amount`

---

## 📡 RESTful API Documentation

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates credentials; returns signed JWT & user profile |
| `GET` | `/api/auth/me` | Protected | Returns current authenticated user session |
| `POST` | `/api/auth/signature` | Protected | Uploads / saves default signature for authenticated user |

### Voucher Endpoints (`/api/vouchers`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/vouchers` | All Roles | Lists vouchers (Filtered by role: Employees see own vouchers; Director & Accounts see all). Supports search, multi-filters, sorting, and pagination. |
| `GET` | `/api/vouchers/:id` | All Roles | Fetches full voucher details (Strict authorization checks). |
| `POST` | `/api/vouchers` | Employee | Creates a new voucher (Draft or direct submission with signature). |
| `PUT` | `/api/vouchers/:id` | Employee | Updates existing draft voucher (Enforces Draft status check). |
| `POST` | `/api/vouchers/:id/submit`| Employee | Submits draft voucher for approval (Requires employee signature). |
| `DELETE` | `/api/vouchers/:id` | Employee | Deletes draft voucher (Only Draft status permitted). |
| `POST` | `/api/vouchers/:id/approve`| Director | Approves pending voucher (Requires Director signature). |
| `POST` | `/api/vouchers/:id/reject` | Director | Rejects pending voucher (Requires mandatory rejection reason). |

### Dashboard Endpoints (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Protected | Returns role-specific KPI metrics and recent activity feeds. |

---

## 🔍 Multi-Criteria Search & Filter (Bonus Feature)

The application supports filtering through both UI controls and API query parameters:
- **Search Query**: Fuzzy search matching Voucher Number, Employee Name, Title, and Department.
- **Status Filter**: `Draft`, `Pending Approval`, `Approved`, `Rejected`.
- **Department Filter**: Dropdown filter across all enterprise business units.
- **Expense Category**: Software, Travel, Meals, Hardware, Supplies, Meetings, etc.
- **Date Range**: Filter vouchers between `start_date` and `end_date`.
- **Amount Range**: Filter vouchers between `min_amount` and `max_amount`.
- **Sorting**: Multi-column sorting (`created_at`, `expense_date`, `amount`, `voucher_number`, `status`) in `ASC` or `DESC` order.

---

## 📑 Business & Validation Rules Enforced

1. **Voucher Numbering**: Every voucher receives an automated, unique sequential identifier formatted as `EV-YYYY-XXXX`.
2. **Draft State**: New vouchers are created as `Draft`. Employees can freely edit and delete vouchers while in Draft state.
3. **Mandatory Employee Signature**: An employee signature (uploaded image or drawn via digital canvas pad) is mandatory before a voucher can be submitted for approval.
4. **Read-Only Post Submission**: Once a voucher is submitted, it transitions to `Pending Approval` and becomes read-only for the employee.
5. **Director Authority**: Only the Director role can approve or reject vouchers. Directors cannot alter the expense claim details entered by the employee.
6. **Mandatory Director Signature**: When approving a voucher, the Director MUST provide a digital signature.
7. **Mandatory Rejection Reason**: When rejecting a voucher, the Director MUST provide a rejection explanation. The rejection reason is immediately displayed to the employee on their dashboard and voucher detail screen.
8. **Accounts Team Read-Only Compliance**: The Accounts Team has read-only organization-wide access to monitor approved vouchers, verify signatures, and generate printable voucher records for disbursement. They cannot create, edit, delete, approve, or reject vouchers.
9. **Strict Employee Isolation**: Employees can only view vouchers created by themselves.

---

## 💡 Assumptions Made During Development

1. **Currency**: All amounts are handled in Indian Rupees (INR ₹) formatted per standard accounting conventions.
2. **Sequential Numbering**: Voucher numbers are formatted per fiscal year (`EV-2026-0001`, `EV-2026-0002`, etc.) and automatically incremented upon record creation.
3. **Dual Signature Input**: Candidates were asked to support image file uploads for signatures. In addition to standard file uploads (`.png`, `.jpg`, `.webp`, `.svg`), an HTML5 digital canvas pad was built to allow evaluators and users to draw real signatures directly in the browser.
4. **Self-Contained Database**: SQLite was chosen as the default storage engine to ensure immediate zero-friction evaluation on any machine without requiring external PostgreSQL/MySQL database server configuration. The SQL schema in `database/schema.sql` is standard ANSI SQL and directly portable to PostgreSQL or MySQL.
5. **Print Layout**: The voucher detail page includes an official corporate letterhead view formatted specifically for standard A4 printing and PDF export via `window.print()`.

---

## 📂 Project Structure

```
voucher project/
├── database/
│   └── schema.sql                 # SQL schema & table definitions
├── server/
│   ├── config/
│   │   └── database.js            # SQLite connection, pragmas, initialization
│   ├── controllers/
│   │   ├── authController.js      # Login, session, signature uploads
│   │   ├── voucherController.js   # Voucher CRUD, validations, approvals, filters
│   │   └── dashboardController.js # Role-specific KPI metrics calculation
│   ├── middleware/
│   │   ├── auth.js                # JWT verification & RBAC authorization
│   │   └── upload.js              # Multer upload & signature handlers
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── voucherRoutes.js
│   │   └── dashboardRoutes.js
│   ├── uploads/
│   │   └── signatures/            # Stored signature files
│   ├── seed.js                    # Database seeder with demo accounts & vouchers
│   ├── server.js                  # Main Express server entry point
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Header with theme toggle & demo switcher
│   │   │   ├── Sidebar.jsx        # Role-based responsive navigation
│   │   │   ├── ProtectedRoute.jsx # Route guards for auth & roles
│   │   │   ├── VoucherStatusBadge.jsx
│   │   │   ├── SignaturePadOrUpload.jsx # Dual image upload & canvas signature
│   │   │   ├── VoucherPrintView.jsx     # Official printable voucher document
│   │   │   └── ConfirmationModal.jsx    # Signature approval & rejection modals
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   ├── DirectorDashboard.jsx
│   │   │   ├── AccountsDashboard.jsx
│   │   │   ├── VoucherCreate.jsx
│   │   │   ├── VoucherEdit.jsx
│   │   │   ├── VoucherDetail.jsx
│   │   │   └── VoucherList.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── index.css              # Custom Vanilla CSS Design System
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .env.example
├── package.json                   # Root package scripts (concurrent dev server)
└── README.md
```

---

Github repo link:- https://github.com/shubhamgabhane1104/Expense-Voucher-Management-System.git

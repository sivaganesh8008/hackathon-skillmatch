

---

# 🚀 SkillMatch

**SkillMatch** is a full-stack web application designed to help companies efficiently manage employees, track availability, and intelligently match employees to projects based on skills and status.

It provides **role-based dashboards** for **company admins** and **employees**, secure authentication, and a modern, responsive UI.

---

## ✨ Features

### 🔐 Authentication & Roles

* Secure authentication using **Supabase Auth**
* Role-based access:

  * **Company Admin**
  * **Employee**
* Protected routes (unauthenticated users redirected)

---

### 🏢 Company Admin Dashboard

* Create and manage employee accounts
* Auto-generate secure passwords for employees
* View employee details:

  * Name
  * Email
  * Department
  * Designation
  * Availability status
* Search employees by name, email, or department
* View company-level statistics:

  * Total employees
  * Available employees
  * Employees on project

---

### 👨‍💼 Employee Dashboard

* View personal profile
* Update availability status
* View assigned projects (if any)

---

### 📊 Project & Matching

* Project management
* Employee–project matching logic
* Availability-based filtering

---

### 🎨 UI & UX

* Built with **shadcn/ui**
* Skeleton loaders & spinners
* Toast notifications (Sonner)
* Fully responsive design
* Clean, modern dashboard layout

---

## 🛠 Tech Stack

### Frontend

* **React** (with TypeScript)
* **Vite**
* **React Router DOM**
* **shadcn/ui**
* **Tailwind CSS**
* **Lucide Icons**
* **Zod** (form validation)
* **React Query**

### Backend / Services

* **Supabase**

  * Authentication
  * Database
  * Role-based access
* PostgreSQL (via Supabase)

---

## 📂 Project Structure

```
skillmatch/
├── src/
│   ├── components/
│   │   └── ui/            # shadcn/ui components
│   ├── integrations/
│   │   └── supabase/      # Supabase client
│   ├── pages/
│   │   ├── Auth.tsx
│   │   ├── Dashboard.tsx
│   │   ├── CompanyDashboard.tsx
│   │   ├── Employees.tsx
│   │   ├── Projects.tsx
│   │   ├── Matching.tsx
│   │   ├── Profile.tsx
│   │   └── NotFound.tsx
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🚦 Routing Overview

| Route                | Description             |
| -------------------- | ----------------------- |
| `/`                  | Landing page            |
| `/auth`              | Login / Signup          |
| `/dashboard`         | Employee dashboard      |
| `/company-dashboard` | Company admin dashboard |
| `/employees`         | Employee management     |
| `/projects`          | Project management      |
| `/matching`          | Skill matching          |
| `*`                  | 404 – Not Found         |

---

## ▶️ Getting Started

### 1️⃣ Install Dependencies

```bash
npm install
```

### 2️⃣ Start Development Server

```bash
npm run dev
```

### 3️⃣ Open in Browser

```
http://localhost:5173
```

---

## 🔐 Environment Setup

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📌 Best Practices Followed

* No `node_modules` committed
* Role-based route protection
* Centralized Supabase client
* Clean component separation
* Strong form validation using Zod

---

## 🚀 Future Enhancements

* Advanced skill-based matching algorithm
* Admin analytics dashboard
* Project timelines & tracking
* Email notifications for employees
* Export reports (CSV / PDF)

---

## 👨‍💻 Author

**Sivaganesh**
Project built as a real-world full-stack application using modern web technologies.

---

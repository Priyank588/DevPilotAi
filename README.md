# DevPilot AI — AI-Powered Developer Platform

DevPilot AI is a production-ready, full-stack MERN (MongoDB, Express, React, Node) application. It is an AI-powered developer platform where users can upload source code, analyze it using AI, detect bugs, estimate complexity, generate documentation, prepare for interviews, and keep developer notes.

---

## 🚀 Features

- **Authentication Module**: Register, Login, Logout, JWT protected routes, profile edit, profile picture upload, and password changes.
- **Project Module**: Create projects, visibility controls (public/private), tech stacks, tag inputs, and source code viewer.
- **AI Code Review**: Dynamic Code Quality, Readability, and Maintainability scores, naming conventions, refactoring suggestions, security vulnerability scanner, and best practices.
- **Complexity Analyzer**: Time and space complexity predictions, detection of nested loops, recursive functions, duplicated blocks, and unused declarations.
- **Bug Detection**: Detects logical errors, syntax issues, infinite loop risks, null-pointer risks, and memory leak issues.
- **Documentation Generator**: Automated Markdown generation for README, Project Summary, Installation Guide, Folder Structures, and API docs.
- **Interview Preparation**: Generates MCQs, Coding, HR, Technical, and Follow-up interview questions categorized by difficulty (Easy, Medium, Hard).
- **Developer Notes**: Categorized notes, task lists (To-Dos), bookmarks, and learning guides.
- **Developer Analytics**: Beautiful data visualization charts representing code quality, bug trends, projects created, and monthly activity using Recharts.
- **System Settings**: Light & Dark mode themes, appearance, account management, and profile management.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js
- **Routing**: React Router DOM (v6)
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form
- **Code Editor**: Monaco Editor (`@monaco-editor/react`)
- **State Management**: Context API
- **Charts**: Recharts
- **Icons**: React Icons (Heroicons/Remix Icons)
- **API Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT & BcryptJS
- **Middleware**: Helmet, Cors, Morgan, Express-Validator, Multer

---

## ⚙️ Project Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (running locally on port 27017 or a MongoDB Atlas URI)

### Step 1: Clone & Navigate
```bash
cd DevPilotAi
```

### Step 2: Backend Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables in `.env` (already pre-configured):
   ```env
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/devpilot
   JWT_SECRET=devpilot_super_secret_jwt_key_2024
   JWT_EXPIRE=7d
   UPLOAD_MAX_SIZE=52428800
   NODE_ENV=development
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will be running at `http://localhost:5001`.*

### Step 3: Frontend Setup
1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The frontend will be running at `http://localhost:5173`.*

---

## 📁 Directory Structure

```
DevPilotAi/
├── client/
│   ├── src/
│   │   ├── components/       # Reusable components (common UI & layouts)
│   │   ├── context/          # Context Providers (Auth, Theme, Notify)
│   │   ├── hooks/            # Custom Hooks (useAuth, useTheme)
│   │   ├── layouts/          # Layout wraps (Auth, Dashboard)
│   │   ├── pages/            # View Pages (Dashboard, AIReview, etc.)
│   │   ├── services/         # API Service Calls (Axios interceptors)
│   │   └── index.css         # Tailwind & Custom Glassmorphism styles
│   └── vite.config.js        # Vite + Tailwind plugin config
└── server/
    ├── config/               # DB connection
    ├── controllers/          # Business logic handlers
    ├── middleware/           # Auth, Multer, Error handlers
    ├── models/               # MongoDB Schemas
    ├── routes/               # Express endpoints
    ├── services/             # AI Simulator & Analytics
    ├── validators/           # Route input validators
    ├── uploads/              # Saved files (avatars, projects)
    └── server.js             # Main server entrypoint
```

---

## 🔒 Licenses & Credits

Developed as part of DevPilot AI project. Built with clean coding standards, robust error handling, validation, responsive UX, and elegant glassmorphic components.

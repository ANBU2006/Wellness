# Wellness+ — Digital Wellness Recommendation Engine
### Project Report

---

## 1. Project Overview

**Wellness+** is a full-stack web application designed to serve as a personalized digital wellness and health coaching platform. It enables users to track their physical health metrics daily — including weight, height, BMI, sleep hours, and exercise minutes — and receive tailored diet and exercise recommendations based on their computed BMI category.

The platform supports two distinct user roles: **Members** (regular users who track and monitor their own health) and **Coaches** (health professionals who monitor member progress and send personalized advice). This dual-role architecture creates a connected wellness ecosystem where coaching and self-management work hand in hand.

---

## 2. Project Objectives

- Provide a secure, role-based web platform for daily health tracking
- Automatically compute BMI from user-entered weight and height data
- Categorize users into health bands (Underweight, Normal, Overweight, Obese) and serve relevant recommendations
- Motivate users through **daily entry streaks** and visual progress charts
- Enable coaches to monitor all registered members and deliver personalized guidance
- Demonstrate a complete, production-ready **MERN stack** application

---

## 3. Technology Stack

| Layer      | Technology                        | Purpose                                      |
|------------|-----------------------------------|----------------------------------------------|
| Frontend   | React JS (Vite)                   | Single-page application UI                   |
| Backend    | Node.js + Express.js              | RESTful API server                           |
| Database   | MongoDB (via Mongoose)            | NoSQL data persistence                       |
| Auth       | JWT (JSON Web Token)              | Stateless, role-based authentication         |
| Charts     | Chart.js                          | Health trend visualizations                  |
| Deployment | Vercel (Client) + Render (Server) | Cloud hosting for production                 |

---

## 4. System Architecture

The application follows a classic **3-tier MERN architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (React + Vite)               │
│  Pages: Login, Register, Dashboard, Progress, Profile,  │
│         CoachDashboard                                  │
│  Context: AuthContext (JWT token management)            │
│  API Layer: Axios (HTTP client)                         │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP / REST API
┌───────────────────────────▼─────────────────────────────┐
│                  SERVER (Node.js + Express.js)           │
│  Routes: /api/auth, /api/user, /api/coach,              │
│          /api/health-records                            │
│  Middleware: JWT Auth Guard                             │
│  Controllers: userController, healthRecordController,   │
│               coachController                           │
└───────────────────────────┬─────────────────────────────┘
                            │ Mongoose ODM
┌───────────────────────────▼─────────────────────────────┐
│                   DATABASE (MongoDB)                    │
│  Collections: Users, HealthRecords, DietPlans, Advice   │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Key Features

### 5.1 Member Features
- **Secure Registration & Login** — JWT-based authentication with role assignment
- **Daily Health Logging** — Record weight, height, BMI, sleep hours, and exercise minutes per day
- **Automatic BMI Computation** — BMI calculated from weight (kg) and height (cm) in real time
- **BMI Category Display** — Visual classification with range guide (Underweight / Normal / Overweight / Obese)
- **Daily Streak Tracking** — Consecutive days of logging to encourage habit formation
- **Personalized Recommendations** — Diet and exercise plans fetched based on the user's BMI category
- **Trend Charts** — Historical line charts for weight, BMI, sleep, and exercise over time (Chart.js)
- **Coach Advice Inbox** — Members receive and view personalized advice from their assigned coach
- **Profile Management** — Update personal attributes: age, gender, activity level, height, weight

### 5.2 Coach Features
- **Member Directory** — View all registered members with their latest health stats
- **Health History Monitoring** — Drill into any member's full health record log
- **Personalized Advice Dispatch** — Send custom messages to individual members
- **Training Protocol Management** — Create and manage exercise/diet protocols for each BMI category
- **Coach Profile & Stats** — View performance metrics: total clients managed, advice messages sent, protocols created

### 5.3 BMI Logic

| BMI Range    | Health Category |
|:-------------|:----------------|
| < 18.5       | Underweight     |
| 18.5 - 24.9  | Normal          |
| 25.0 - 29.9  | Overweight      |
| >= 30.0      | Obese           |

BMI is computed using the standard formula: **BMI = weight (kg) / height (m)^2**

---

## 6. Database Schema

### 6.1 User Collection
| Field         | Type    | Description                                        |
|:--------------|:--------|:---------------------------------------------------|
| name          | String  | Full name of the user                              |
| email         | String  | Unique email (login credential)                    |
| password      | String  | User password                                      |
| role          | String  | 'user' or 'coach'                                  |
| age           | Number  | Age in years                                       |
| gender        | String  | Male / Female / Other                              |
| height        | Number  | Height in centimetres                              |
| weight        | Number  | Weight in kilograms                                |
| activityLevel | String  | Sedentary / Lightly Active / Moderately Active / Very Active / Extra Active |
| createdAt     | Date    | Account creation timestamp                         |

### 6.2 HealthRecord Collection
| Field           | Type     | Description                                    |
|:----------------|:---------|:-----------------------------------------------|
| userId          | ObjectId | Reference to User collection                   |
| dateKey         | String   | UTC date string YYYY-MM-DD (unique per user/day) |
| weight          | Number   | Logged weight (kg)                             |
| height          | Number   | Logged height (cm)                             |
| bmi             | Number   | Computed BMI value                             |
| category        | String   | BMI category label                             |
| sleepHours      | Number   | Hours of sleep logged                          |
| exerciseMinutes | Number   | Minutes of exercise logged                     |
| date            | Date     | Actual timestamp of the log entry              |

### 6.3 DietPlan Collection
Stores recommended diet and exercise plans referenced by BMI category. Seeded via `server/seed/seedData.js`.

### 6.4 Advice Collection
| Field     | Type     | Description                        |
|:----------|:---------|:-----------------------------------|
| memberId  | ObjectId | Target member (User reference)     |
| coachId   | ObjectId | Sending coach (User reference)     |
| message   | String   | Advice text content                |
| createdAt | Date     | Timestamp                          |

---

## 7. API Endpoints

| Method | Endpoint                     | Description                            | Auth Required |
|:-------|:-----------------------------|:---------------------------------------|:--------------|
| POST   | /api/auth/register           | Register a new member account          | None          |
| POST   | /api/auth/login              | Login and receive JWT token            | None          |
| GET    | /api/user/profile            | Fetch logged-in user's profile         | Member        |
| PUT    | /api/user/profile            | Update user profile fields             | Member        |
| POST   | /api/health-records          | Create/update daily health entry       | Member        |
| GET    | /api/health-records          | Retrieve all health records for user   | Member        |
| GET    | /api/health-records/streak   | Get current daily entry streak         | Member        |
| GET    | /api/coach/members           | List all registered members            | Coach         |
| GET    | /api/coach/members/:id       | Get a specific member's health history | Coach         |
| POST   | /api/coach/advice            | Send advice to a member                | Coach         |
| GET    | /api/coach/protocols         | Retrieve training protocols            | Coach         |

---

## 8. Frontend Pages

| Route        | Page              | Description                                                |
|:-------------|:------------------|:-----------------------------------------------------------|
| /            | Login             | Authentication page with login and register options        |
| /register    | Register          | New user registration form                                 |
| /dashboard   | Member Dashboard  | BMI summary, streak counter, recommendations, coach advice |
| /progress    | Progress Tracking | Historical trend charts and full log history               |
| /profile     | Profile           | View and edit personal health attributes                   |
| /coach       | Coach Dashboard   | Member directory, advice dispatch, protocol management     |

---

## 9. Project Structure

```
Wellness/
├── client/                         # React JS Frontend (Vite)
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx           # Login & Register UI
│       │   ├── Register.jsx        # Registration form
│       │   ├── Dashboard.jsx       # Member health dashboard
│       │   ├── Progress.jsx        # Charts & history
│       │   ├── Profile.jsx         # Profile management
│       │   └── CoachDashboard.jsx  # Coach management panel
│       ├── components/             # Reusable UI components (Navbar)
│       ├── context/                # AuthContext (JWT state management)
│       └── api/                    # Axios HTTP client instance
│
├── server/                         # Node.js + Express.js Backend
│   ├── index.js                    # Server entry point
│   ├── controllers/
│   │   ├── userController.js       # Profile CRUD
│   │   ├── healthRecordController.js # Daily logging logic
│   │   └── coachController.js      # Coach actions
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   ├── HealthRecord.js         # Health log schema
│   │   ├── DietPlan.js             # Recommendation schema
│   │   └── Advice.js               # Coach advice schema
│   ├── routes/                     # Express route definitions
│   ├── middleware/                 # JWT authentication guard
│   ├── utils/                      # Shared helper functions
│   ├── scripts/                    # DB maintenance utilities
│   └── seed/                       # Database seeding scripts
│
└── package.json                    # Root dev runner (concurrently)
```

---

## 10. Setup and Deployment

### Local Development
1. Install dependencies in root, `server/`, and `client/` directories
2. Configure `server/.env` with MongoDB URI, JWT secret, and port
3. Seed the database with diet plans and coach account
4. Run `npm run dev` from the root to launch both servers concurrently
   - Client: http://localhost:5173
   - Server: http://localhost:5000

### Production Deployment
- **Frontend** deployed to **Vercel** (configured via `client/vercel.json`)
- **Backend** deployed to **Render** (configured via environment variables and `client/.env.production`)

---

## 11. Conclusion

**Wellness+** successfully demonstrates a complete, production-ready MERN stack application with real-world features including role-based access control, JWT authentication, automated health metric computations, dynamic data visualizations, and a coach-member advisory system. The project illustrates the integration of frontend, backend, and database layers in a cohesive full-stack architecture designed around user wellness and engagement.

The application is structured, scalable, and follows industry practices in REST API design, component-based UI development, and cloud deployment.

---

*Report prepared for the Wellness+ project — Full Stack Web Application using the MERN Stack.*

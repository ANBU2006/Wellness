# Wellness+ — Digital Wellness Recommendation Engine

A full-stack **MERN** application for health coaching, BMI tracking, daily streak monitoring, and personalized diet & exercise recommendations.

---

## 🚀 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React JS (Vite)                   |
| Backend    | Node JS + Express JS              |
| Database   | MongoDB                           |
| Auth       | JWT (JSON Web Token)              |
| Styling    | Vanilla CSS + Inline Styles       |
| Icons      | Lucide React                      |
| Charts     | Chart.js + react-chartjs-2        |

---

## ✨ Features

### 👤 Member (User) Role
- Register and log in securely with JWT authentication
- Track daily **weight, height, BMI, sleep, and exercise**
- View **BMI category** (Underweight / Normal / Overweight / Obese) with range guide
- Monitor **daily entry streak** to stay consistent
- Get personalized **diet & exercise recommendations** based on BMI
- View **trend charts** for weight, BMI, sleep, and exercise history
- Receive **coach advice** directly on the dashboard

### 🏋️ Coach Role
- View all registered members and their profiles
- Monitor each member's **health history** (weight, height, BMI, sleep, exercise)
- Send **personalized advice** to individual members
- Manage **training protocols** for different BMI categories
- View coach profile with performance stats (clients managed, advice sent, protocols created)

### 📊 BMI Logic
| Range        | Category    |
|--------------|-------------|
| < 18.5       | Underweight |
| 18.5 – 24.9  | Normal      |
| 25 – 29.9    | Overweight  |
| ≥ 30         | Obese       |

---

## 🗂️ Project Structure

```
Wellness/
├── client/                    # React JS frontend (Vite)
│   └── src/
│       ├── pages/             # Dashboard, Progress, Profile, Login, CoachDashboard
│       ├── components/        # Navbar
│       ├── context/           # AuthContext
│       └── api/               # Axios instance
├── server/                    # Node JS + Express JS backend
│   ├── controllers/           # healthRecordController, userController, coachController
│   ├── models/                # User, HealthRecord, DietPlan, Advice
│   ├── routes/                # auth, user, health-records, coach
│   ├── scripts/               # dedupeHealthRecords.js (DB maintenance utility)
│   ├── utils/                 # healthRecordUtils.js (shared helper functions)
│   └── seed/                  # seedData.js (diet plans), seedCoach.js (coach account)
└── package.json
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js installed
- MongoDB running locally

### 2. Install Dependencies
```bash
# Root
npm install

# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Setup Environment Variables
Inside the `server/` folder, create a `.env` file:
```
cp server/.env.example server/.env
```
Then open `server/.env` and set your values:
```
MONGODB_URI=mongodb://localhost:27017/wellness
JWT_SECRET=any_random_secret_key
PORT=5000
```
> ⚠️ Without this `.env` file the server will NOT start.

### 4. Seed the Database
```bash
cd server
node seed/seedData.js     # Seeds diet plan recommendations
node seedCoach.js         # Creates default coach account
```

### 5. Run the Application
```bash
# From root directory
npm run dev
```
- **Client** runs on: `http://localhost:5173`
- **Server** runs on: `http://localhost:5000`

---

## 🔑 Default Accounts

| Role  | Email                 | Password         |
|-------|-----------------------|------------------|
| Coach | coach@wellness.com    | coach123         |
| User  | Register via UI       | —                |

---

## 🌐 App Routes

| URL                              | Page              |
|----------------------------------|-------------------|
| `http://localhost:5173/`         | Login             |
| `http://localhost:5173/dashboard`| Member Dashboard  |
| `http://localhost:5173/progress` | Progress Tracking |
| `http://localhost:5173/profile`  | Profile           |
| `http://localhost:5173/coach`    | Coach Dashboard   |

---

## 🛠️ Utility Scripts

### `server/scripts/dedupeHealthRecords.js`
A one-time database maintenance script that removes duplicate health records for the same user on the same date, keeping the most complete record.

```bash
cd server
node scripts/dedupeHealthRecords.js
```

### `server/utils/healthRecordUtils.js`
Shared backend utility functions for consistent date key generation, day range lookup, and record deduplication logic used across controllers.

---

## 🎨 UI / UX Improvements (Latest Update)

- **Increased font sizes** globally — base font bumped to `18–21px`, all section headings, labels, and body text scaled up for better readability
- **Improved text contrast** — replaced near-invisible light grays (`#94A3B8`, `#64748B`) with darker, more accessible colors (`#475569`, `#334155`, `#1e293b`) across all pages
- **Table headers** — column headings in Progress and Coach Dashboard now use larger, darker text
- **Form labels** — all form field labels made bolder and more visible
- **Gradient banners** — subheading text on hero banners changed from 75% to 92% white opacity for maximum legibility
- **Navbar** — link text and logout button font sizes increased, inactive link color darkened
- **Coach Dashboard** — client list, stats labels, and advice history text made larger and more readable
- **Profile page** — detail card labels, stat labels, and activity description all improved

# ⚡ FitTrack — Fitness Workout Tracker

A full-stack fitness tracking web app built with **HTML, CSS, Vanilla JavaScript, Node.js, Express, and MongoDB**.

Log your workouts, view stats, and manage your fitness history — all with a clean, dark, sporty UI.

---

## 📁 Project Structure

```
fittrack/
├── backend/
│   ├── models/
│   │   └── Workout.js       # Mongoose schema
│   ├── routes/
│   │   └── workouts.js      # CRUD API routes
│   ├── .env.example         # Environment variable template
│   ├── package.json
│   └── server.js            # Express server entry point
│
└── frontend/
    ├── css/
    │   └── style.css        # All styles
    ├── js/
    │   └── app.js           # All frontend logic
    └── index.html           # Main HTML page
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port 27017)
- npm (comes with Node.js)

---

### Step 1 — Clone / Download the Project

```bash
# If using git:
git clone <your-repo-url>
cd fittrack

# Or just unzip the project folder and open it.
```

---

### Step 2 — Set Up Environment Variables

```bash
cd backend
cp .env.example .env
```

Open `.env` and confirm (or change) your MongoDB URI:

```env
MONGODB_URI=mongodb://localhost:27017/fittrack
PORT=5000
```

---

### Step 3 — Install Dependencies

```bash
# Make sure you're in the backend folder
cd backend
npm install
```

---

### Step 4 — Start MongoDB

Make sure MongoDB is running locally. If you installed it as a service it may already be running. Otherwise:

```bash
# macOS/Linux
mongod

# Windows (run as Administrator)
net start MongoDB
```

---

### Step 5 — Run the Server

```bash
# From the backend folder:
npm start

# Or for auto-restart on file changes (development):
npm run dev
```

You should see:
```
✅ Connected to MongoDB successfully
🚀 FitTrack server running at http://localhost:5000
```

---

### Step 6 — Open the App

Visit **http://localhost:5000** in your browser.

The Express server serves the frontend files automatically — no separate server needed!

---

## 🔌 API Endpoints

| Method | Route                    | Description          |
|--------|--------------------------|----------------------|
| GET    | `/api/workouts`          | Get all workouts     |
| GET    | `/api/workouts/:id`      | Get one workout      |
| POST   | `/api/workouts`          | Create a workout     |
| PUT    | `/api/workouts/:id`      | Update a workout     |
| DELETE | `/api/workouts/:id`      | Delete a workout     |

### Example POST body

```json
{
  "name": "Morning Run",
  "type": "Cardio",
  "duration": 30,
  "calories": 280,
  "notes": "Felt great today!",
  "date": "2024-01-15"
}
```

---

## ✨ Features

- ✅ **Log workouts** with name, type, duration, calories, notes, and date
- ✅ **View all workouts** in a responsive card grid
- ✅ **Edit** any workout via a smooth modal dialog
- ✅ **Delete** workouts with confirmation
- ✅ **Search** workouts by name or notes
- ✅ **Filter** by workout type (Cardio, Strength, Flexibility, Sports, Other)
- ✅ **Live stats** — total workouts, calories burned, minutes trained
- ✅ **Toast notifications** for success and error feedback
- ✅ **Fully responsive** — works on mobile and desktop

---

## 🛠 Tech Stack

| Layer    | Technology             |
|----------|------------------------|
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend  | Node.js + Express      |
| Database | MongoDB + Mongoose     |
| Styling  | Pure CSS with variables |
| Fonts    | Bebas Neue + DM Sans   |

---

## 🐛 Troubleshooting

**"Cannot connect to server"**
→ Make sure `npm start` is running in the `backend/` folder.

**"MongoDB connection failed"**
→ Make sure MongoDB is running locally. Check your `.env` `MONGODB_URI`.

**Page loads but workouts don't appear**
→ Open browser DevTools → Console for error messages.

---

## 📄 License

MIT — free to use and modify.

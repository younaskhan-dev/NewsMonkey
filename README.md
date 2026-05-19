# 🐵 NewsMonkey — Premium AI-Powered Social News SaaS

NewsMonkey is a state-of-the-art social news aggregator and reader web application designed to deliver real-time news with premium AI tools, high-fidelity responsive styling, integrated user feeds, and seamless speech capabilities.

---

## 🚀 Key Features

* **🤖 AI-Powered Article Summaries**: Click the `✨ AI Summary` button on any card to get instant, cached 3-bullet points generated using Google Gemini AI models.
* **🎧 Audio News Reader (Podcast Mode)**: Real-time text-to-speech rendering utilizing the browser's native `Web Speech API`. Includes an animated live equalizer soundwave and fully featured playback controls (Play, Pause, Resume, Stop).
* **📱 Premium Responsive Layouts**: Tailored styling systems across mobile, tablet, and wide desktop views:
  * **Navbar**: Two-tier mobile menu header containing a full-width search input similar to premium mobile services.
  * **Filter Bar**: Touch-friendly horizontal mobile scroll container for categories.
  * **News Cards**: Flexible two-tier desktop grid and mobile stacked action cards.
* **🛡️ Security & Authentication**: Fully secured client sessions via **Clerk Authentication** featuring user profiles, sync-to-database backend endpoints, and custom glassmorphic `AuthModal` action-gating.
* **💬 Rich Social Engagements**: Users can save/bookmark news stories, write comments inside dedicated modal panels, and like articles.
* **🗂️ Personalized "For You" Segmented Feed**: Tailored headlines serving only categories curated by signed-in users.
* **📊 Administrator Dashboard**: High-level platform statistics (total users, bookmarks, comments) and advanced administrative tools to update user roles.

---

## 🛠️ Architecture & Technology Stack

The application is structured as a MERN hybrid, splitting front-end layouts and back-end REST APIs.

### Frontend (Next.js Application)
* **Framework**: React 19 (Next.js 16.2.6 App Router with Turbopack)
* **State Management**: Zustand (stores query indices, search histories, and filtering arrays)
* **Style System**: Tailwind CSS, Radix UI primitives, Lucide React icons
* **Animations**: Framer Motion transitions and equalizer wave physics
* **Scroll Engine**: `react-infinite-scroll-component`

### Backend (Express Server)
* **Environment**: Node.js, Express.js
* **Database**: MongoDB Atlas using Mongoose ODM
* **Auth Verification**: Clerk Express auth middleware wrapper
* **NLP & AI Engine**: Google Gemini API SDK

---

## 📂 Project Structure

```text
newsapp/
├── backend/                  # Node.js + Express API Server
│   ├── config/               # DB Connection Configurations
│   ├── controllers/          # Business logic handlers (Users, Likes, Summaries)
│   ├── middleware/           # Clerk authentication & role validators
│   ├── models/               # MongoDB Mongoose schemas
│   ├── routes/               # Express endpoint routes
│   └── server.js             # Main server entry file
│
└── src/                      # Next.js Frontend Application
    ├── app/                  # App Router Pages (category, dashboard, profiles)
    ├── components/           # Reusable UI widgets (NewsItem, Navbar, CommentSection)
    │   └── ui/               # Radix & Base design system components
    ├── lib/                  # Centralized API fetch layers
    └── store/                # Zustand global state manager (useNewsStore)
```

---

## ⚙️ Environment Configuration

To run this project locally, configure the following environmental variables:

### 1. Frontend Configuration
Create a `.env.local` file inside the root directory:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Backend Configuration
Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
GEMINI_API_KEY=your_gemini_ai_api_key
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 Installation & Local Development

Follow these steps to spin up the development environment:

### Step 1: Clone the repository
```bash
git clone <repository_url>
cd newsapp
```

### Step 2: Set up & Run the Backend Server
```bash
cd backend
npm install
npm run start
```
*The backend server should start running at `http://localhost:5000`.*

### Step 3: Set up & Run the Frontend Client
Open a new terminal session in the root folder:
```bash
npm install
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.*

---

## 🔄 Feature Execution Flows

### AI Article Summarization Pipeline
```
[User Clicks AI Summary]
           │
           ▼
[Client checks API caching] ──> (GET /api/summaries?articleUrl=...)
           │
           ├──► [Cache Hit]  ──► [Return Saved Bullet Points]
           │
           └──► [Cache Miss] ──► [Call Gemini API] ──► [Save to DB] ──► [Return]
```

### Authentication Lock Flow
```
[Gated Action (Like/Bookmark)] ──► [Check Session State via Clerk]
                                              │
                    ┌─────────────────────────┴────────────────────────┐
                    ▼                                                  ▼
             [User Logged In]                                  [User Logged Out]
                    │                                                  │
                    ▼                                                  ▼
         [Perform action in DB]                            [Pop up glassmorphic AuthModal]
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

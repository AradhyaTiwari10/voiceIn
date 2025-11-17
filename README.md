# VoiceIn — AI Voice-Powered LinkedIn Content Creator

**"Speak your thoughts. Publish like a pro."**

VoiceIn is a web app that allows users to speak their thoughts, ideas, insights, daily learnings, or updates — and instantly transforms them into beautiful, polished, viral-ready LinkedIn posts.

## Problem Statement

Professionals, founders, students, and creators want to build a LinkedIn audience but struggle with:
- Writing good posts
- Feeling shy about writing
- Lack of time
- Struggling with tone, structure, and clarity
- Not knowing how the LinkedIn algorithm works
- Giving up after 2–3 posts

**VoiceIn removes the friction** by allowing users to simply speak → convert → polish → publish.

## Core Idea

A voice-controlled LinkedIn post generator where users:
1. Click "Record"
2. Speak for 10–60 seconds
3. Voice gets converted into text
4. AI reorganizes it like a professional LinkedIn post
5. Suggests engaging hooks, clean structure, CTAs, and hashtags
6. User can preview, edit, save, or publish with one click

It's like **ChatGPT + Speech Recognition + LinkedIn post generator** combined.

## How It Works

### Step 1 — User Speaks
- Uses Web Speech API to capture voice
- Displays real-time transcript in editor

### Step 2 — Transcript Sent to Backend
Backend receives:
- Transcript
- Tone preference
- Title (optional)
- Post type (story, announcement, thought, advice)

### Step 3 — AI Generates LinkedIn-Style Post
Backend returns:
- Polished post
- HTML preview
- Better hooks
- Suggested hashtags
- Emojis (optional)

### Step 4 — User Publishes
- Backend calls LinkedIn API using OAuth
- Shares post on user's profile

## Target Users

**Primary:**
- Students building personal brand
- Founders & entrepreneurs
- Creators
- Job seekers
- Working professionals
- Startup teams

**Secondary:**
- Recruiters
- Coaches
- Thought leaders
- College communities
- Bootcamp mentors

## Use Cases

- **Daily Learning Logs** — "I learned X today…" → AI converts into polished reflective post
- **Student Journey** — Summarizes hackathon, project, internship update
- **Founder Stories** — Share lessons, mistakes, company updates
- **Announcements** — New job, launch, achievement
-  *Thought Leadership** — Share insights without typing long posts

## Top Features

### Voice Post Creation
- Start/Stop voice capture
- Live transcript
- Auto-punctuation
- Noise cleanup
- Filler word removal (uh, umm, like, etc.)

### AI LinkedIn Polisher
- Strong hook
- Clear 5–7 sentence structure
- Value-driven or story-driven
- CTA
- 12–15 relevant hashtags

### LinkedIn-Style Editor
- Beautiful blue-white theme
- Minimal, distraction-free interface
- Save drafts
- Auto-sync with backend

### JWT Authentication
- Secure login/signup
- Protect publish API
- User session management

### Publish to LinkedIn
- Direct post upload (LinkedIn Marketing API)
- Auto-formatting
- One-click publishing

### Analytics (Future)
- Best time to post
- Engagement tracking
- CTA suggestions

## Tech Stack

### Frontend
- **React** + **Vite** — Fast, modern UI
- **React Router** — Client-side routing
- **Axios** — API communication
- **Web Speech API** — Voice capture

### Backend
- **Node.js** + **Express** — REST API
- **MongoDB** + **Mongoose** — Database
- **JWT** — Authentication
- **Bcrypt** — Password hashing
- **CORS** — Cross-origin requests

### Deployment
- **Frontend:** Vercel
- **Backend:** Railway
- **Database:** MongoDB Atlas

## Getting Started

### Prerequisites
- Node.js 16+
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/voicein.git
   cd voicein
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
   Create `.env` file:
   ```
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/voiceIn?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key
   PORT=5001
   ```
   Start backend:
   ```bash
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   ```
   Create `.env.local` file:
   ```
   VITE_API_URL=http://localhost:5001/api
   ```
   Start frontend:
   ```bash
   npm run dev
   ```

4. **Access the app**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5001

## 📁 Project Structure

```
voicein/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── login.jsx
│   │   │   ├── signup.jsx
│   │   │   └── dashboard.jsx
│   │   ├── utils/
│   │   │   └── axiosInstance.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.local
│   ├── .env.production
│   └── package.json
├── backend/
│   ├── server.js
│   ├── .env
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/signup` — Register new user
- `POST /api/login` — Login user

### Protected Routes
- `GET /api/dashboard` — Get user dashboard (requires JWT)

## Environment Variables

### Frontend
- `VITE_API_URL` — Backend API URL

### Backend
- `DATABASE_URL` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `PORT` — Server port (default: 5001)

## Dependencies

### Frontend
- react
- react-router-dom
- axios
- vite

### Backend
- express
- mongoose
- bcrypt
- jsonwebtoken
- cors
- dotenv

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect repo to Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy

### Backend (Railway)
1. Push to GitHub
2. Connect repo to Railway
3. Set `DATABASE_URL` and `JWT_SECRET`
4. Deploy

# Thank YOu
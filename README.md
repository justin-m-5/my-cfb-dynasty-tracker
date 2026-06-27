# 🏈 CFB Dynasty Tracker

A modern web application built to track, manage, and analyze your College Football Dynasty progress, team statistics, and seasonal records.

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Database / Backend:** Supabase (PostgreSQL)

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### 1. Clone and Install Dependencies
Navigate into your project folder and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory of your project. Add your local Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_public_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_service_role_key
```

### 3. Run the Development Server
Start the local Next.js server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the live application. You can begin customizing your application by editing `app/page.tsx`.

## 📈 Planned Features

- **User Dashboard:** At-a-glance view of your active dynasty seasons, team status, and recent matchups.
- **Game Logger:** Easily record weekly game results, stats, scores, and track historical head-to-head records against top rivals.
- **Roster & Recruit Management:** Log player progress, track award winners, monitor top recruiting targets, and log pipeline statuses.
- **Historical Records:** Generate aggregate historical achievements over multiple fictional decades.

## 🌐 Deployment

The easiest way to deploy this application live is using the Vercel Platform. Make sure to manually add your Supabase environment variables into the Vercel project configuration dashboard before deploying.
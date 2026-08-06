# Ben's Trip App

A mobile-optimized travel companion built with Next.js.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Neon database
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Go to Connection Details and copy the connection string

### 3. Create your .env.local
```bash
cp .env.example .env.local
```
Fill in:
- `NEXT_PUBLIC_BEN_PIN` — Ben's 4-digit PIN
- `NEXT_PUBLIC_SENDER_PIN` — Your PIN to access the send screen
- `SENDER_PASSWORD` — API password for sending notes
- `NEON_DATABASE_URL` — Your Neon connection string

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel
```bash
# Push to GitHub first, then:
# 1. Go to vercel.com → New Project → Import your repo
# 2. Add all env vars from .env.local in Vercel dashboard
# 3. Deploy
```

## How it works
- Ben enters his PIN → sees full trip view
- You enter your PIN → sees note sender
- Notes are stored in Neon and appear in Ben's Notes inbox
- Itinerary cards show countdown, tap to expand for details + app links
- Destination guides show tips and facts for each city

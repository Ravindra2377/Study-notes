# Supabase Setup - Quick Start

## ✅ Code is Ready!

I've already set up all the code for Supabase integration:

- ✅ Installed `@supabase/supabase-js`
- ✅ Created `lib/supabase.ts` (database client)
- ✅ Updated `lib/storage.ts` (now uses PostgreSQL)
- ✅ Created `supabase-schema.sql` (database tables)
- ✅ Updated `.env.example` with Supabase variables

## 🚀 Next Steps - Create Supabase Project

### Step 1: Create Account (2 minutes)

I'll open Supabase for you. Follow these steps:

1. **Sign up** with GitHub (recommended) or email
2. Click "New Project"
3. Fill in:
   - **Name**: `study-notes-generator`
   - **Database Password**: Create a strong password (SAVE IT!)
   - **Region**: Choose closest to you (e.g., Mumbai for India)
4. Click "Create new project"
5. Wait 2-3 minutes for setup

### Step 2: Create Database Tables (1 minute)

Once your project is ready:

1. Go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Open the file `supabase-schema.sql` in your project
4. **Copy ALL the SQL code** from that file
5. **Paste** it into the SQL Editor
6. Click **"Run"** (bottom right)
7. You should see "Success. No rows returned"

### Step 3: Get Your API Keys (1 minute)

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in left menu
3. Copy these TWO values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

### Step 4: Add Keys to Your Project (1 minute)

1. Copy `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_key_here
   ```

3. Also add your Claude API key if you haven't:
   ```env
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
   ```

## ✅ That's It!

Your app is now connected to PostgreSQL!

### Test It:

1. Run `npm run dev`
2. Upload a file
3. Generate notes
4. Check Supabase → Table Editor → `notes` table
5. You should see your data!

---

## 🎯 What's Different Now?

**Before (File Storage):**
- Notes saved in local `data/` folder
- Lost when server restarts
- Can't scale

**Now (PostgreSQL):**
- Notes saved in cloud database
- Persistent and reliable
- Scales to millions of users
- Can query and analyze data

---

## 📊 View Your Data

In Supabase Dashboard:
- **Table Editor** → See all notes and users
- **SQL Editor** → Run custom queries
- **Database** → View schema and relationships

---

**Ready to create your Supabase project? I'll open the website for you!**

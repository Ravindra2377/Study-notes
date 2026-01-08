# Supabase + Vercel Deployment Guide

Complete step-by-step guide to deploy your AI-Powered Study Notes Generator using Supabase (database) and Vercel (hosting).

## 🎯 Why Supabase + Vercel?

- **Supabase**: PostgreSQL database, authentication, real-time features
- **Vercel**: Automatic deployments, global CDN, zero-config Next.js hosting
- **Both Free Tiers**: Perfect for getting started
- **Auto-Scaling**: Handles growth automatically

---

## Part 1: Supabase Setup (5 minutes)

### Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended)

### Step 2: Create New Project

1. Click "New Project"
2. Fill in details:
   - **Name**: `study-notes-generator`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., Mumbai for India)
3. Click "Create new project"
4. Wait 2-3 minutes for setup

### Step 3: Create Database Tables

1. Go to **SQL Editor** in left sidebar
2. Click "New Query"
3. Copy and paste this SQL:

```sql
-- Users table for tracking usage
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  documents_processed INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table for storing generated notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  notes JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - you can restrict later)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on notes" ON notes
  FOR ALL USING (true);
```

4. Click "Run" (bottom right)
5. You should see "Success. No rows returned"

### Step 4: Get API Keys

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in left menu
3. Copy these values (you'll need them later):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

---

## Part 2: Update Your Code (5 minutes)

### Step 1: Install Supabase Client

Open terminal in your project folder:

```bash
cd d:\OneDrive\Desktop\Notes\study-notes-generator
npm install @supabase/supabase-js
```

### Step 2: Update Environment Variables

Edit `.env.local` (create if it doesn't exist):

```env
# Existing
ANTHROPIC_API_KEY=your_claude_api_key_here
NEXT_PUBLIC_APP_NAME=StudyNotes
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_FREE_TIER_LIMIT=3

# Add these new Supabase variables
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your_anon_key_here

# Optional (for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Step 3: Create Supabase Client

Create new file: `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Step 4: Update Storage Functions

Replace `lib/storage.ts` with:

```typescript
import { supabase } from './supabase';

export interface SavedNote {
  id: string;
  userId: string;
  fileName: string;
  notes: any;
  createdAt: string;
}

export interface UserUsage {
  userId: string;
  documentsProcessed: number;
  isPremium: boolean;
  lastReset: string;
}

export async function saveNote(userId: string, fileName: string, notes: any): Promise<string> {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: userId,
      file_name: fileName,
      notes: notes,
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

export async function getNote(noteId: string): Promise<SavedNote | null> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .single();

  if (error) return null;

  return {
    id: data.id,
    userId: data.user_id,
    fileName: data.file_name,
    notes: data.notes,
    createdAt: data.created_at,
  };
}

export async function getUserUsage(userId: string): Promise<UserUsage> {
  // Try to get existing user
  let { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  // If user doesn't exist, create them
  if (error || !data) {
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        user_id: userId,
        documents_processed: 0,
        is_premium: false,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    data = newUser;
  }

  // Check if we need to reset monthly counter
  const lastReset = new Date(data.last_reset);
  const now = new Date();
  
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    const { data: updated } = await supabase
      .from('users')
      .update({
        documents_processed: 0,
        last_reset: now.toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    data = updated || data;
  }

  return {
    userId: data.user_id,
    documentsProcessed: data.documents_processed,
    isPremium: data.is_premium,
    lastReset: data.last_reset,
  };
}

export async function incrementUsage(userId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_usage', { p_user_id: userId });
  
  if (error) {
    // Fallback if function doesn't exist
    const usage = await getUserUsage(userId);
    await supabase
      .from('users')
      .update({ documents_processed: usage.documentsProcessed + 1 })
      .eq('user_id', userId);
  }
}

export async function upgradeToPremium(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ is_premium: true })
    .eq('user_id', userId);

  if (error) throw error;
}
```

### Step 5: Create Database Function (Optional - for better performance)

Go back to Supabase SQL Editor and run:

```sql
CREATE OR REPLACE FUNCTION increment_usage(p_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET documents_processed = documents_processed + 1
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

---

## Part 3: Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Study Notes Generator with Supabase"

# Create GitHub repo (go to github.com/new)
# Then connect it:
git remote add origin https://github.com/YOUR_USERNAME/study-notes-generator.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Add Environment Variables

In Vercel project settings, add these environment variables:

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_APP_NAME=StudyNotes
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_FREE_TIER_LIMIT=3
RAZORPAY_KEY_ID=rzp_xxxxx (optional)
RAZORPAY_KEY_SECRET=xxxxx (optional)
```

### Step 4: Deploy!

1. Click "Deploy"
2. Wait 2-3 minutes
3. Your app will be live at `https://your-project.vercel.app`

---

## Part 4: Post-Deployment (Optional)

### Add Custom Domain

1. In Vercel project settings → Domains
2. Add your domain (e.g., `studynotes.com`)
3. Update DNS records as instructed
4. SSL certificate auto-generated

### Set Up Supabase Auth (Optional)

For user accounts instead of anonymous IDs:

1. In Supabase → Authentication → Providers
2. Enable Email/Password or Google/GitHub
3. Update code to use `supabase.auth.signUp()` and `signIn()`

### Monitor Usage

**Supabase Dashboard:**
- Database → Tables → View data
- SQL Editor → Run queries
- Logs → See errors

**Vercel Dashboard:**
- Analytics → Page views
- Logs → Function logs
- Speed Insights → Performance

---

## 🎯 Testing Your Deployment

1. Visit your Vercel URL
2. Upload a PDF or image
3. Generate notes
4. Check Supabase → Table Editor → `notes` table
5. Verify data is saved!

---

## 💰 Cost Breakdown

### Free Tier Limits

**Supabase Free:**
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- 50,000 monthly active users

**Vercel Free:**
- 100 GB bandwidth
- Unlimited deployments
- Automatic SSL

### When to Upgrade

**Supabase Pro ($25/month):**
- 8 GB database
- 100 GB file storage
- 250 GB bandwidth
- Daily backups

**Vercel Pro ($20/month):**
- 1 TB bandwidth
- Advanced analytics
- Team collaboration

---

## 🔧 Troubleshooting

### Build Fails on Vercel

**Error**: CSS parsing failed
**Solution**: Vercel's build system handles this automatically. If it persists:
1. Go to Project Settings → General
2. Set Node.js Version to `18.x`
3. Redeploy

### Database Connection Error

**Error**: "Invalid API key"
**Solution**: 
1. Check environment variables in Vercel
2. Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
3. Redeploy after adding variables

### Notes Not Saving

**Error**: RLS policy error
**Solution**:
1. Go to Supabase → Authentication → Policies
2. Make sure policies allow operations
3. Or disable RLS temporarily for testing

---

## 🚀 Next Steps

1. **Test Everything**: Upload files, generate notes, check database
2. **Add Analytics**: Google Analytics or Vercel Analytics
3. **Set Up Monitoring**: Sentry for error tracking
4. **Enable Payments**: Integrate Razorpay for premium subscriptions
5. **Add Features**: 
   - User accounts with Supabase Auth
   - Note history and favorites
   - Sharing notes with friends
   - Export to Notion/Google Docs

---

## 📞 Support

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## ✅ Deployment Checklist

- [ ] Supabase project created
- [ ] Database tables created
- [ ] API keys copied
- [ ] Code updated with Supabase client
- [ ] Environment variables set
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables added to Vercel
- [ ] Tested file upload
- [ ] Tested note generation
- [ ] Verified database storage
- [ ] Custom domain added (optional)

---

**Congratulations! Your AI Study Notes Generator is now live! 🎉**

Share it with students and start getting users!

# Quick Deploy Checklist

Follow these steps in order for fastest deployment:

## ⚡ 15-Minute Deployment

### 1. Supabase Setup (5 min)
```
✓ Go to supabase.com → New Project
✓ Copy SQL from SUPABASE-VERCEL-GUIDE.md → Run in SQL Editor
✓ Copy Project URL + anon key
```

### 2. Update Code (3 min)
```bash
npm install @supabase/supabase-js
```
✓ Add Supabase keys to `.env.local`
✓ Copy new `lib/supabase.ts` and `lib/storage.ts` from guide

### 3. Deploy to Vercel (5 min)
```bash
git add .
git commit -m "Add Supabase integration"
git push
```
✓ Go to vercel.com → Import from GitHub
✓ Add environment variables
✓ Deploy!

### 4. Test (2 min)
✓ Visit your Vercel URL
✓ Upload a file
✓ Check Supabase tables

## 🎯 Environment Variables Needed

```env
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_FREE_TIER_LIMIT=3
```

## 📝 Files to Update

1. Create: `lib/supabase.ts`
2. Replace: `lib/storage.ts`
3. Update: `.env.local`

All code is in `SUPABASE-VERCEL-GUIDE.md`!

---

**That's it! Your app will be live in 15 minutes! 🚀**

# Deployment Guide - StudyNotes

Complete guide to deploying your AI-Powered Study Notes Generator to production.

## Prerequisites

- GitHub account
- Vercel account (free tier is sufficient)
- Anthropic Claude API key
- (Optional) Razorpay account for payments

## Step 1: Prepare Your Code

### 1.1 Initialize Git Repository

```bash
cd study-notes-generator
git init
git add .
git commit -m "Initial commit: AI Study Notes Generator"
```

### 1.2 Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., `study-notes-generator`)
3. Don't initialize with README (we already have one)

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/study-notes-generator.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### 2.1 Sign Up / Log In

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in with GitHub

### 2.2 Import Project

1. Click "Add New..." → "Project"
2. Import your `study-notes-generator` repository
3. Vercel will auto-detect Next.js settings

### 2.3 Configure Build Settings

Vercel should auto-configure, but verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 2.4 Add Environment Variables

Click "Environment Variables" and add:

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
NEXT_PUBLIC_APP_NAME=StudyNotes
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_FREE_TIER_LIMIT=3
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

**Important:** 
- Get Claude API key from [Anthropic Console](https://console.anthropic.com/)
- Get Razorpay keys from [Razorpay Dashboard](https://dashboard.razorpay.com/)

### 2.5 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Your app will be live at `https://your-project.vercel.app`

## Step 3: Custom Domain (Optional)

### 3.1 Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `studynotes.com`)
3. Follow DNS configuration instructions

### 3.2 Configure DNS

Add these records to your domain provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## Step 4: Enable Razorpay Payments

### 4.1 Create Razorpay Account

1. Sign up at [Razorpay](https://razorpay.com/)
2. Complete KYC verification
3. Get API keys from Dashboard

### 4.2 Update Payment Code

Uncomment the signature verification in `app/api/payment/verify/route.ts`:

```typescript
const crypto = require('crypto');
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(orderId + '|' + paymentId)
  .digest('hex');

if (expectedSignature !== signature) {
  return NextResponse.json(
    { error: 'Invalid payment signature' },
    { status: 400 }
  );
}
```

### 4.3 Test Payment Flow

1. Use Razorpay test mode first
2. Test with test cards: `4111 1111 1111 1111`
3. Verify payment webhook

## Step 5: Database Migration (Optional)

The app currently uses file-based storage. For production, consider:

### Option A: Vercel Postgres

```bash
npm install @vercel/postgres
```

### Option B: Supabase

```bash
npm install @supabase/supabase-js
```

### Option C: MongoDB Atlas

```bash
npm install mongodb
```

Update `lib/storage.ts` to use your chosen database.

## Step 6: Monitoring & Analytics

### 6.1 Vercel Analytics

1. Go to Project Settings → Analytics
2. Enable Web Analytics (free)

### 6.2 Error Tracking

Add Sentry for error tracking:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 6.3 Usage Monitoring

Monitor Claude API usage:
- Check Anthropic Console for usage stats
- Set up billing alerts
- Monitor costs per user

## Step 7: Performance Optimization

### 7.1 Enable Caching

Add to `next.config.js`:

```javascript
module.exports = {
  images: {
    domains: ['your-domain.com'],
  },
  compress: true,
  poweredByHeader: false,
};
```

### 7.2 Optimize Images

Use Next.js Image component for any images you add.

### 7.3 Enable Edge Functions

For faster global performance, consider Edge Runtime for API routes.

## Step 8: SEO Optimization

### 8.1 Add Sitemap

Create `app/sitemap.ts`:

```typescript
export default function sitemap() {
  return [
    {
      url: 'https://your-domain.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];
}
```

### 8.2 Add Robots.txt

Create `app/robots.ts`:

```typescript
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://your-domain.com/sitemap.xml',
  };
}
```

## Step 9: Security Checklist

- [ ] Environment variables are in Vercel, not in code
- [ ] API keys are kept secret
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] Input validation is in place
- [ ] File upload size limits are enforced

## Step 10: Launch Checklist

- [ ] Test all features in production
- [ ] Verify payment flow works
- [ ] Check mobile responsiveness
- [ ] Test with different file types
- [ ] Monitor error logs
- [ ] Set up billing alerts
- [ ] Create backup strategy
- [ ] Document API endpoints
- [ ] Prepare marketing materials
- [ ] Set up customer support

## Troubleshooting

### Build Fails

**Error:** "Module not found"
```bash
npm install
npm run build
```

**Error:** "Environment variable not found"
- Check Vercel dashboard → Settings → Environment Variables
- Redeploy after adding variables

### API Errors in Production

**Error:** "ANTHROPIC_API_KEY is not configured"
- Verify environment variable in Vercel
- Check variable name matches exactly
- Redeploy project

### File Upload Issues

**Error:** "Request entity too large"
- Check Vercel limits (4.5MB for Hobby, 50MB for Pro)
- Consider using external storage (S3, Cloudinary)

## Scaling Considerations

### For 1,000+ Users

1. **Database**: Migrate to Postgres/MongoDB
2. **File Storage**: Use S3 or Cloudinary
3. **Caching**: Implement Redis for session management
4. **CDN**: Use Vercel Edge Network
5. **Rate Limiting**: Implement per-user rate limits

### For 10,000+ Users

1. **Load Balancing**: Use Vercel's automatic scaling
2. **Database Replicas**: Set up read replicas
3. **Queue System**: Use Bull/BullMQ for async processing
4. **Monitoring**: Advanced monitoring with Datadog/New Relic

## Cost Estimation

### Monthly Costs (10,000 users)

- **Vercel Hosting**: $0 (Hobby) or $20 (Pro)
- **Claude API**: ~₹1,500 (assuming 50% use free tier)
- **Database**: ₹500-2,000 (if using external DB)
- **Total**: ₹2,000-4,000/month

### Revenue (10,000 users)

- **Premium Users (10%)**: 1,000 × ₹99 = ₹99,000/month
- **Costs**: ₹4,000/month
- **Profit**: ₹95,000/month

## Support & Maintenance

### Regular Tasks

- Monitor API usage daily
- Check error logs weekly
- Update dependencies monthly
- Review user feedback
- Optimize performance

### Updates

```bash
# Update dependencies
npm update

# Check for security issues
npm audit

# Deploy updates
git add .
git commit -m "Update dependencies"
git push
```

## Next Steps

1. **Marketing**: Share on Twitter, Reddit, Product Hunt
2. **SEO**: Create blog content about study techniques
3. **Features**: Add quiz generation, flashcards
4. **Mobile App**: Consider React Native version
5. **Partnerships**: Partner with educational institutions

---

**Congratulations! Your AI Study Notes Generator is now live! 🚀**

For support, visit: https://github.com/YOUR_USERNAME/study-notes-generator/issues

# Razorpay Payment Integration Guide

Complete guide to set up Razorpay payments for your AI Study Notes Generator's premium subscriptions.

---

## 🎯 Why Razorpay?

- ✅ **India's #1 Payment Gateway** - Most trusted by Indian users
- ✅ **UPI Support** - 84% of digital payments in India
- ✅ **Easy Integration** - Simple API, great documentation
- ✅ **Low Fees** - 2% per transaction (industry standard)
- ✅ **Instant Settlements** - Get paid quickly

---

## Part 1: Create Razorpay Account (5 minutes)

### Step 1: Sign Up

1. Go to https://razorpay.com
2. Click **"Sign Up"** (top right)
3. Fill in details:
   - **Email**: Your business email
   - **Phone**: Your mobile number
   - **Password**: Create strong password
4. Verify email and phone (OTP)

### Step 2: Complete KYC (Business Verification)

**For Testing (Immediate):**
- You can start with **Test Mode** immediately
- No KYC required for testing
- Get test API keys right away

**For Production (1-2 days):**
1. Go to **Settings** → **Account & Settings**
2. Click **"Complete KYC"**
3. Provide:
   - **Business Name**: Your app name or company
   - **PAN Card**: Business or personal PAN
   - **Bank Account**: For receiving payments
   - **GST Number**: (Optional, but recommended)
4. Submit documents
5. Wait for approval (usually 24-48 hours)

### Step 3: Get API Keys

#### Test Mode (For Development):

1. Go to **Settings** → **API Keys**
2. Under **Test Mode**, you'll see:
   - **Key ID**: `rzp_test_xxxxx`
   - **Key Secret**: Click "Generate Test Key" → Copy it
3. **Save both keys** - you'll need them!

#### Live Mode (After KYC Approval):

1. Toggle to **Live Mode**
2. Click **"Generate Live Keys"**
3. Copy:
   - **Key ID**: `rzp_live_xxxxx`
   - **Key Secret**: Save securely!

---

## Part 2: Add Keys to Your Project (2 minutes)

### Update `.env.local`

Open `d:\OneDrive\Desktop\Notes\study-notes-generator\.env.local` and add:

```env
# For Testing
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret_key_here

# For Production (after KYC approval)
# RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
# RAZORPAY_KEY_SECRET=your_live_secret_key_here
```

**Important:**
- Use **test keys** during development
- Switch to **live keys** only after KYC approval
- Never commit these keys to Git!

---

## Part 3: Enable Payment Verification (5 minutes)

### Update Payment Verification Code

The payment verification code is already in your project but commented out. Let's enable it:

1. Open `app/api/payment/verify/route.ts`

2. **Uncomment** the verification code (around line 15-26):

```typescript
// Remove the comment markers from this section:
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

This ensures payment security by verifying the signature from Razorpay.

---

## Part 4: Create Payment UI Component (10 minutes)

### Create Razorpay Payment Modal

Create new file: `components/PaymentModal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentModal({ isOpen, onClose, userId }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: 9900, // ₹99 in paise (99 * 100)
          currency: 'INR',
          name: 'StudyNotes Premium',
          description: 'Unlimited AI-generated study notes',
          image: '/favicon.ico',
          handler: async function (response: any) {
            // Payment successful, verify on backend
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              alert('🎉 Payment successful! You are now a Premium member!');
              window.location.reload();
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: '',
            email: '',
            contact: '',
          },
          theme: {
            color: '#8b5cf6',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
        setLoading(false);
      };
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Upgrade to Premium</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-lg bg-purple-500/20 border border-purple-500/30">
            <div className="text-3xl font-bold gradient-text mb-2">₹99/month</div>
            <div className="text-gray-400">Unlimited AI-generated notes</div>
          </div>

          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Unlimited documents
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span> All AI features
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Priority processing
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Export to PDF/text
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Cancel anytime
            </li>
          </ul>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Processing...' : 'Pay ₹99 with Razorpay'}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment powered by Razorpay
        </p>
      </div>
    </div>
  );
}
```

### Add Razorpay Key to Environment

Update `.env.local` to include the public key:

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
```

---

## Part 5: Integrate Payment Button (5 minutes)

### Update Pricing Card

Modify `components/PricingCard.tsx` to open the payment modal:

```typescript
// Add this import at the top
import { useState } from 'react';
import PaymentModal from './PaymentModal';

// Inside the component, add:
const [showPayment, setShowPayment] = useState(false);

// Update the button onClick:
<button
  onClick={() => {
    if (isPopular) {
      setShowPayment(true);
    } else {
      onSelect();
    }
  }}
  className={/* existing classes */}
>
  {buttonText}
</button>

// Add the modal at the end:
<PaymentModal 
  isOpen={showPayment} 
  onClose={() => setShowPayment(false)}
  userId="user_id_here" // Get from localStorage
/>
```

---

## Part 6: Testing Payments (5 minutes)

### Test Mode Credentials

Razorpay provides test cards for testing:

**Test Card Numbers:**
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

**Test UPI:**
```
UPI ID: success@razorpay
```

**Test Wallets:**
- All wallets work in test mode
- Use any phone number

### Testing Flow:

1. Run your app: `npm run dev`
2. Click "Upgrade to Premium"
3. Payment modal opens
4. Use test card details
5. Complete payment
6. Check Razorpay dashboard → Payments

---

## Part 7: Go Live (After KYC Approval)

### Checklist Before Going Live:

- [ ] KYC approved by Razorpay
- [ ] Bank account verified
- [ ] Test payments working
- [ ] Payment verification code enabled
- [ ] Live API keys added to production

### Switch to Live Mode:

1. **Update Environment Variables** (in Vercel):
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=your_live_secret
   ```

2. **Enable Webhooks** (Optional but recommended):
   - Go to Razorpay Dashboard → Webhooks
   - Add webhook URL: `https://your-domain.com/api/payment/webhook`
   - Select events: `payment.captured`, `payment.failed`

3. **Test with Real Payment**:
   - Use a small amount (₹1)
   - Verify it appears in dashboard
   - Check bank settlement

---

## 💰 Pricing & Fees

### Razorpay Fees:

- **Standard**: 2% per transaction
- **Example**: ₹99 subscription = ₹2 fee, you get ₹97

### Settlement:

- **T+1 to T+3 days** (1-3 business days)
- Can enable instant settlements (additional fee)

### GST:

- 18% GST on Razorpay fees
- Example: ₹2 fee + ₹0.36 GST = ₹2.36 total

---

## 🔒 Security Best Practices

### Do's:
✅ Always verify payment signature on backend
✅ Use HTTPS in production
✅ Store secret key in environment variables
✅ Enable 2FA on Razorpay account
✅ Monitor transactions regularly

### Don'ts:
❌ Never expose secret key in frontend
❌ Don't skip signature verification
❌ Don't store card details (Razorpay handles this)
❌ Don't commit API keys to Git

---

## 🐛 Troubleshooting

### Payment Modal Not Opening

**Issue**: Razorpay script not loading
**Solution**: 
```typescript
// Add to your page's <head> in layout.tsx:
<Script src="https://checkout.razorpay.com/v1/checkout.js" />
```

### "Invalid Key" Error

**Issue**: Wrong API key or not set
**Solution**: 
- Check `.env.local` has correct keys
- Restart dev server after adding keys
- Verify key starts with `rzp_test_` or `rzp_live_`

### Payment Successful but Not Verified

**Issue**: Signature verification failing
**Solution**:
- Check `RAZORPAY_KEY_SECRET` is set correctly
- Ensure verification code is uncommented
- Check server logs for errors

---

## 📊 Monitor Your Payments

### Razorpay Dashboard:

1. **Payments**: See all transactions
2. **Settlements**: Track money coming to your bank
3. **Analytics**: Revenue reports
4. **Customers**: User payment history

### Set Up Alerts:

- Email notifications for payments
- SMS for failed payments
- Webhook for real-time updates

---

## 🚀 Next Steps

1. **Create Razorpay Account** → Get test keys
2. **Add Keys to `.env.local`** → Test locally
3. **Create Payment Modal** → Copy code above
4. **Test with Test Cards** → Verify flow works
5. **Complete KYC** → Get live keys
6. **Deploy to Vercel** → Add live keys
7. **Go Live!** → Start accepting payments

---

## 📞 Support

- **Razorpay Docs**: https://razorpay.com/docs
- **Support**: support@razorpay.com
- **Phone**: 1800-102-0480 (India)

---

## ✅ Quick Checklist

- [ ] Razorpay account created
- [ ] Test API keys obtained
- [ ] Keys added to `.env.local`
- [ ] Payment verification code enabled
- [ ] Payment modal component created
- [ ] Tested with test card
- [ ] KYC submitted (for production)
- [ ] Live keys ready (after approval)

---

**Ready to start accepting payments! 💰**

Your students can now upgrade to premium and you can start earning revenue!

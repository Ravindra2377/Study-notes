# StudyNotes - AI-Powered Study Guide Generator

Transform your PDFs and images into comprehensive study guides with AI. Get summaries, key concepts, practice questions, and memory tips instantly.

![StudyNotes](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Claude AI](https://img.shields.io/badge/Claude-AI-purple?style=for-the-badge)

## ✨ Features

- 📄 **PDF & Image Support** - Upload PDFs or images with automatic text extraction
- 🤖 **AI-Powered Notes** - Claude AI generates comprehensive study materials
- 📝 **Smart Summaries** - Concise overviews of your study materials
- 🎯 **Key Concepts** - Automatically extracted main ideas
- 📚 **Definitions** - Important terms and their meanings
- ❓ **Practice Questions** - Test your knowledge
- 💡 **Memory Tips** - Mnemonic devices and learning strategies
- 📥 **Export Options** - Download as PDF, text, or copy to clipboard
- 💰 **Freemium Model** - 3 free documents/month, ₹99 for unlimited

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Anthropic Claude API key ([Get one here](https://console.anthropic.com/))

### Installation

1. **Clone or navigate to the project:**
   ```bash
   cd study-notes-generator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your API keys:
   ```env
   ANTHROPIC_API_KEY=your_actual_claude_api_key_here
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **Upload a file** - Drag & drop or click to select a PDF or image
2. **Generate notes** - Click "Generate Study Notes" button
3. **Review your notes** - AI-generated study materials appear instantly
4. **Export** - Download as PDF/text or copy to clipboard

## 💰 Monetization

### Pricing Model

- **Free Tier**: 3 documents/month
- **Premium**: ₹99/month for unlimited documents

### Cost Analysis

- **Claude API Cost**: ~₹0.015 per document (using Claude Sonnet 4.5)
- **Profit Margin**: 98% on premium subscriptions
- **Revenue Potential**: 10,000 users × ₹99 = ₹9,90,000/month

### Payment Integration

The app includes Razorpay payment structure. To enable payments:

1. Sign up for [Razorpay](https://razorpay.com/)
2. Get your API keys
3. Add them to `.env.local`
4. Uncomment payment verification code in `/app/api/payment/verify/route.ts`

## 🏗️ Project Structure

```
study-notes-generator/
├── app/
│   ├── api/
│   │   ├── upload/route.ts          # File upload & text extraction
│   │   ├── generate-notes/route.ts  # AI note generation
│   │   ├── notes/[id]/route.ts      # Retrieve saved notes
│   │   └── payment/verify/route.ts  # Payment verification
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Landing page
├── components/
│   ├── FileUpload.tsx              # Drag-drop file upload
│   ├── NoteGenerator.tsx           # Main note generation UI
│   ├── NoteViewer.tsx              # Display & export notes
│   └── PricingCard.tsx             # Pricing display
├── lib/
│   ├── claude.ts                   # Claude AI integration
│   └── storage.ts                  # File-based storage
├── data/                           # Auto-generated storage
│   ├── notes/                      # Saved notes
│   └── users/                      # User usage data
└── .env.example                    # Environment template
```

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude API
- **PDF Parsing**: pdf-parse
- **OCR**: Tesseract.js
- **PDF Export**: jsPDF
- **File Upload**: react-dropzone
- **Icons**: lucide-react

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Add Environment Variables in Vercel:**
   - `ANTHROPIC_API_KEY`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_MAX_FILE_SIZE`
   - `NEXT_PUBLIC_FREE_TIER_LIMIT`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📊 API Endpoints

### POST `/api/upload`
Upload and extract text from PDF/image files.

**Request:** FormData with `file` field  
**Response:** `{ success: true, text: string, fileName: string }`

### POST `/api/generate-notes`
Generate study notes from extracted text.

**Request:**
```json
{
  "text": "extracted text content",
  "fileName": "document.pdf",
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "noteId": "uuid",
  "notes": {
    "summary": "...",
    "keyConcepts": [...],
    "definitions": [...],
    "practiceQuestions": [...],
    "memoryTips": [...]
  },
  "usage": {
    "documentsProcessed": 1,
    "limit": 3,
    "isPremium": false,
    "remaining": 2
  }
}
```

### GET `/api/notes/[id]`
Retrieve saved notes by ID.

**Response:** `{ success: true, note: SavedNote }`

## 🎨 Customization

### Change Theme Colors

Edit `app/globals.css`:
```css
:root {
  --primary: #8b5cf6;      /* Purple */
  --secondary: #3b82f6;    /* Blue */
  --accent: #ec4899;       /* Pink */
}
```

### Modify Free Tier Limit

Edit `.env.local`:
```env
NEXT_PUBLIC_FREE_TIER_LIMIT=5
```

## 🐛 Troubleshooting

### "ANTHROPIC_API_KEY is not configured"
- Make sure you've created `.env.local` file
- Add your actual Claude API key
- Restart the development server

### PDF parsing fails
- Check file size (max 10MB)
- Ensure PDF is not password-protected
- Try with a different PDF

### OCR not working on images
- Check browser console for errors
- Ensure image is clear and readable
- Try with higher resolution image

## 📝 License

MIT License - feel free to use this project for your own purposes!

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📧 Support

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for students everywhere**

<div align="center">

![MannSahay Banner](./public/banner.png)

# 🧠 MannSahay
### AI-Powered Digital Mental Health Companion for Indian Students

[![Smart India Hackathon 2025](https://img.shields.io/badge/SIH-2025-orange?style=for-the-badge&logo=india&logoColor=white)](https://www.sih.gov.in/)
[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge&logo=vercel&logoColor=white)](https://mannsahay.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Team](https://img.shields.io/badge/Team-BotZilla-purple?style=for-the-badge&logo=github)](https://github.com/mohitbansal25082006)

** Smart India Hackathon 2025 | Problem Statement ID: SIH25092**  
**Organization:** Government of Jammu and Kashmir  
**Category:** Software | **Theme:** MedTech / BioTech / HealthTech

---

### 🌟 [**Experience MannSahay Live**](https://mannsahay.vercel.app/) 🌟

*"Your Mind Matters. Always. Even When You're Alone."*  
*"Tumhare Saath Hai, Har Pal."*

</div>

---

## 📋 Table of Contents

- [🌍 Problem Statement](#-problem-statement)
- [💡 Our Solution](#-our-solution)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Technology Stack](#-technology-stack)
- [📊 Database Schema](#-database-schema)
- [🎯 Core Modules](#-core-modules)
- [🔒 Privacy & Security](#-privacy--security)
- [📱 User Journey](#-user-journey)
- [🎨 UI/UX Highlights](#-uiux-highlights)
- [📈 Impact Metrics](#-impact-metrics)
- [🛠️ Setup & Installation](#️-setup--installation)
- [🧪 Testing](#-testing)
- [📦 Deployment](#-deployment)
- [👥 Team BotZilla](#-team-botzilla)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📞 Contact](#-contact)

---

## 🌍 Problem Statement

Mental health challenges among college students in India have reached **crisis levels**:

### 📉 The Statistics

- **60%+** of university students report moderate to severe symptoms of anxiety, depression, or burnout *(NIMHANS 2023)*
- **<15%** seek professional help due to stigma and accessibility barriers
- **1:500** counselor-to-student ratio in most Indian colleges
- **40M+** students affected across India

### 🚧 The Challenges

| Challenge | Impact |
|-----------|--------|
| **Stigma & Fear** | Students avoid seeking help due to judgment |
| **Access Gap** | Limited counselors, especially in rural areas |
| **Cultural Misfit** | Western-centric apps don't reflect Indian realities |
| **No Data** | Institutions lack analytics for proactive intervention |
| **Language Barrier** | English-only resources exclude vernacular speakers |

---

## 💡 Our Solution

**MannSahay** ("Companion of the Mind") is a comprehensive, **AI-powered mental health support platform** specifically designed for Indian students. It combines empathetic AI assistance, professional counseling, peer support, and educational resources in a culturally aware, multilingual environment.

### 🎯 Vision

Transform student mental health from **stigma-driven silence** to **proactive, culturally aware, and data-informed care**.

### 🌈 What Makes Us Different

✅ **100% Indian Context** - Built with Indian cultural nuances, idioms, and social dynamics  
✅ **10 Indian Languages** - Hindi, Tamil, Bengali, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, English  
✅ **AI + Human Hybrid** - LLM-powered assistance with professional counselor oversight  
✅ **Privacy-First** - Anonymous posting, no PII storage, GDPR/DPDP compliant  
✅ **Institutional Analytics** - Data-driven insights for proactive interventions  

---

## ✨ Key Features

### 🤖 1. AI-Guided Mental Health Chatbot

<details>
<summary><b>Click to expand</b></summary>

- **Empathetic Conversations**: GPT-4o/Claude Sonnet powered contextual responses
- **Crisis Detection**: Real-time keyword analysis for self-harm indicators
- **Multilingual Support**: Auto-detects and responds in user's preferred language
- **Cultural Relevance**: Uses Indian idioms, songs, and relatable examples
- **24/7 Availability**: Instant support anytime, anywhere
- **Mood Tracking**: Pre and post-chat mood assessment
- **Resource Recommendations**: Personalized suggestions based on conversation

**Technologies**: OpenAI GPT-4o, Claude 3 Sonnet, Natural Language Processing

</details>

### 📅 2. Intelligent Counselor Booking System

<details>
<summary><b>Click to expand</b></summary>

- **Smart Matching**: AI-powered counselor recommendations based on:
  - Specialization (anxiety, depression, academic stress, relationships)
  - Language preference
  - Availability
  - Student reviews and ratings
- **Visual Calendar**: Interactive slot booking interface
- **Anonymous Sessions**: Privacy-protected booking with hashed IDs
- **Reminders**: Email and in-app notifications
- **Video Integration**: Google Meet for online sessions
- **Rescheduling**: Flexible session management
- **Group Sessions**: Join or create group therapy sessions
- **Waitlist System**: Get notified when counselors have openings

**Technologies**: Neon PostgreSQL, Prisma ORM, Google Calendar API, Nodemailer

</details>

### 💬 3. Peer Support Community Forum

<details>
<summary><b>Click to expand</b></summary>

- **Anonymous Posting**: Share feelings without revealing identity
- **AI Moderation**: Automatic detection and flagging of harmful content
- **Nested Replies**: Threaded conversations for better engagement
- **Like & Bookmark**: Save and appreciate helpful content
- **Real-time Translation**: Read posts in your preferred language
- **Writing Assistance**: AI-powered suggestions for clarity and tone
- **Trending Topics**: See what the community is discussing
- **Search & Filter**: Find relevant discussions easily

**Technologies**: LLM-based moderation, Real-time translation, Sentiment analysis

</details>

### 📚 4. Multilingual Resource Library

<details>
<summary><b>Click to expand</b></summary>

- **Diverse Content**: Audio, video, PDFs, articles in 10 Indian languages
- **AI Summarization**: Quick bullet-point summaries of long resources
- **Text-to-Speech**: Listen to articles on the go
- **Quality Scoring**: AI-powered content quality analysis
- **Personalized Recommendations**: Based on mood, interests, and progress
- **Comments & Ratings**: Community-driven quality feedback
- **Download & Share**: Save resources for offline access
- **Accessibility**: High contrast mode, screen reader optimization

**Technologies**: Cloudflare R2, OpenAI embeddings, Text-to-Speech API

</details>

### 📊 5. Admin Analytics Dashboard

<details>
<summary><b>Click to expand</b></summary>

- **Real-time Insights**: Monitor emotional trends across campus
- **AI Clustering**: Group discussions into themes (exam stress, loneliness)
- **Risk Assessment**: Identify students needing urgent intervention
- **Trend Analysis**: Track mental health metrics over time
- **Moderation Stats**: Content flagged, removed, and reviewed
- **Engagement Metrics**: Active users, posts, and interactions
- **Exportable Reports**: For IQAC and institutional use

**Technologies**: Chart.js, Data analytics, AI clustering algorithms

</details>

### 🎯 6. Progress Tracking & Visualization

<details>
<summary><b>Click to expand</b></summary>

- **Mood Calendar**: Visual representation of emotional journey
- **Session History**: Track counseling sessions and outcomes
- **Goal Setting**: Set and monitor mental health goals
- **Insights**: AI-generated personal growth insights
- **Milestones**: Celebrate mental health achievements

**Technologies**: Recharts, Data visualization, AI analytics

</details>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Next.js   │  │   React     │  │  Tailwind   │              │
│  │   Frontend  │  │  Components │  │     CSS     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  NextAuth.js (GitHub OAuth + Google OAuth)              │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER (Serverless)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Forum   │  │ Booking  │  │ Resources│  │   Chat   │         │
│  │   API    │  │   API    │  │   API    │  │   API    │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         AI SERVICES                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  OpenAI  │  │  Claude  │  │Translation│ │Moderation│         │
│  │  GPT-4o  │  │ Sonnet 3 │  │  Service │  │ Service  │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         Neon PostgreSQL (Serverless)                    │    │
│  │              Prisma ORM                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       STORAGE LAYER                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │
│  │Cloudflare│  │  Vercel  │  │  Email   │                       │
│  │    R2    │  │   Blob   │  │(Resend)  │                       │
│  └──────────┘  └──────────┘  └──────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Technology Stack

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Latest-black?style=flat-square)

### Backend
![Vercel](https://img.shields.io/badge/Vercel-Serverless-black?style=flat-square&logo=vercel)
![Node.js](https://img.shields.io/badge/Node.js-20-green?style=flat-square&logo=node.js)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-OAuth-purple?style=flat-square)

### Database & ORM
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-blue?style=flat-square&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)

### AI & ML
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai)
![Anthropic](https://img.shields.io/badge/Anthropic-Claude%203-black?style=flat-square)

### Storage & CDN
![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2-F38020?style=flat-square&logo=cloudflare)
![Vercel Blob](https://img.shields.io/badge/Vercel-Blob-black?style=flat-square&logo=vercel)

### Analytics & Monitoring
![Plausible](https://img.shields.io/badge/Plausible-Analytics-5850EC?style=flat-square)

---

## 📊 Database Schema

### Core Models

```prisma
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  name          String?
  image         String?
  provider      String
  providerId    String    @unique
  hashedId      String    @unique
  language      String    @default("en")
  interests     String[]
  isAdmin       Boolean   @default(false)
  isCounselor   Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  chats         Chat[]
  posts         Post[]
  replies       Reply[]
  bookings      Booking[]
  notifications Notification[]
  resources     Resource[]
}

model Chat {
  id        String   @id @default(cuid())
  content   String
  role      String
  mood      String?
  riskLevel RiskLevel @default(NONE)
  language  String   @default("en")
  timestamp DateTime @default(now())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}

model Post {
  id          String    @id @default(cuid())
  title       String
  content     String
  category    String
  anonymous   Boolean   @default(false)
  language    String    @default("en")
  flagged     Boolean   @default(false)
  riskLevel   RiskLevel @default(NONE)
  viewCount   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
  
  // Relations
  replies     Reply[]
  likes       Like[]
  bookmarks   Bookmark[]
}

model Counselor {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  specialization String[]
  languages     String[]
  availability  Json
  rating        Float    @default(0)
  bio           String?
  imageUrl      String?
  
  // Relations
  bookings      Booking[]
  groupSessions GroupSession[]
}

model Booking {
  id           String        @id @default(cuid())
  slotTime     DateTime
  status       BookingStatus @default(PENDING)
  notes        String?
  feedback     String?
  rating       Int?
  moodBefore   String?
  moodAfter    String?
  videoLink    String?
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  counselorId  String
  counselor    Counselor     @relation(fields: [counselorId], references: [id])
}

model Resource {
  id          String   @id @default(cuid())
  title       String
  description String
  content     String?
  language    String   @default("en")
  category    String
  type        ResourceType
  fileUrl     String?
  coverImage  String?
  duration    Int?
  views       Int      @default(0)
  downloads   Int      @default(0)
  createdAt   DateTime @default(now())
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  
  // Relations
  ratings     ResourceRating[]
  bookmarks   ResourceBookmark[]
  comments    ResourceComment[]
}

enum RiskLevel {
  NONE
  LOW
  MEDIUM
  HIGH
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

enum ResourceType {
  ARTICLE
  VIDEO
  AUDIO
  PDF
  LINK
}
```

---

## 🎯 Core Modules

### 1️⃣ AI Chat Module
- Real-time empathetic conversations
- Context-aware responses
- Mood tracking and risk assessment
- Multilingual support
- Crisis intervention triggers

### 2️⃣ Booking Module
- Counselor discovery and filtering
- Smart recommendations
- Calendar integration
- Session management
- Video conferencing integration

### 3️⃣ Forum Module
- Anonymous posting
- Nested conversations
- AI moderation
- Content translation
- Writing assistance

### 4️⃣ Resources Module
- Content management
- Personalized recommendations
- Text-to-speech
- Quality analysis
- Offline access

### 5️⃣ Analytics Module
- User progress tracking
- Institutional insights
- Trend analysis
- Risk identification
- Exportable reports

---

## 🔒 Privacy & Security

### Data Protection

✅ **Zero PII Storage** - Only hashed identifiers (`SHA256(email+salt)`)  
✅ **Anonymous Posting** - No linkage between user identity and forum content  
✅ **Auto-Deletion** - Chat history deleted after 30 days  
✅ **Encrypted Transit** - HTTPS/TLS for all communications  
✅ **GDPR Compliant** - Right to access, delete, and portability  
✅ **DPDP Act Aligned** - Follows India's Data Protection Act  

### Security Measures

- **OAuth 2.0** - Secure authentication via GitHub and Google
- **CSRF Protection** - NextAuth.js built-in security
- **SQL Injection Prevention** - Prisma ORM parameterized queries
- **XSS Protection** - React's built-in sanitization
- **Rate Limiting** - API throttling to prevent abuse
- **Content Validation** - Input sanitization and validation

### Ethical AI

- **Human-in-the-Loop** - Counselors review flagged content
- **Transparent Moderation** - Clear explanations for content removal
- **Bias Mitigation** - Regular audits of AI responses
- **Consent-First** - Clear opt-in before data collection

---

## 📱 User Journey

### 🎓 Student Journey

```
1. Sign Up → GitHub/Google OAuth
2. Language Selection → Choose preferred language
3. Interest Setup → Select topics of interest
4. Dashboard → Overview of all features
5. Access Services:
   ├─ Chat with AI → Instant support
   ├─ Book Counselor → Professional help
   ├─ Join Forum → Peer support
   ├─ Browse Resources → Self-help materials
   └─ Track Progress → Visualize journey
6. Receive Notifications → Stay informed
7. Provide Feedback → Continuous improvement
```

### 👨‍⚕️ Counselor Journey

```
1. Admin Authorization → Email-based access
2. Profile Setup → Specialization, languages, availability
3. Dashboard Access:
   ├─ View Schedule → Upcoming sessions
   ├─ Manage Bookings → Confirm/reschedule
   ├─ Client Insights → Trends and history
   ├─ Share Resources → Recommend materials
   └─ Analytics → Performance metrics
4. Conduct Sessions → Video/In-person
5. Add Notes → Session documentation
6. Monitor Flags → Review risky content
```

### 🏫 Admin Journey

```
1. Admin Dashboard → Institutional overview
2. View Analytics:
   ├─ Emotional Trends → Campus-wide insights
   ├─ Popular Topics → What students discuss
   ├─ Risk Assessment → Urgent interventions needed
   └─ Engagement Metrics → Platform usage
3. Moderation:
   ├─ Review Flagged Content
   ├─ Take Actions
   └─ Provide Feedback
4. Export Reports → For IQAC and leadership
5. Manage Counselors → Add/remove counselors
```

---

## 🎨 UI/UX Highlights

### Design Principles

🎯 **Minimalistic** - Clean, distraction-free interface  
🌈 **Vibrant** - Calming color palette (blues, greens, purples)  
♿ **Accessible** - WCAG 2.1 AA compliant  
📱 **Responsive** - Mobile-first design  
⚡ **Fast** - Optimized loading times  

### Key UI Components

- **Glassmorphism Cards** - Modern, semi-transparent design
- **Smooth Animations** - Micro-interactions for delight
- **Gradient Accents** - Visual hierarchy and emphasis
- **Intuitive Navigation** - Clear information architecture
- **Loading States** - Skeleton screens and spinners
- **Error Handling** - User-friendly error messages

---

## 📈 Impact Metrics

### Projected Impact

| Metric | Target | Timeframe |
|--------|--------|-----------|
| **Students Reached** | 100,000+ | Year 1 |
| **Counseling Sessions** | 50,000+ | Year 1 |
| **AI Conversations** | 500,000+ | Year 1 |
| **Forum Posts** | 100,000+ | Year 1 |
| **Resources Accessed** | 1,000,000+ | Year 1 |
| **Languages Supported** | 10 | Launch |
| **Colleges Onboarded** | 100+ | Year 1 |

### Success Indicators

✅ **Reduced Stigma** - Increased help-seeking behavior  
✅ **Early Intervention** - Crisis prevention through AI detection  
✅ **Better Access** - Rural and urban students equally served  
✅ **Data-Driven Care** - Institutions act proactively  
✅ **Scalable Support** - AI augments limited counselor capacity  

---

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (or Neon account)
- OpenAI API key
- GitHub OAuth App
- Google OAuth App

### Step 1: Clone Repository

```bash
git clone https://github.com/mohitbansal25082006/MannSahay.git
cd mannsahay
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Environment Setup

Create `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/mannsahay"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-oauth-id"
GITHUB_CLIENT_SECRET="your-github-oauth-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="your-blob-token"

# Admin & Counselor Emails
ADMIN_EMAIL="admin@example.com"
COUNSELOR1="counselor1@example.com"
COUNSELOR2="counselor2@example.com"

EMAIL_USER="Example@gmail.com"
EMAIL_PASS="your-secret-key-here"
EMAIL_FROM="Example@gmail.com"

# Cloudflare R2 (Optional)
CLOUDFLARE_R2_ACCOUNT_ID="your-account-id"
CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-key"

# Email (Optional)
RESEND_API_KEY="your-resend-api-key"
```

### Step 4: Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database with initial data
npm run seed
```

### Step 5: Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 6: Build for Production

```bash
npm run build
npm start
```

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Coverage

```bash
npm run test:coverage
```

---

## 📦 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables

Ensure all environment variables are set in Vercel dashboard:
- Project Settings → Environment Variables
- Add all variables from `.env.local`

### Post-Deployment

1. Update `NEXTAUTH_URL` to production URL
2. Update OAuth redirect URLs
3. Run database migrations
4. Seed production database
5. Test all features

---

## 👥 Team BotZilla

<div align="center">

### 🏆 Smart India Hackathon 2025 Participants

| Position | Name |
|----------|------|
| 🎯 **Team Lead** | Mohit Bansal |
| 👨‍💻 **Member 1** | Mohit Gupta |
| 👨‍💻 **Member 2** | Nakul Dadhich |
| 👨‍💻 **Member 3** | Mridul Gupta |
| 👨‍💻 **Member 4** | Kundan Bhatiya |
| 👨‍💻 **Member 5** | Nirjala Lilhore |

</div>

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Conventional Commits** for commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

### Team BotZilla

- **Email**: mohitbansal25082006@gmail.com
- **GitHub**: [Mohit Bansal](https://github.com/mohitbansal25082006)
- **LinkedIn**: [Mohit Bansal](https://www.linkedin.com/in/mohit-bansal-383440315)

### Project Links

- **Live Demo**: [https://mannsahay.vercel.app/](https://mannsahay.vercel.app/)

---

## 🙏 Acknowledgments

- **Smart India Hackathon 2025** - For the opportunity
- **Government of Jammu and Kashmir** - Problem statement sponsor
- **NIMHANS** - Research data and insights
- **OpenAI & Anthropic** - AI technology partners
- **Vercel** - Hosting and deployment
- **Neon** - Database infrastructure

---

<div align="center">

### 🌟 If you find this project helpful, please give it a star! ⭐

**Made with ❤️ by Team BotZilla for Smart India Hackathon 2025**


---

*"Empowering 40 Million Indian Students, One Conversation at a Time"*

</div>

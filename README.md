# 💰 Pencatatan Keuangan

Aplikasi web modern untuk pencatatan keuangan pribadi atau bisnis kecil. Dibangun dengan Next.js 15, TypeScript, dan Firebase.

## ✨ Fitur Utama

- 🔐 **Authentication** - Login, register, dan session management dengan Firebase Auth
- 🏦 **Multi Rekening** - Kelola berbagai jenis rekening (Bank, Cash, E-Wallet, dll)
- 💸 **Transaksi Lengkap** - Catat pemasukan, pengeluaran, dan transfer
- 📊 **Dashboard Analitik** - Visualisasi keuangan dengan chart dan grafik
- 🏷️ **Kategori & Tag** - Organisasi transaksi yang fleksibel
- 🔍 **Pencarian & Filter** - Temukan transaksi dengan mudah
- 📤 **Ekspor CSV** - Export data untuk analisis lebih lanjut
- 🌍 **Multi Mata Uang** - Support berbagai mata uang
- 🎨 **UI Modern** - Desain clean dan responsif
- ⚡ **Performance Optimized** - Fast loading dengan ISR dan caching

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **State**: React Context + Firebase Real-time

## 📁 Project Structure

```
pencatatan-keuangan/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (dashboard)/       # Dashboard routes
│   └── page.tsx           # Landing page
├── components/            # React components (coming soon)
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── layouts/          # Layout components
├── lib/                  # Utilities & helpers
│   ├── auth/            # Authentication (context, hooks, service)
│   ├── services/        # Firestore services
│   ├── utils/           # Utility functions
│   ├── firebase.ts      # Firebase client config
│   └── firebase-admin.ts # Firebase admin config
├── types/               # TypeScript type definitions
│   └── firestore.ts     # Firestore data models
├── hooks/               # Custom React hooks
├── constants/           # App constants
└── public/             # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase account (free tier available)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd pencatatan-keuangan
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup Firebase**

Follow the complete Firebase setup guide in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

Quick steps:
- Create a Firebase project
- Enable Firestore and Authentication
- Get your Firebase config credentials

4. **Setup environment variables**

Copy `.env.example` to `.env.local` and update with your Firebase credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Firebase configuration:

```env
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Config
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

5. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Development Phases

### ✅ Phase 1: Project Setup & Infrastructure (Completed)
- ✅ Dependencies installation
- ✅ Folder structure
- ✅ Environment configuration
- ✅ Utility functions (format, cn, date)
- ✅ Custom hooks (use-debounce, use-media-query)
- ✅ Constants setup

### ✅ Phase 2: Database Schema & Firebase Setup (Completed)
- ✅ Firebase client configuration
- ✅ Firebase Admin SDK setup
- ✅ Firestore data models and types
- ✅ Firestore helper functions (CRUD operations)
- ✅ Service layer (user, account, category, transaction, transfer, tag, audit)
- ✅ Security rules and indexes

### ✅ Phase 3: Authentication System (Completed)
- ✅ Firebase Authentication integration
- ✅ Auth context and hooks (useAuth)
- ✅ Auth service (login, register, logout)
- ✅ Login page with form validation
- ✅ Register page with user preferences
- ✅ Protected route middleware
- ✅ Session management
- ✅ Landing page
- ✅ Dashboard page placeholder

### ✅ Phase 4: Core UI Components Library (Completed)
- ✅ Radix UI integration for accessible components
- ✅ Base UI components (Button, Input, Card, Badge, Alert, Label, Separator)
- ✅ Interactive components (Dialog, Dropdown, Tabs, Select)
- ✅ Utility components (Skeleton, Spinner, Avatar, Table)
- ✅ Form components (FormField, CurrencyInput, DatePicker, SearchInput)
- ✅ Layout components (DashboardLayout, Header, Sidebar, Container)
- ✅ Component index files for easy imports
- ✅ Updated dashboard with new component library
- ✅ Type-safe component variants with class-variance-authority
- ✅ Fully responsive and accessible design

### 📋 Upcoming Phases
- Phase 5: Account Management Module
- Phase 6: Category Management Module
- Phase 7: Transaction Module
- Phase 8: Transfer Module
- Phase 9: Dashboard & Analytics
- Phase 10: Export & Reporting
- Phase 11: Polish & Optimization
- Phase 12: Testing & QA
- Phase 13: Documentation & Deployment

## 🎨 Design Principles

- **Clean & Modern**: Minimalist design dengan spacing yang lapang
- **Performance First**: Optimized queries, caching, dan code splitting
- **Type Safe**: Full TypeScript coverage
- **Accessible**: WCAG compliant
- **Responsive**: Mobile-first approach
- **User Friendly**: Intuitive UX dengan micro-interactions

## 📖 Documentation

Untuk dokumentasi lengkap sistem, lihat [AGENTS.md](./AGENTS.md)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js Team
- Prisma Team
- Radix UI Team
- Tailwind CSS Team

# 💰 Pencatatan Keuangan

Aplikasi web modern untuk pencatatan keuangan pribadi atau bisnis kecil. Dibangun dengan Next.js 15, TypeScript, dan Prisma ORM.

## ✨ Fitur Utama

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
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **State**: Server Actions + React Cache

## 📁 Project Structure

```
pencatatan-keuangan/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (dashboard)/       # Dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Base UI components (Button, Card, etc)
│   ├── forms/            # Form components
│   └── layouts/          # Layout components (Sidebar, Header)
├── lib/                  # Utilities & helpers
│   ├── actions/         # Server Actions
│   ├── db/              # Database client
│   ├── utils/           # Utility functions
│   └── validations/     # Zod schemas
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
├── constants/           # App constants
├── prisma/             # Prisma schema & migrations
│   └── schema.prisma   # Database schema
└── public/             # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
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

3. **Setup environment variables**

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update `.env` with your database connection:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pencatatan_keuangan?schema=public"
```

4. **Setup database**

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

5. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Development Phases

### ✅ Phase 1: Project Setup & Infrastructure
- Dependencies installation
- Folder structure
- Environment configuration
- Utility functions

### 🔄 Phase 2: Database Schema & Prisma Setup (In Progress)
- Schema design
- Migrations
- Seed data

### 📋 Upcoming Phases
- Phase 3: Authentication System
- Phase 4: Core UI Components Library
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

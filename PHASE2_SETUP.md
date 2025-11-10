# Phase 2 Setup Guide - Database Schema & Prisma

Panduan lengkap untuk setup database dan Prisma ORM pada project Pencatatan Keuangan.

## 📋 Prerequisites

Pastikan Anda sudah menyelesaikan Phase 1 dan memiliki:
- ✅ Node.js 18+ installed
- ✅ PostgreSQL 14+ installed dan running
- ✅ Project dependencies terinstall (`npm install`)
- ✅ Git repository initialized

## 🚀 Step-by-Step Setup

### Step 1: Install PostgreSQL (Jika Belum)

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**MacOS (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
- Download dari [PostgreSQL Official](https://www.postgresql.org/download/windows/)
- Install dengan default settings
- Password yang Anda set akan digunakan untuk user `postgres`

**Verifikasi Installation:**
```bash
psql --version
# Output: psql (PostgreSQL) 14.x
```

### Step 2: Create Database

**Metode 1: Menggunakan psql (Recommended)**

```bash
# Login ke PostgreSQL (Linux/Mac)
sudo -u postgres psql

# Login ke PostgreSQL (Windows - Command Prompt as Admin)
psql -U postgres
```

Setelah masuk ke psql shell, jalankan:

```sql
-- Create database
CREATE DATABASE pencatatan_keuangan;

-- Create user (opsional, bisa pakai user postgres)
CREATE USER keuangan_user WITH PASSWORD 'keuangan_pass';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pencatatan_keuangan TO keuangan_user;

-- Grant schema privileges (untuk PostgreSQL 15+)
\c pencatatan_keuangan
GRANT ALL ON SCHEMA public TO keuangan_user;

-- Exit psql
\q
```

**Metode 2: One-liner**

```bash
# Linux/Mac
sudo -u postgres createdb pencatatan_keuangan

# Windows (jika psql sudah di PATH)
createdb -U postgres pencatatan_keuangan
```

**Verifikasi Database Created:**
```bash
sudo -u postgres psql -l | grep pencatatan
# Atau
psql -U postgres -l | grep pencatatan
```

### Step 3: Configure Environment Variables

Buat file `.env` di root project (jika belum ada):

```bash
cp .env.example .env
```

Edit `.env` dan sesuaikan dengan kredensial database Anda:

**Untuk Development Lokal dengan user postgres:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pencatatan_keuangan?schema=public"
```

**Untuk Development dengan custom user:**
```env
DATABASE_URL="postgresql://keuangan_user:keuangan_pass@localhost:5432/pencatatan_keuangan?schema=public"
```

**Format URL:**
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?schema=public
```

Contoh lain:
```env
# Default PostgreSQL installation (Windows)
DATABASE_URL="postgresql://postgres:admin@localhost:5432/pencatatan_keuangan?schema=public"

# Custom port
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/pencatatan_keuangan?schema=public"

# Remote database
DATABASE_URL="postgresql://user:pass@192.168.1.100:5432/pencatatan_keuangan?schema=public"
```

**Verifikasi Connection:**
```bash
# Test connection dengan psql
psql "postgresql://postgres:postgres@localhost:5432/pencatatan_keuangan"

# Jika berhasil connect, ketik:
\dt  # List tables (harusnya masih kosong)
\q   # Quit
```

### Step 4: Generate Prisma Client

Generate Prisma Client untuk akses type-safe ke database:

```bash
npm run db:generate
```

Expected output:
```
✔ Generated Prisma Client to ./node_modules/@prisma/client in XXms
```

**Apa yang terjadi:**
- Prisma membaca `schema.prisma`
- Generate TypeScript types untuk semua models
- Create database client di `node_modules/@prisma/client`

### Step 5: Run Database Migrations

Create dan run migrations untuk membuat semua tables:

```bash
npm run db:migrate
```

**Interactive Prompt:**
```
Enter a name for the new migration: › init
```

Ketik nama migration (contoh: `init` atau `initial_schema`) lalu Enter.

Expected output:
```
Applying migration `20241110xxx_init`
The following migration(s) have been created and applied:

migrations/
  └─ 20241110xxx_init/
    └─ migration.sql

✔ Generated Prisma Client
```

**Verifikasi Tables Created:**
```bash
# Connect ke database
psql "postgresql://postgres:postgres@localhost:5432/pencatatan_keuangan"

# List all tables
\dt

# Expected output:
#  Schema |      Name          | Type  |  Owner
# --------+--------------------+-------+---------
#  public | users              | table | postgres
#  public | accounts           | table | postgres
#  public | categories         | table | postgres
#  public | transactions       | table | postgres
#  public | transfers          | table | postgres
#  public | tags               | table | postgres
#  public | transaction_tags   | table | postgres
#  public | audit_logs         | table | postgres
#  public | _prisma_migrations | table | postgres

# Describe a table
\d users

# Quit
\q
```

### Step 6: Seed Database with Sample Data

Populate database dengan demo user dan sample data:

```bash
npm run db:seed
```

Expected output:
```
🌱 Starting database seeding...
Creating demo user...
✓ User created: demo@example.com
Creating accounts...
✓ Created 3 accounts
Creating categories...
✓ Created 9 categories
Creating tags...
✓ Created 3 tags
Creating sample transactions...
✓ Created sample transactions
Creating sample transfer...
✓ Created sample transfer

✅ Database seeding completed!

Demo Account:
Email: demo@example.com
Password: demo123
```

**Verifikasi Seed Data:**
```bash
# Connect ke database
psql "postgresql://postgres:postgres@localhost:5432/pencatatan_keuangan"

# Check users
SELECT email, name FROM users;
# Output: demo@example.com | Demo User

# Check accounts
SELECT name, type, "initialBalance" FROM accounts;
# Output: Bank BCA | BANK | 10000000.00
#         Cash     | CASH | 500000.00
#         GoPay    | E_WALLET | 300000.00

# Check categories count
SELECT type, COUNT(*) FROM categories GROUP BY type;
# Output: INCOME  | 3
#         EXPENSE | 6

# Check transactions
SELECT type, amount, notes FROM transactions LIMIT 5;

# Quit
\q
```

### Step 7: Open Prisma Studio (Optional)

Buka Prisma Studio untuk visual database management:

```bash
npm run db:studio
```

Browser akan terbuka otomatis di `http://localhost:5555`

**Features:**
- ✅ View all tables
- ✅ Browse and search data
- ✅ Create, edit, delete records
- ✅ View relationships
- ✅ Filter and sort data

**Tips:**
- Gunakan untuk quick data inspection
- Testing CRUD operations
- Debugging data issues

### Step 8: Verify Everything Works

**Check Database Connection:**
```bash
# Create test file
cat > test-db.ts << 'EOF'
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  console.log('✓ Database connected!');
  console.log('✓ Users in database:', userCount);

  const user = await prisma.user.findFirst();
  console.log('✓ Sample user:', user?.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
EOF

# Run test
npx tsx test-db.ts

# Clean up
rm test-db.ts
```

Expected output:
```
✓ Database connected!
✓ Users in database: 1
✓ Sample user: demo@example.com
```

## 🔍 Troubleshooting

### Error: "Connection refused"

**Problem:** PostgreSQL tidak running

**Solution:**
```bash
# Linux/Mac
sudo systemctl start postgresql

# Mac (Homebrew)
brew services start postgresql@14

# Windows
# Start PostgreSQL service dari Services app
```

### Error: "password authentication failed"

**Problem:** Password salah di DATABASE_URL

**Solution:**
1. Reset password PostgreSQL:
```bash
sudo -u postgres psql
ALTER USER postgres PASSWORD 'new_password';
\q
```
2. Update `.env` dengan password yang benar

### Error: "database does not exist"

**Problem:** Database belum dibuat

**Solution:**
```bash
sudo -u postgres createdb pencatatan_keuangan
# Atau jalankan CREATE DATABASE manual (lihat Step 2)
```

### Error: "relation does not exist"

**Problem:** Migrations belum dijalankan

**Solution:**
```bash
npm run db:migrate
```

### Error: "Prisma Client not generated"

**Problem:** Prisma Client belum di-generate

**Solution:**
```bash
npm run db:generate
```

### Error: Port 5432 already in use

**Problem:** PostgreSQL sudah running atau port conflict

**Solution:**
```bash
# Check apa yang pakai port 5432
sudo lsof -i :5432

# Atau gunakan port lain di DATABASE_URL
DATABASE_URL="postgresql://...@localhost:5433/..."
```

## 📊 Database Schema Overview

Setelah setup, Anda akan memiliki 8 tables:

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **users** | User accounts | email, name, password (hashed) |
| **accounts** | Financial accounts | name, type, currency, initialBalance |
| **categories** | Transaction categories | name, type (income/expense), color |
| **transactions** | Income/expense records | type, amount, date, notes |
| **transfers** | Inter-account transfers | fromAccountId, toAccountId, amount |
| **tags** | Flexible labels | name, color |
| **transaction_tags** | Transaction-Tag junction | transactionId, tagId |
| **audit_logs** | Audit trail | action, entity, oldData, newData |

## 🎯 What's Next?

✅ Phase 2 Complete! Database ready untuk digunakan.

**Next Steps:**
- **Phase 3:** Authentication System (Login, Register, Sessions)
- **Phase 4:** Core UI Components (Button, Card, Modal, etc)
- **Phase 5:** Account Management Module

## 📝 Useful Commands Reference

```bash
# Database Management
npm run db:generate      # Generate Prisma Client
npm run db:migrate       # Create and run migrations
npm run db:push          # Push schema (skip migration)
npm run db:seed          # Seed demo data
npm run db:studio        # Open Prisma Studio
npm run db:reset         # ⚠️ Reset DB (delete all data)

# PostgreSQL Commands
psql -U postgres -d pencatatan_keuangan  # Connect to DB
\dt                      # List tables
\d users                 # Describe table
\l                       # List databases
\du                      # List users
\q                       # Quit

# Backup & Restore
pg_dump -U postgres pencatatan_keuangan > backup.sql
psql -U postgres pencatatan_keuangan < backup.sql
```

## 🔐 Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` file to git (already in `.gitignore`)
- Use strong passwords for production
- Change demo account password before deploying
- Enable SSL for production database connections
- Implement rate limiting on auth endpoints

## 🎉 Success Checklist

- [ ] PostgreSQL installed and running
- [ ] Database created successfully
- [ ] `.env` configured with correct credentials
- [ ] Prisma Client generated
- [ ] Migrations applied successfully
- [ ] Seed data loaded (demo user created)
- [ ] Can open Prisma Studio
- [ ] Database connection verified

If all checked, you're ready for Phase 3! 🚀

# Database Setup Guide

## Overview

This project uses **PostgreSQL** as the database with **Prisma ORM** for type-safe database access.

## Prerequisites

- PostgreSQL 14+ installed and running
- Database user with create database privileges

## Local Development Setup

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**MacOS (with Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

### 2. Create Database and User

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE pencatatan_keuangan;

# Create user (optional, you can use existing user)
CREATE USER your_username WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE pencatatan_keuangan TO your_username;

# Exit
\q
```

### 3. Configure Environment Variables

Update `.env` file with your database credentials:

```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/pencatatan_keuangan?schema=public"
```

Example for local development:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pencatatan_keuangan?schema=public"
```

### 4. Run Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations (creates all tables)
npm run db:migrate

# Seed database with sample data (optional)
npm run db:seed
```

## Database Schema

### Models

- **User** - User accounts and preferences
- **Account** - Financial accounts (Bank, Cash, E-Wallet, etc)
- **Category** - Income/Expense categories
- **Transaction** - Income and expense records
- **Transfer** - Money transfers between accounts
- **Tag** - Flexible transaction labels
- **TransactionTag** - Many-to-many relationship between transactions and tags
- **AuditLog** - Audit trail for data changes

### Key Features

- **Multi-currency support** - Each account can have different currency
- **Soft deletes** - Categories and accounts use `isActive` flag
- **Cascade deletes** - Proper cleanup when user is deleted
- **Indexes** - Optimized for common queries (userId, date, type)
- **Decimal precision** - Money amounts stored with 2 decimal places
- **Audit logging** - Track all changes to critical data

## Available Scripts

```bash
# Generate Prisma Client (run after schema changes)
npm run db:generate

# Create a new migration
npm run db:migrate

# Push schema to database without creating migration (for prototyping)
npm run db:push

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (⚠️ DELETES ALL DATA)
npm run db:reset
```

## Prisma Studio

Prisma Studio is a visual database browser. Launch it with:

```bash
npm run db:studio
```

Then open http://localhost:5555 in your browser.

## Production Setup

### Environment Variables

For production, use connection pooling and set proper SSL:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public&sslmode=require&connection_limit=10"
```

### Migrations

```bash
# In production, only run migrate deploy (not migrate dev)
npx prisma migrate deploy
```

### Recommended Settings

- Enable connection pooling (PgBouncer or Prisma Data Proxy)
- Set up automated backups
- Monitor query performance
- Use read replicas for heavy read workloads

## Backup and Restore

### Backup

```bash
# Backup entire database
pg_dump -U your_username -d pencatatan_keuangan -F c -f backup.dump

# Backup as SQL
pg_dump -U your_username -d pencatatan_keuangan > backup.sql
```

### Restore

```bash
# Restore from dump
pg_restore -U your_username -d pencatatan_keuangan backup.dump

# Restore from SQL
psql -U your_username -d pencatatan_keuangan < backup.sql
```

## Troubleshooting

### Connection refused

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

### Authentication failed

- Check username and password in `.env`
- Verify user has proper permissions
- Check `pg_hba.conf` for authentication method

### Migration errors

```bash
# Reset database and start fresh (⚠️ DELETES ALL DATA)
npm run db:reset
```

### Prisma Client not found

```bash
# Regenerate Prisma Client
npm run db:generate
```

## Database Design Principles

1. **Normalization** - Data is normalized to 3NF
2. **Referential Integrity** - Foreign keys with appropriate cascade rules
3. **Performance** - Strategic indexes on frequently queried columns
4. **Security** - Password hashing, input validation, prepared statements
5. **Audit Trail** - Complete audit log for compliance
6. **Scalability** - Designed to handle millions of transactions

## Performance Tips

- Use composite indexes for common query patterns
- Implement pagination for large datasets
- Cache frequently accessed data (balances, summaries)
- Use database-level aggregations instead of application-level
- Monitor slow queries with `EXPLAIN ANALYZE`

## Security Considerations

- Never commit `.env` file to version control
- Use strong database passwords
- Restrict database user permissions
- Enable SSL in production
- Regular security updates
- Implement rate limiting for API endpoints
- Sanitize all user inputs

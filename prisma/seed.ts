import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create demo user
  console.log('Creating demo user...');
  const hashedPassword = await hash('demo123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword,
      timezone: 'Asia/Jakarta',
      currency: 'IDR',
      locale: 'id-ID',
    },
  });

  console.log('✓ User created:', user.email);

  // Create accounts
  console.log('Creating accounts...');
  const accounts = await Promise.all([
    prisma.account.create({
      data: {
        userId: user.id,
        name: 'Bank BCA',
        type: 'BANK',
        currency: 'IDR',
        initialBalance: 10000000,
        description: 'Rekening tabungan utama',
        color: '#0066CC',
      },
    }),
    prisma.account.create({
      data: {
        userId: user.id,
        name: 'Cash',
        type: 'CASH',
        currency: 'IDR',
        initialBalance: 500000,
        description: 'Uang tunai',
        color: '#10B981',
      },
    }),
    prisma.account.create({
      data: {
        userId: user.id,
        name: 'GoPay',
        type: 'E_WALLET',
        currency: 'IDR',
        initialBalance: 300000,
        description: 'E-wallet GoPay',
        color: '#00AA13',
      },
    }),
  ]);

  console.log(`✓ Created ${accounts.length} accounts`);

  // Create income categories
  console.log('Creating categories...');
  const incomeCategories = await Promise.all([
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Gaji',
        type: 'INCOME',
        color: '#10B981',
        icon: 'Briefcase',
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Freelance',
        type: 'INCOME',
        color: '#3B82F6',
        icon: 'Code',
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Investasi',
        type: 'INCOME',
        color: '#8B5CF6',
        icon: 'TrendingUp',
      },
    }),
  ]);

  // Create expense categories
  const expenseCategories = await Promise.all([
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Makanan & Minuman',
        type: 'EXPENSE',
        color: '#EF4444',
        icon: 'UtensilsCrossed',
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Transportasi',
        type: 'EXPENSE',
        color: '#F59E0B',
        icon: 'Car',
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Belanja',
        type: 'EXPENSE',
        color: '#EC4899',
        icon: 'ShoppingCart',
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Tagihan',
        type: 'EXPENSE',
        color: '#6366F1',
        icon: 'Receipt',
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Hiburan',
        type: 'EXPENSE',
        color: '#14B8A6',
        icon: 'Gamepad2',
      },
    }),
    prisma.category.create({
      data: {
        userId: user.id,
        name: 'Kesehatan',
        type: 'EXPENSE',
        color: '#F97316',
        icon: 'Heart',
      },
    }),
  ]);

  console.log(`✓ Created ${incomeCategories.length + expenseCategories.length} categories`);

  // Create tags
  console.log('Creating tags...');
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        userId: user.id,
        name: 'Urgent',
        color: '#EF4444',
      },
    }),
    prisma.tag.create({
      data: {
        userId: user.id,
        name: 'Recurring',
        color: '#8B5CF6',
      },
    }),
    prisma.tag.create({
      data: {
        userId: user.id,
        name: 'Business',
        color: '#3B82F6',
      },
    }),
  ]);

  console.log(`✓ Created ${tags.length} tags`);

  // Create sample transactions
  console.log('Creating sample transactions...');
  const now = new Date();
  const bankAccount = accounts[0];
  const cashAccount = accounts[1];
  const gopayAccount = accounts[2];

  // Income transactions
  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: bankAccount.id,
      categoryId: incomeCategories[0].id,
      type: 'INCOME',
      amount: 8000000,
      currency: 'IDR',
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      notes: 'Gaji bulan ini',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: bankAccount.id,
      categoryId: incomeCategories[1].id,
      type: 'INCOME',
      amount: 2500000,
      currency: 'IDR',
      date: new Date(now.getFullYear(), now.getMonth(), 15),
      notes: 'Project website',
    },
  });

  // Expense transactions
  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: cashAccount.id,
      categoryId: expenseCategories[0].id,
      type: 'EXPENSE',
      amount: 45000,
      currency: 'IDR',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      notes: 'Makan siang',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: gopayAccount.id,
      categoryId: expenseCategories[1].id,
      type: 'EXPENSE',
      amount: 35000,
      currency: 'IDR',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
      notes: 'Gojek ke kantor',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user.id,
      accountId: bankAccount.id,
      categoryId: expenseCategories[3].id,
      type: 'EXPENSE',
      amount: 500000,
      currency: 'IDR',
      date: new Date(now.getFullYear(), now.getMonth(), 5),
      notes: 'Listrik & Air',
    },
  });

  console.log('✓ Created sample transactions');

  // Create sample transfer
  console.log('Creating sample transfer...');
  await prisma.transfer.create({
    data: {
      userId: user.id,
      fromAccountId: bankAccount.id,
      toAccountId: gopayAccount.id,
      amount: 200000,
      currency: 'IDR',
      date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
      notes: 'Top up GoPay',
    },
  });

  console.log('✓ Created sample transfer');

  console.log('');
  console.log('✅ Database seeding completed!');
  console.log('');
  console.log('Demo Account:');
  console.log('Email: demo@example.com');
  console.log('Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

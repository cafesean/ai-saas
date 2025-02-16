import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const roles = await Promise.all([
    prisma.role.create({
      data: {
        name: 'Software Engineer',
        description: 'Develops software applications',
        role_code: 'SWE',
      },
    }),
    prisma.role.create({
      data: {
        name: 'Senior Software Engineer',
        description: 'Leads software development efforts',
        role_code: 'SR_SWE',
      },
    }),
    prisma.role.create({
      data: {
        name: 'Staff Software Engineer',
        description: 'Provides technical leadership and architecture',
        role_code: 'STAFF_SWE',
      },
    }),
  ]);

  // Create levels
  const levels = await Promise.all([
    prisma.level.create({
      data: {
        name: 'Level 1',
        description: 'Entry level position',
        code: 'L1',
      },
    }),
    prisma.level.create({
      data: {
        name: 'Level 2',
        description: 'Mid-level position',
        code: 'L2',
      },
    }),
    prisma.level.create({
      data: {
        name: 'Level 3',
        description: 'Senior level position',
        code: 'L3',
      },
    }),
  ]);

  // Create rate cards
  const rateCard = await prisma.ratecard.create({
    data: {
      name: '2024 Standard Rates',
      description: 'Standard rate card for 2024',
      effective_date: new Date('2024-01-01'),
      expire_date: new Date('2024-12-31'),
    },
  });

  // Associate roles with levels
  await Promise.all([
    // L1 - SWE
    prisma.level_role.create({
      data: {
        level_id: levels[0].id,
        role_id: roles[0].id,
      },
    }),
    // L2 - SWE, Sr SWE
    prisma.level_role.create({
      data: {
        level_id: levels[1].id,
        role_id: roles[0].id,
      },
    }),
    prisma.level_role.create({
      data: {
        level_id: levels[1].id,
        role_id: roles[1].id,
      },
    }),
    // L3 - Sr SWE, Staff SWE
    prisma.level_role.create({
      data: {
        level_id: levels[2].id,
        role_id: roles[1].id,
      },
    }),
    prisma.level_role.create({
      data: {
        level_id: levels[2].id,
        role_id: roles[2].id,
      },
    }),
  ]);

  // Set rates for each level
  await Promise.all([
    prisma.level_rate.create({
      data: {
        level_id: levels[0].id,
        ratecard_id: rateCard.id,
        monthly_rate: 8000,
      },
    }),
    prisma.level_rate.create({
      data: {
        level_id: levels[1].id,
        ratecard_id: rateCard.id,
        monthly_rate: 12000,
      },
    }),
    prisma.level_rate.create({
      data: {
        level_id: levels[2].id,
        ratecard_id: rateCard.id,
        monthly_rate: 16000,
      },
    }),
  ]);

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
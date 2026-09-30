/**
 * One-time admin promotion script.
 * Usage: npx tsx scripts/make-admin.ts your@email.com
 *
 * Run AFTER signing up through Clerk at /sign-up.
 * This finds your user by email and sets role to ADMIN.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Usage: npx tsx scripts/make-admin.ts your@email.com');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    console.error('   Make sure you have signed up at /sign-up first!');
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });

  console.log(`✅ Success! "${email}" is now an ADMIN.`);
  console.log('   Go to http://localhost:3000/admin');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

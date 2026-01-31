const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgres://dfe1f22114c37964c3bf08f829ee8555d874502c6d7d9322373cf1933c48ddd6:sk_mBkqwRWtcF7YE6xM5YO90@db.prisma.io:5432/postgres?sslmode=require"
    }
  }
});

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, username: true }
    });
    console.log('Users in database:');
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

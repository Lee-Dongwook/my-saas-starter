import "dotenv/config";

import { faker } from "@faker-js/faker";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type User } from "@prisma/client";
import { hash } from "bcryptjs";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// All seeded users share this password (credential provider, bcrypt-hashed to
// match the auth server's configured hasher).
const SEED_PASSWORD = "password123";

async function createUser(password: string) {
  const email = faker.internet.email().toLowerCase();
  const user = await prisma.user.create({
    data: {
      email,
      name: faker.person.fullName(),
      emailVerified: true,
    },
  });
  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password,
    },
  });
  return user;
}

async function main() {
  const password = await hash(SEED_PASSWORD, 12);

  const users: User[] = [];
  for (let i = 0; i < 10; i++) {
    users.push(await createUser(password));
  }

  // A demo organization so the multi-tenancy/RBAC surface has data to show.
  const org = await prisma.organization.create({
    data: {
      name: "Acme Inc",
      slug: "acme",
      members: {
        create: users.slice(0, 3).map((user, index) => ({
          userId: user.id,
          role: index === 0 ? "owner" : "member",
        })),
      },
    },
  });

  console.log(
    `Seeded ${users.length} users (password: "${SEED_PASSWORD}") and organization "${org.slug}".`,
  );
}

main()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

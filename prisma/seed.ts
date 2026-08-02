import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { Pool } from "pg";

interface CreateUserListProps {
  email?: string;
  password?: string;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "http://localhost:5432",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createUser({ email, password }: CreateUserListProps = {}) {
  try {
    const originPassword = password || faker.internet.password();
    const originEmail = email || faker.internet.email();
    const hashedPassword = await hash(originPassword, 12);

    const user = await prisma.user.create({
      data: {
        email: originEmail,
        name: faker.person.firstName(),
        password: hashedPassword,
        role: faker.helpers.arrayElement(["USER", "ADMIN"]),
      },
    });

    return { user, originPassword };
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Failed to create user: ${err.message}`);
    }
    throw new Error("Failed to create user due to an unknown error");
  }
}

async function createSeedUsers(count: number = 10) {
  const userPromises = Array.from({ length: count }, () => createUser());
  const results = await Promise.all(userPromises);

  console.log(`${results.length} seed users created successfully.`);
  return results;
}

async function main() {
  await createSeedUsers(10);
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

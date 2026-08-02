import "dotenv/config";

/** @type {import('@prisma/config').PrismaConfig} */
export default {
  datasource: {
    url: process.env.DATABASE_URL,
  },
};

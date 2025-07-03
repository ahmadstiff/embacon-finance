import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Disable prepared statements for better compatibility with PgBouncer
    // See: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#pgbouncer
    log: ['error', 'warn'],
  });

if (typeof window === 'undefined') {
  globalForPrisma.prisma = prisma;
}
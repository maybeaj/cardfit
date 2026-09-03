import 'server-only'
import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client 싱글턴. `server-only`라 클라이언트 컴포넌트에서 import하면 빌드가 깨진다 —
 * DB 자격증명이 브라우저 번들에 들어가는 경로를 컴파일 단계에서 막는다 (TEC-06 · NFR-005).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

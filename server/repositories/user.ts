import { prisma } from "@/lib/prisma";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        include: { tenant: true },
      },
    },
  });
}
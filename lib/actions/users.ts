// lib/actions/users.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function getTenantUsers(tenantId: string) {
  const users = await prisma.user.findMany({
    where: {
      memberships: { 
        some: { tenantId }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: 'asc' }
  });
  return users;
}
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Enforce tenant isolation at the database level.
 *
 */
export const getTenantPrisma = (tenantId: string) => {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const globalModels = ["Tenant", "User"];
          if (globalModels.includes(model)) {
            return query(args);
          }

          const mutableArgs = args as any;

          // READS / UPDATES / DELETES
          if (
            operation.startsWith("find") ||
            operation.startsWith("update") ||
            operation.startsWith("delete") ||
            operation === "count" ||
            operation === "aggregate"
          ) {
            mutableArgs.where = {
              ...(mutableArgs.where ?? {}),
              tenantId,
            };
          }

          // CREATE
          if (operation === "create") {
            mutableArgs.data = {
              ...(mutableArgs.data ?? {}),
              tenantId,
            };
          }

          // CREATE MANY
          if (operation === "createMany") {
            if (Array.isArray(mutableArgs.data)) {
              mutableArgs.data = mutableArgs.data.map((d: any) => ({
                ...d,
                tenantId,
              }));
            } else if (mutableArgs.data) {
              mutableArgs.data.tenantId = tenantId;
            }
          }

          // UPSERT
          if (operation === "upsert") {
            mutableArgs.where = {
              ...(mutableArgs.where ?? {}),
              tenantId,
            };
            mutableArgs.create = {
              ...(mutableArgs.create ?? {}),
              tenantId,
            };
            mutableArgs.update = {
              ...(mutableArgs.update ?? {}),
              tenantId,
            };
          }

          return query(mutableArgs);
        },
      },
    },
  });
};



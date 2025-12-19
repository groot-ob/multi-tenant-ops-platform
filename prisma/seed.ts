import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient, Role } from "@prisma/client";
// import pg from "pg";
// const pool = new pg.Pool({ 
//   connectionString: process.env.DATABASE_URL 
// });

// // 2. Initialize the Prisma Adapter with that pool
// const adapter = new PrismaPg(pool);
// const prisma = new PrismaClient({adapter});

// async function main() {
//  // 1. Use UPSERT instead of CREATE for Tenants
//   const acme = await prisma.tenant.upsert({
//     where: { slug: "acme" },
//     update: {}, // Do nothing if it already exists
//     create: {
//       name: "Acme Corp",
//       slug: "acme",
//     },
//   });

//   const globex = await prisma.tenant.upsert({
//     where: { slug: "globex" },
//     update: {},
//     create: {
//       name: "Globex Corp",
//       slug: "globex",
//     },
//   });

//   // 2. Use UPSERT for User
//   const onchari = await prisma.user.upsert({
//     where: { email: "brianonchari28@gmail.com" },
//     update: {},
//     create: {
//       email: "brianonchari28@gmail.com",
//       name: "Brian Onchari",
//     },
//   });
//   const alice = await prisma.user.upsert({
//     where:{email:"alice@example.com"},
//      update: {},
//     create: { email: "alice@example.com", name: "Alice" },
//   });

//   const bob = await prisma.user.upsert({
//    where:{email:"bob@example.com"},
//      update: {},
//     create: { email: "bob@example.com", name: "Bob" },
//   });
  



//  // prisma/seed.ts

// // Replace createMany with this:
// const memberships = [
//   { userId: onchari.id, tenantId: acme.id, role: Role.admin },
//   { userId: bob.id, tenantId: globex.id, role: Role.engineer },
// ];

// for (const m of memberships) {
//   await prisma.membership.upsert({
//     where: {
//       userId_tenantId: { // This uses the composite unique key from your schema
//         userId: m.userId,
//         tenantId: m.tenantId,
//       },
//     },
//     update: { role: m.role }, // Update the role if they are already a member
//     create: m,
//   });
// }
//   // Add this to your main() function in prisma/seed.ts

// // 1. Create an incident for Acme
// await prisma.incident.create({
//   data: {
//     title: "Database latency in production",
//     severity: "SEV2",
//     status: "OPEN",
//     service: "Postgres-Main",
//     environment: "prod",
//     tenantId: acme.id, // Linked to Acme
//     createdById: onchari.id,
//     tags: ["database", "critical"]
//   }
// });

// await prisma.incident.create({
//   data: {
//     title: "Time outs",
//     severity: "SEV1",
//     status: "OPEN",
//     service: "Postgres-Main",
//     environment: "prod",
//     tenantId: acme.id, // Linked to Acme
//     createdById: onchari.id,
//     tags: ["database", "critical"]
//   }
// });

// // 2. Create an incident for Globex
// await prisma.incident.create({
//   data: {
//     title: "Frontend build failing",
//     severity: "SEV3",
//     status: "OPEN",
//     service: "Web-App",
//     environment: "staging",
//     tenantId: globex.id, // Linked to Globex
//     createdById: onchari.id,
//     tags: ["ui"]
//   }
// });
// }

// main().finally(() => prisma.$disconnect());

import { PrismaClient, Severity, Status } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {

  const acme = await prisma.tenant.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: { name: 'Acme Corp', slug: 'acme-corp' },
  });

  const globex = await prisma.tenant.upsert({
    where: { slug: 'globex' },
    update: {},
    create: { name: 'Globex Corp', slug: 'globex' },
  });

  // 2. Create Users 
  const admin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: { email: 'admin@acme.com', name: 'Admin User' },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'engineer@ops.com' },
    update: {},
    create: { email: 'engineer@ops.com', name: 'Lead Engineer' },
  });

   const onchari = await prisma.user.upsert({
    where: { email: 'brianonchari28@gmail.com' },
    update: {},
    create: { email: 'brianonchari28@gmail.com', name: 'Brian Onchari' },
  });

  await prisma.membership.deleteMany({});

  await prisma.membership.createMany({
    data: [
      { userId: admin.id, tenantId: acme.id, role: 'admin' },
      { userId: user2.id, tenantId: acme.id, role: 'engineer' },
      { userId: user2.id, tenantId: globex.id, role: 'admin' },
      { userId: onchari.id, tenantId: globex.id, role: 'engineer' },
      { userId: onchari.id, tenantId: acme.id, role: 'admin' }
    ],
  });

  const severities: Severity[] = ['SEV1', 'SEV2', 'SEV3', 'SEV4'];
  const statuses: Status[] = ['OPEN', 'MITIGATED', 'RESOLVED'];

  // Instead of .create, use .upsert or check for existence
for (let i = 1; i <= 45; i++) {
  const incidentId = `incident-seed-${i}`;
  
  // Pick random values from your arrays
  const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  await prisma.incident.upsert({
    where: { 
      id: incidentId 
    },
    update: {}, 
    create: {
      id: incidentId,
      title: `Incident ${i}`,
      severity: randomSeverity, // Uses your Severity array
      status: randomStatus,     // Uses your Status array
      service: 'api-gateway', 
      environment: 'production',
      tenantId: acme.id,
      createdById: onchari.id,    // Use the User ID (e.g., admin) created earlier
    },
  });
}


  for (let i = 1; i <= 12; i++) {
  const flagKey = `feature-alpha-${i}`;
  
  await prisma.featureFlag.upsert({
    where: {
      tenantId_key_environment: {
        tenantId: acme.id,
        key: flagKey,
        environment: 'production',
      },
    },
    update: {},
    create: {
      key: flagKey,
      enabled: Math.random() > 0.5,
      rules: { plan: 'enterprise' },
      tenantId: acme.id,
      environment: 'production',
    },
  });
}

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

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

  const brian = await prisma.user.upsert({
    where: { email: 'oncharibrian@gmail.com' },
    update: {},
    create: { email: 'oncharibrian@gmail.com.com', name: 'Onchari' },
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
      { userId: brian.id, tenantId: acme.id, role: 'engineer' },
      { userId: brian.id, tenantId: globex.id, role: 'admin' },
      { userId: onchari.id, tenantId: globex.id, role: 'engineer' },
      { userId: onchari.id, tenantId: acme.id, role: 'admin' }
    ],
  });

  const severities: Severity[] = ['SEV1', 'SEV2', 'SEV3', 'SEV4'];
  const statuses: Status[] = ['OPEN', 'MITIGATED', 'RESOLVED'];


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
      severity: randomSeverity,
      status: randomStatus,  
      service: 'api-gateway', 
      environment: 'production',
      tenantId: acme.id,
      createdById: brian.id, 
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
      rules: { type: 'enterprise' },
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

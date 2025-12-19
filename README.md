# Multi-Tenant Incident Management Platform

A high-performance, containerized incident management system built with Next.js 15, Prisma, PostgreSQL, and Redis. This platform is designed to handle multiple organizations (tenants) securely while maintaining high speed through an advanced caching layer.

## 🚀 Getting Started (Docker)

The entire stack is containerized. You do not need to install PostgreSQL or Redis locally on your machine.

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:groot-ob/multi-tenant-ops-platform.git
    cd my-app
    ```

2.  **Setup Environment Variables:**
    ```bash
    cp .env.example .env
    ```
    *Note: Ensure `DATABASE_URL` and `REDIS_URL` point to the internal Docker service names (`db` and `cache`).*

3.  **Launch the Platform:**
    ```bash
    docker-compose up --build
    ```
    **This command automatically:**
    * Installs all dependencies (including `ioredis`).
    * Synchronizes the Prisma schema with the database.
    * Seeds the database with **45+ incidents**, cross-tenant memberships, and feature flags.
    * Starts the Next.js development server.

4.  **Access the App:**
    Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture & Tenant Enforcement

### Multi-Tenancy Strategy
We use a **Shared Database, Shared Schema** approach with a `tenantId` discriminator. This allows for rapid scaling and simplified maintenance.

* **Logic Isolation**: Data is partitioned at the database level. Every query is scoped via a `tenantId` filter.
* **Tenant Enforcement**: A custom Prisma helper `getTenantPrisma(tenantId)` ensures that users cannot accidentally query data belonging to another organization.
* **Cross-Tenant Membership**: The system supports users belonging to multiple tenants (e.g., a Consultant working for both Acme and Globex) with unique roles in each.



## ⚡ Caching & Invalidation Strategy

To satisfy Requirement 5 (Performance), we implemented a **Cache-Aside** pattern using **Redis**.

* **The Strategy**: We don't just cache the whole table; we cache specific query results. We generate a unique cache key by hashing the tenant ID combined with search filters, severity levels, and pagination cursors.
* **Invalidation**: We utilize **Atomic Purging**. Whenever an incident is created or updated, the system identifies all cache keys associated with that specific tenant and purges them instantly, ensuring users never see stale data while maintaining sub-10ms response times for reads.



## 🚧 Features Currently in Development

I have prioritized the core foundation (Multi-tenancy, Database, and Caching). The following sections are in progress as they require more complex setup:

### 1. Advanced Feature Flags
* **Status**: The database is ready. The logic to decide who sees which feature is being built.
* **Why it's in progress**: To capture all the requirements well and make sure that  user always sees the same feature version (like a 50% rollout) without the system having to "remember" every choice."

### 2. Realtime Updates & Background Jobs
* **Status**: Infrastructure is ready. The "Live" connection is being built.
* **Why it's in progress**: 
    * **Realtime**: Setting up a system so that when one person updates an incident, everyone else sees it change instantly without refreshing.
    * **Jobs**: We are building a "waiting room" (Job Queue) for tasks like virus scanning files. This ensures if the app crashes, the scan isn't lost.
* **Needs**: `BullMQ` for managing the list of jobs.



### 3. Security & Activity Logs (Audit Logs)
* **Status**: Basic security is done. Detailed history logs are being built.
* **Why it's in progress**: We need to record exactly what changed (for example: "Status changed from OPEN to CLOSED"). Doing this for every single click without slowing down the website takes careful coding.

### 4. Automated Testing
* **Status**: Manual testing is finished. Automated "Robot" tests are being written.
* **Why it's in progress**: We are writing scripts that act like users to make sure that a user from "Company A" can never, under any circumstances, see data from "Company B."
* **Needs**: `Jest` and `Playwright` for testing.

---
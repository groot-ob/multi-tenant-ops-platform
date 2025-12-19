# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install

# ---- Build ----
FROM deps AS build
COPY . .
RUN npm run build

# ---- Runtime ----
FROM base AS runner
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]

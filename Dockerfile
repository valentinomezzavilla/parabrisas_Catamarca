FROM node:24-slim

WORKDIR /app

# Se instala todo (con devDependencies): hacen falta para compilar, migrar y correr el seed.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# prisma.config.ts exige DATABASE_URL aunque `prisma generate` no se conecte: valor ficticio solo para el build.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Las migraciones se aplican al arrancar; el seed se corre a mano una vez (ver docs/COOLIFY.md).
CMD ["sh", "-c", "npx prisma migrate deploy && exec node --enable-source-maps dist/server.js"]

import { PrismaClient } from "@prisma/client";

// Declarando o tipo global para o PrismaClient
declare global {
  var prisma: PrismaClient | undefined;
}

// Exportando uma instância única do PrismaClient para evitar múltiplas conexões em desenvolvimento
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Adicionar export default para compatibilidade com importações existentes
export default prisma;

// Definindo a variável global apenas em ambiente que não for produção
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

let runtimeMigrationsStarted = false;
async function ensureRuntimeMigrations(): Promise<void> {
  if (runtimeMigrationsStarted) return;
  runtimeMigrationsStarted = true;
  try {
    await prisma.$executeRaw`ALTER TABLE todos ADD COLUMN IF NOT EXISTS external_links JSONB;`;
  } catch {}
  try {
    await prisma.$executeRaw`ALTER TABLE todos ADD COLUMN IF NOT EXISTS kanban_column VARCHAR(20);`;
  } catch {}
  try {
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_todos_kanban_column ON todos(kanban_column);`;
  } catch {}
  try {
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS user_integrations (
         id SERIAL PRIMARY KEY,
         user_id INTEGER UNIQUE NOT NULL,
         github_pat VARCHAR(255),
         jira_token VARCHAR(255),
         jira_domain VARCHAR(255),
         asana_pat VARCHAR(255),
         created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
         updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
       );`
    );
  } catch {}
  try {
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "snippets" (
         "id" SERIAL PRIMARY KEY,
         "user_id" INTEGER NOT NULL,
         "title" VARCHAR(255) NOT NULL,
         "content" TEXT NOT NULL,
         "language" VARCHAR(50),
         "project_id" INTEGER,
         "tags" JSONB,
         "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
         "updated_at" TIMESTAMPTZ(6)
       );`
    );
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_snippets_user_id ON snippets(user_id);`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_snippets_project_id ON snippets(project_id);`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_snippets_language ON snippets(language);`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_snippets_created_at ON snippets(created_at DESC);`;
  } catch {}
}

void ensureRuntimeMigrations();

-- CreateTable
CREATE TABLE "kanban_columns" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "color" VARCHAR(7),
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kanban_columns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_kanban_columns_user_id" ON "kanban_columns"("user_id");

-- CreateIndex
CREATE INDEX "idx_kanban_columns_order" ON "kanban_columns"("user_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "idx_kanban_columns_user_title" ON "kanban_columns"("user_id", "title");

-- AddForeignKey
ALTER TABLE "kanban_columns" ADD CONSTRAINT "kanban_columns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Insert default columns for existing users
INSERT INTO "kanban_columns" ("id", "user_id", "title", "color", "order", "is_default")
SELECT 
  'backlog-' || u.id::text, u.id, 'BACKLOG', '#6B7280', 0, true
FROM "users" u
WHERE NOT EXISTS (
  SELECT 1 FROM "kanban_columns" kc WHERE kc.user_id = u.id AND kc.title = 'BACKLOG'
);

INSERT INTO "kanban_columns" ("id", "user_id", "title", "color", "order", "is_default")
SELECT 
  'planning-' || u.id::text, u.id, 'PLANNING', '#3B82F6', 1, true
FROM "users" u
WHERE NOT EXISTS (
  SELECT 1 FROM "kanban_columns" kc WHERE kc.user_id = u.id AND kc.title = 'PLANNING'
);

INSERT INTO "kanban_columns" ("id", "user_id", "title", "color", "order", "is_default")
SELECT 
  'in-progress-' || u.id::text, u.id, 'IN PROGRESS', '#F59E0B', 2, true
FROM "users" u
WHERE NOT EXISTS (
  SELECT 1 FROM "kanban_columns" kc WHERE kc.user_id = u.id AND kc.title = 'IN PROGRESS'
);

INSERT INTO "kanban_columns" ("id", "user_id", "title", "color", "order", "is_default")
SELECT 
  'completed-' || u.id::text, u.id, 'COMPLETED', '#10B981', 3, true
FROM "users" u
WHERE NOT EXISTS (
  SELECT 1 FROM "kanban_columns" kc WHERE kc.user_id = u.id AND kc.title = 'COMPLETED'
);
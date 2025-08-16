-- AlterTable
ALTER TABLE "users" ADD COLUMN     "trial_expired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trial_start_date" TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "kanban_columns" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "color" VARCHAR(20),
    "order" INTEGER NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kanban_columns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_kanban_columns_user_id" ON "kanban_columns"("user_id");

-- CreateIndex
CREATE INDEX "idx_kanban_columns_user_order" ON "kanban_columns"("user_id", "order");

-- AddForeignKey
ALTER TABLE "kanban_columns" ADD CONSTRAINT "kanban_columns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

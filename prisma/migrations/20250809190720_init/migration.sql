-- CreateTable
CREATE TABLE "snippets" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "language" VARCHAR(50),
    "project_id" INTEGER,
    "tags" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "snippets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_snippets_user_id" ON "snippets"("user_id");

-- CreateIndex
CREATE INDEX "idx_snippets_project_id" ON "snippets"("project_id");

-- CreateIndex
CREATE INDEX "idx_snippets_language" ON "snippets"("language");

-- CreateIndex
CREATE INDEX "idx_snippets_created_at" ON "snippets"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "snippets" ADD CONSTRAINT "snippets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

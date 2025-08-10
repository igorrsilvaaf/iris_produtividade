-- AlterTable
ALTER TABLE "todos" ADD COLUMN     "external_links" JSONB;

-- CreateTable
CREATE TABLE "user_integrations" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "github_pat" TEXT,
    "jira_token" TEXT,
    "jira_domain" TEXT,
    "asana_pat" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "severity" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_comments" (
    "id" SERIAL NOT NULL,
    "feedback_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_votes" (
    "id" SERIAL NOT NULL,
    "feedback_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_integrations_user_id_key" ON "user_integrations"("user_id");

-- CreateIndex
CREATE INDEX "idx_feedback_user_id" ON "feedback"("user_id");

-- CreateIndex
CREATE INDEX "idx_feedback_status" ON "feedback"("status");

-- CreateIndex
CREATE INDEX "idx_feedback_created_at" ON "feedback"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_feedback_comments_feedback_id" ON "feedback_comments"("feedback_id");

-- CreateIndex
CREATE INDEX "idx_feedback_comments_user_id" ON "feedback_comments"("user_id");

-- CreateIndex
CREATE INDEX "idx_feedback_votes_feedback_id" ON "feedback_votes"("feedback_id");

-- CreateIndex
CREATE INDEX "idx_feedback_votes_user_id" ON "feedback_votes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_feedback_vote" ON "feedback_votes"("feedback_id", "user_id");

-- AddForeignKey
ALTER TABLE "user_integrations" ADD CONSTRAINT "user_integrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedback_comments" ADD CONSTRAINT "feedback_comments_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedback_comments" ADD CONSTRAINT "feedback_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedback_votes" ADD CONSTRAINT "feedback_votes_feedback_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedback"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedback_votes" ADD CONSTRAINT "feedback_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AlterTable
ALTER TABLE "task_comments" ADD COLUMN     "parent_id" INTEGER;

-- CreateIndex
CREATE INDEX "idx_task_comments_parent_id" ON "task_comments"("parent_id");

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "task_comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

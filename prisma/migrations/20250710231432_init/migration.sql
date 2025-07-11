-- CreateTable
CREATE TABLE "labels" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "color" VARCHAR(50) DEFAULT '#808080',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pomodoroLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" INTEGER,
    "duration" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PomodoroLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "color" VARCHAR(50) DEFAULT '#808080',
    "is_favorite" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "session_token" VARCHAR(255) NOT NULL,
    "expires" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_notifications_read" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "last_read_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_notifications_read_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_comments" (
    "id" SERIAL NOT NULL,
    "task_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todo_labels" (
    "todo_id" INTEGER NOT NULL,
    "label_id" INTEGER NOT NULL,

    CONSTRAINT "todo_labels_pkey" PRIMARY KEY ("todo_id","label_id")
);

-- CreateTable
CREATE TABLE "todo_projects" (
    "todo_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,

    CONSTRAINT "todo_projects_pkey" PRIMARY KEY ("todo_id","project_id")
);

-- CreateTable
CREATE TABLE "todos" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMPTZ(6),
    "priority" INTEGER DEFAULT 4,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "kanban_column" VARCHAR(20),
    "points" INTEGER DEFAULT 3,
    "attachments" JSONB DEFAULT '[]',
    "estimated_time" INTEGER,
    "kanban_order" INTEGER,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "user_id" INTEGER NOT NULL,
    "theme" VARCHAR(20) DEFAULT 'light',
    "pomodoro_work_minutes" INTEGER DEFAULT 25,
    "pomodoro_break_minutes" INTEGER DEFAULT 5,
    "pomodoro_long_break_minutes" INTEGER DEFAULT 15,
    "pomodoro_cycles" INTEGER DEFAULT 4,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "enable_sound" BOOLEAN DEFAULT true,
    "notification_sound" VARCHAR(50) DEFAULT 'default',
    "enable_desktop_notifications" BOOLEAN DEFAULT true,
    "language" VARCHAR(10) DEFAULT 'en',
    "enable_task_notifications" BOOLEAN NOT NULL DEFAULT true,
    "task_notification_days" INTEGER NOT NULL DEFAULT 3,
    "pomodoro_sound" VARCHAR(50) NOT NULL DEFAULT 'pomodoro',
    "spotify_playlist_url" TEXT,
    "enable_flip_clock" BOOLEAN NOT NULL DEFAULT true,
    "flip_clock_size" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "flip_clock_color" VARCHAR(20) NOT NULL DEFAULT '#ff5722',
    "enable_spotify" BOOLEAN NOT NULL DEFAULT true,
    "spotifyEnabled" BOOLEAN DEFAULT false,
    "spotifyPlaylistUrl" TEXT,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "avatar_url" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "entity_type" VARCHAR(20) NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "alt_text" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "idx_password_reset_tokens_token" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "idx_password_reset_tokens_user_id" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "PomodoroLog_taskId_idx" ON "pomodoroLog"("taskId");

-- CreateIndex
CREATE INDEX "PomodoroLog_userId_idx" ON "pomodoroLog"("userId");

-- CreateIndex
CREATE INDEX "idx_projects_user_id" ON "projects"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE INDEX "idx_task_comments_task_id" ON "task_comments"("task_id");

-- CreateIndex
CREATE INDEX "idx_task_comments_user_id" ON "task_comments"("user_id");

-- CreateIndex
CREATE INDEX "idx_todo_projects_todo_id" ON "todo_projects"("todo_id");

-- CreateIndex
CREATE INDEX "idx_todos_estimated_time" ON "todos"("estimated_time");

-- CreateIndex
CREATE INDEX "idx_todos_kanban_column" ON "todos"("kanban_column");

-- CreateIndex
CREATE INDEX "idx_todos_points" ON "todos"("points");

-- CreateIndex
CREATE INDEX "idx_todos_user_id" ON "todos"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_attachments_created_at" ON "attachments"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_attachments_entity" ON "attachments"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_attachments_file_size" ON "attachments"("file_size");

-- CreateIndex
CREATE INDEX "idx_attachments_mime_type" ON "attachments"("mime_type");

-- CreateIndex
CREATE INDEX "idx_attachments_user_id" ON "attachments"("user_id");

-- AddForeignKey
ALTER TABLE "labels" ADD CONSTRAINT "labels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_notifications_read" ADD CONSTRAINT "task_notifications_read_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "todos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "todo_labels" ADD CONSTRAINT "todo_labels_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "labels"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "todo_labels" ADD CONSTRAINT "todo_labels_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "todos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "todo_projects" ADD CONSTRAINT "todo_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "todo_projects" ADD CONSTRAINT "todo_projects_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "todos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "fk_attachments_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

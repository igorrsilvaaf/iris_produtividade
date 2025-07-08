-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.attachments (
  id integer NOT NULL DEFAULT nextval('attachments_id_seq'::regclass),
  user_id integer NOT NULL,
  entity_type character varying NOT NULL,
  entity_id integer NOT NULL,
  file_name character varying NOT NULL,
  original_name character varying NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type character varying NOT NULL,
  alt_text text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT attachments_pkey PRIMARY KEY (id),
  CONSTRAINT fk_attachments_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.labels (
  id integer NOT NULL DEFAULT nextval('labels_id_seq'::regclass),
  user_id integer NOT NULL,
  name character varying NOT NULL,
  color character varying DEFAULT '#808080'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT labels_pkey PRIMARY KEY (id),
  CONSTRAINT labels_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  id integer NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
  user_id integer NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.password_reset_tokens (
  id integer NOT NULL DEFAULT nextval('password_reset_tokens_id_seq'::regclass),
  user_id integer NOT NULL,
  token character varying NOT NULL,
  expires timestamp without time zone NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.pomodoroLog (
  id text NOT NULL,
  userId text NOT NULL,
  taskId integer,
  duration integer NOT NULL,
  mode text NOT NULL,
  startedAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completedAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pomodoroLog_pkey PRIMARY KEY (id)
);
CREATE TABLE public.projects (
  id integer NOT NULL DEFAULT nextval('projects_id_seq'::regclass),
  user_id integer NOT NULL,
  name character varying NOT NULL,
  color character varying DEFAULT '#808080'::character varying,
  is_favorite boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.sessions (
  id integer NOT NULL DEFAULT nextval('sessions_id_seq'::regclass),
  user_id integer NOT NULL,
  session_token character varying NOT NULL,
  expires timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.task_comments (
  id integer NOT NULL DEFAULT nextval('task_comments_id_seq'::regclass),
  task_id integer NOT NULL,
  user_id integer NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT task_comments_pkey PRIMARY KEY (id),
  CONSTRAINT task_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.todos(id)
);
CREATE TABLE public.task_notifications_read (
  id integer NOT NULL DEFAULT nextval('task_notifications_read_id_seq'::regclass),
  user_id integer NOT NULL,
  last_read_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT task_notifications_read_pkey PRIMARY KEY (id),
  CONSTRAINT task_notifications_read_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.todo_labels (
  todo_id integer NOT NULL,
  label_id integer NOT NULL,
  CONSTRAINT todo_labels_pkey PRIMARY KEY (todo_id, label_id),
  CONSTRAINT todo_labels_todo_id_fkey FOREIGN KEY (todo_id) REFERENCES public.todos(id),
  CONSTRAINT todo_labels_label_id_fkey FOREIGN KEY (label_id) REFERENCES public.labels(id)
);
CREATE TABLE public.todo_projects (
  todo_id integer NOT NULL,
  project_id integer NOT NULL,
  CONSTRAINT todo_projects_pkey PRIMARY KEY (todo_id, project_id),
  CONSTRAINT todo_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT todo_projects_todo_id_fkey FOREIGN KEY (todo_id) REFERENCES public.todos(id)
);
CREATE TABLE public.todos (
  id integer NOT NULL DEFAULT nextval('todos_id_seq'::regclass),
  user_id integer NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone,
  priority integer DEFAULT 4,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone,
  kanban_column character varying,
  points integer DEFAULT 3,
  attachments jsonb DEFAULT '[]'::jsonb,
  estimated_time integer,
  kanban_order integer,
  CONSTRAINT todos_pkey PRIMARY KEY (id),
  CONSTRAINT todos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.user_settings (
  user_id integer NOT NULL,
  theme character varying DEFAULT 'light'::character varying,
  pomodoro_work_minutes integer DEFAULT 25,
  pomodoro_break_minutes integer DEFAULT 5,
  pomodoro_long_break_minutes integer DEFAULT 15,
  pomodoro_cycles integer DEFAULT 4,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone,
  enable_sound boolean DEFAULT true,
  notification_sound character varying DEFAULT 'default'::character varying,
  enable_desktop_notifications boolean DEFAULT true,
  language character varying DEFAULT 'en'::character varying,
  enable_task_notifications boolean NOT NULL DEFAULT true,
  task_notification_days integer NOT NULL DEFAULT 3,
  pomodoro_sound character varying NOT NULL DEFAULT 'pomodoro'::character varying,
  spotify_playlist_url text,
  enable_flip_clock boolean NOT NULL DEFAULT true,
  flip_clock_size character varying NOT NULL DEFAULT 'medium'::character varying,
  flip_clock_color character varying NOT NULL DEFAULT '#ff5722'::character varying,
  enable_spotify boolean NOT NULL DEFAULT true,
  spotifyEnabled boolean DEFAULT false,
  spotifyPlaylistUrl text,
  CONSTRAINT user_settings_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  name character varying,
  email character varying NOT NULL,
  password character varying NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone,
  avatar_url text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
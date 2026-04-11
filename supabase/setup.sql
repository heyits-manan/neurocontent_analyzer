-- ============================================================
-- NeuroContent Analyzer — Supabase Setup
-- Run this SQL in the Supabase SQL Editor (or via psql).
-- ============================================================

-- 1. Enable the moddatetime extension for auto-updating updated_at
create extension if not exists moddatetime schema extensions;

-- 2. Create the jobs table
create table if not exists public.jobs (
  id              uuid        primary key default gen_random_uuid(),
  status          text        not null default 'uploaded',
  video_storage_path text     not null,
  audio_storage_path text     null,
  original_name   text        not null,
  mime_type       text        not null,
  size_bytes      bigint      not null,
  transcript_json jsonb       null,
  results_json    jsonb       null,
  error           text        null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  processed_at    timestamptz null,

  constraint jobs_status_check check (
    status in ('uploaded', 'queued', 'processing', 'completed', 'failed')
  )
);

-- 3. Indexes
create index if not exists idx_jobs_status     on public.jobs (status);
create index if not exists idx_jobs_created_at on public.jobs (created_at);

-- 4. Auto-update updated_at on every row modification
create or replace trigger handle_updated_at
  before update on public.jobs
  for each row
  execute function moddatetime(updated_at);

-- 5. Enable Row Level Security (service-role key bypasses RLS)
alter table public.jobs enable row level security;

-- ============================================================
-- Storage buckets (create via Supabase Dashboard or Management API)
--
--   Bucket: videos    — private — holds uploaded source videos
--   Bucket: artifacts — private — holds generated audio & other outputs
--
-- These cannot be created via SQL. Use the Supabase Dashboard:
--   Storage → New Bucket → Name: videos   → Public: OFF
--   Storage → New Bucket → Name: artifacts → Public: OFF
-- ============================================================

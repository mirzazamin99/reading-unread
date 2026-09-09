-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Adds the schema for the automated life-assessment + coaching-modules
-- system: who signed up, their six assessment answers, the five modules'
-- editable text, who was routed to which module, and their reflection
-- responses per module step. This does not touch the older
-- submissions/days/plots/revisions tables from the previous operator-review
-- flow -- they are left in place, just unused by the app going forward.

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

alter table users enable row level security;

create table if not exists assessment_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  question_id text not null,
  answer_text text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists assessment_answers_user_question_idx
  on assessment_answers (user_id, question_id);

alter table assessment_answers enable row level security;

-- Dr. Aamir's editable content for each of the five modules, edited from
-- the admin screen. Seeded below with empty placeholder text.
create table if not exists module_content (
  module_id text primary key,
  name text not null,
  intro text not null default '',
  core_lesson text not null default '',
  reflection_prompt text not null default '',
  micro_action text not null default '',
  check_in_question text not null default '',
  check_in_delay_days integer not null default 3,
  updated_at timestamptz not null default now()
);

alter table module_content enable row level security;

insert into module_content (module_id, name)
values
  ('confidence_selfworth', 'Confidence & Self-Worth'),
  ('speaking_communication', 'Speaking & Communication'),
  ('discipline_habits', 'Discipline & Habits'),
  ('purpose_direction', 'Purpose & Direction'),
  ('decision_making_fear', 'Decision-Making & Fear')
on conflict (module_id) do nothing;

create table if not exists module_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  module_id text not null references module_content (module_id),
  status text not null default 'assigned' check (status in ('assigned', 'in_progress', 'completed')),
  assigned_at timestamptz not null default now()
);

create unique index if not exists module_assignments_user_module_idx
  on module_assignments (user_id, module_id);

alter table module_assignments enable row level security;

create table if not exists reflection_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  module_id text not null references module_content (module_id),
  step text not null check (step in ('reflection_prompt', 'micro_action', 'check_in')),
  response_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists reflection_responses_user_module_step_idx
  on reflection_responses (user_id, module_id, step);

alter table reflection_responses enable row level security;

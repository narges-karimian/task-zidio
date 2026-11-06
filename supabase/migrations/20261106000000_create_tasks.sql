-- Personal tasks for the Taskzidio MVP.
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'TODO',
  priority text not null default 'Medium',
  due_date date,
  estimate_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tasks_title_not_blank check (title ~ '[^[:space:]]'),
  constraint tasks_status_valid check (
    status in ('TODO', 'In Progress', 'Review', 'Done')
  ),
  constraint tasks_priority_valid check (
    priority in ('Low', 'Medium', 'High')
  ),
  constraint tasks_estimate_minutes_positive check (
    estimate_minutes is null or estimate_minutes > 0
  ),
  constraint tasks_due_or_estimate_required check (
    due_date is not null or estimate_minutes is not null
  )
);

create index tasks_user_created_at_idx
  on public.tasks (user_id, created_at desc);

create index tasks_user_due_date_idx
  on public.tasks (user_id, due_date);

create function public.set_tasks_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_tasks_updated_at();

-- The browser can change only task content. Owner, ID and timestamps come
-- from database defaults or the update trigger.
revoke all on public.tasks from public, anon, authenticated;
grant select, delete on public.tasks to authenticated;
grant insert (title, description, status, priority, due_date, estimate_minutes)
  on public.tasks to authenticated;
grant update (title, description, status, priority, due_date, estimate_minutes)
  on public.tasks to authenticated;

revoke execute on function public.set_tasks_updated_at()
  from public, anon, authenticated;

alter table public.tasks enable row level security;

create policy tasks_select_own
on public.tasks for select to authenticated
using ((select auth.uid()) = user_id);

create policy tasks_insert_own
on public.tasks for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy tasks_update_own
on public.tasks for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy tasks_delete_own
on public.tasks for delete to authenticated
using ((select auth.uid()) = user_id);

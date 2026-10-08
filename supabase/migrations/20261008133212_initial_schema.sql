-- SRS 8 / DATA_SECURITY.md. Initial schema only; no sample data or secrets.
begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  tone text not null default 'blago' check (tone in ('blago','sarkasticno','brutalno')),
  language text not null default 'hr' check (language in ('hr','en')),
  avatar_config jsonb not null default '{}'::jsonb check (jsonb_typeof(avatar_config) = 'object'),
  hp integer not null default 0 check (hp between 0 and 99),
  map_index integer not null default 1 check (map_index >= 1),
  presence integer not null default 60 check (presence between 0 and 100),
  streak_days integer not null default 0 check (streak_days >= 0),
  last_completed_date date,
  friend_code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),
  created_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  file_hash text not null check (file_hash ~ '^[a-f0-9]{64}$'),
  mime_type text not null check (mime_type in ('image/jpeg','image/png','application/pdf')),
  category text not null default 'ostalo' check (category in (
    'zdravstvo','racuni','ugovori','vozilo','osobni_dokumenti',
    'skola_vrtic','karte_dogadaji','bonovi','ostalo'
  )),
  title text not null check (char_length(title) between 1 and 300),
  document_date timestamptz,
  expiry_date timestamptz,
  extracted jsonb not null default '{}'::jsonb check (jsonb_typeof(extracted) = 'object'),
  is_proof boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, id),
  unique(user_id, file_hash),
  unique(storage_path),
  check (split_part(storage_path,'/',1) = user_id::text),
  check (storage_path ~ ('^' || user_id::text || '/' || id::text || '\.(jpg|jpeg|png|pdf)$'))
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid,
  kind text not null check (kind in ('event','deadline')),
  title text not null check (char_length(title) between 1 and 300),
  tier smallint not null check (tier between 1 and 5),
  source text not null check (source in ('document','chat')),
  start_at timestamptz,
  remind_at timestamptz,
  due_date timestamptz,
  recurrence text not null default 'none' check (recurrence in ('none','monthly','yearly')),
  status text not null default 'open' check (status in ('open','done','missed')),
  completed_at timestamptz,
  proof_document_id uuid,
  proof_reason text,
  penalty_applied boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, id),
  foreign key (user_id,document_id) references public.documents(user_id,id) on delete set null (document_id),
  foreign key (user_id,proof_document_id) references public.documents(user_id,id) on delete set null (proof_document_id),
  check ((kind = 'event' and start_at is not null) or (kind = 'deadline' and due_date is not null)),
  check ((status = 'done') = (completed_at is not null))
);

create table public.hp_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid,
  document_id uuid,
  amount integer not null check (amount >= 0),
  reason text not null,
  created_at timestamptz not null default now(),
  foreign key (user_id,task_id) references public.tasks(user_id,id) on delete set null (task_id),
  foreign key (user_id,document_id) references public.documents(user_id,id) on delete set null (document_id)
);
create unique index hp_task_award_once on public.hp_ledger(user_id,task_id,reason) where task_id is not null;
create unique index hp_document_award_once on public.hp_ledger(user_id,document_id,reason) where document_id is not null;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid,
  template_key text not null,
  text text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  pushed_at timestamptz,
  foreign key (user_id,task_id) references public.tasks(user_id,id) on delete cascade
);
create unique index notification_once_per_zagreb_day on public.notifications (
  user_id, coalesce(task_id,'00000000-0000-0000-0000-000000000000'::uuid),
  template_key, ((created_at at time zone 'Europe/Zagreb')::date)
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique check (endpoint like 'https://%'),
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null check (char_length(content) between 1 and 20000),
  created_at timestamptz not null default now()
);
-- Reserved schema from SRS 8.1. No client policies or features until F16 activation.
create table public.friendships (
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,friend_id),
  check (user_id <> friend_id)
);

create index documents_owner_created on public.documents(user_id,created_at desc);
create index tasks_owner_due on public.tasks(user_id,due_date) where status <> 'done';
create index tasks_owner_start on public.tasks(user_id,start_at);
create index ledger_owner_created on public.hp_ledger(user_id,created_at);
create index notifications_owner_created on public.notifications(user_id,created_at desc);
create index subscriptions_owner on public.push_subscriptions(user_id);
create index messages_owner_created on public.chat_messages(user_id,created_at desc);

create function public.protect_profile_game_state() returns trigger
language plpgsql set search_path = '' as $$
begin
  if auth.role() = 'service_role' or
     (auth.role() is null and current_user in ('postgres','supabase_admin')) then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.hp <> 0 or new.map_index <> 1 or new.presence <> 60 or
       new.streak_days <> 0 or new.last_completed_date is not null then
      raise exception 'Protected game state' using errcode = '42501';
    end if;
  elsif row(new.hp,new.map_index,new.presence,new.streak_days,new.last_completed_date)
    is distinct from row(old.hp,old.map_index,old.presence,old.streak_days,old.last_completed_date) then
    raise exception 'Protected game state' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger protect_profile_game_state before insert or update on public.profiles
for each row execute function public.protect_profile_game_state();

create function public.protect_task_game_state() returns trigger
language plpgsql set search_path = '' as $$
begin
  if auth.role() = 'service_role' or
     (auth.role() is null and current_user in ('postgres','supabase_admin')) then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.status <> 'open' or new.completed_at is not null or new.proof_document_id is not null
       or new.proof_reason is not null or new.penalty_applied then
      raise exception 'Protected task state' using errcode = '42501';
    end if;
  elsif row(new.status,new.completed_at,new.proof_document_id,new.proof_reason,new.penalty_applied)
    is distinct from row(old.status,old.completed_at,old.proof_document_id,old.proof_reason,old.penalty_applied) then
    raise exception 'Protected task state' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger protect_task_game_state before insert or update on public.tasks
for each row execute function public.protect_task_game_state();

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id) values(new.id) on conflict(id) do nothing;
  return new;
end;
$$;
create trigger on_relai_user_created after insert on auth.users
for each row execute function public.handle_new_user();
-- Also initialize any accounts registered during the step-1 auth check.
insert into public.profiles(id) select id from auth.users on conflict(id) do nothing;

alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.tasks enable row level security;
alter table public.hp_ledger enable row level security;
alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.friendships enable row level security;

-- Remove platform default grants before adding the minimal client operations.
revoke all on public.profiles, public.documents, public.tasks, public.hp_ledger,
 public.notifications, public.push_subscriptions, public.chat_messages, public.friendships from anon, authenticated;
grant all on public.profiles, public.documents, public.tasks, public.hp_ledger,
 public.notifications, public.push_subscriptions, public.chat_messages, public.friendships to service_role;
grant select on public.profiles,public.documents,public.tasks,public.hp_ledger,
 public.notifications,public.push_subscriptions,public.chat_messages to authenticated;
grant update(display_name,tone,language,avatar_config) on public.profiles to authenticated;
grant update(title,start_at,remind_at,due_date,tier) on public.tasks to authenticated;
grant delete on public.tasks to authenticated;
grant update(read_at) on public.notifications to authenticated;
grant insert(user_id,endpoint,p256dh,auth), update(endpoint,p256dh,auth), delete
 on public.push_subscriptions to authenticated;

create policy profiles_read on public.profiles for select to authenticated using(id = (select auth.uid()));
create policy profiles_edit on public.profiles for update to authenticated
 using(id = (select auth.uid())) with check(id = (select auth.uid()));
create policy documents_read on public.documents for select to authenticated using(user_id = (select auth.uid()));
create policy tasks_read on public.tasks for select to authenticated using(user_id = (select auth.uid()));
create policy tasks_edit on public.tasks for update to authenticated
 using(user_id = (select auth.uid())) with check(user_id = (select auth.uid()));
create policy tasks_undo on public.tasks for delete to authenticated using(user_id = (select auth.uid()) and status = 'open');
create policy ledger_read on public.hp_ledger for select to authenticated using(user_id = (select auth.uid()));
create policy notifications_read on public.notifications for select to authenticated using(user_id = (select auth.uid()));
create policy notifications_mark_read on public.notifications for update to authenticated
 using(user_id = (select auth.uid())) with check(user_id = (select auth.uid()));
create policy subscriptions_read on public.push_subscriptions for select to authenticated using(user_id = (select auth.uid()));
create policy subscriptions_insert on public.push_subscriptions for insert to authenticated with check(user_id = (select auth.uid()));
create policy subscriptions_edit on public.push_subscriptions for update to authenticated
 using(user_id = (select auth.uid())) with check(user_id = (select auth.uid()));
create policy subscriptions_delete on public.push_subscriptions for delete to authenticated using(user_id = (select auth.uid()));
create policy messages_read on public.chat_messages for select to authenticated using(user_id = (select auth.uid()));

revoke all on function public.protect_profile_game_state() from public,anon,authenticated;
revoke all on function public.protect_task_game_state() from public,anon,authenticated;
revoke all on function public.handle_new_user() from public,anon,authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('documents','documents',false,10485760,array['image/jpeg','image/png','application/pdf']);
create policy relai_documents_upload on storage.objects for insert to authenticated
with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy relai_documents_read on storage.objects for select to authenticated
using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- Files are immutable after upload, preventing proof/document replacement.
-- Cleanup of orphan files is server-side; no public bucket or client overwrite.

alter publication supabase_realtime add table public.notifications;
commit;

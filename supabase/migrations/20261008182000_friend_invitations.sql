-- User-authorized username invitations. Existing friendships hold accepted pairs.
create unique index profiles_username_unique on public.profiles(lower(btrim(display_name)))
where btrim(display_name) <> '';

create table public.friend_invitations (
 id uuid primary key default gen_random_uuid(),
 sender_id uuid not null references auth.users(id) on delete cascade,
 recipient_id uuid not null references auth.users(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','accepted','declined')),
 created_at timestamptz not null default now(),
 check(sender_id <> recipient_id)
);
create unique index friend_invitation_pair on public.friend_invitations
 (least(sender_id,recipient_id),greatest(sender_id,recipient_id));
create index friend_invitation_recipient on public.friend_invitations(recipient_id,status);
create index friend_invitation_sender on public.friend_invitations(sender_id,created_at);
alter table public.friend_invitations enable row level security;
revoke all on public.friend_invitations from anon,authenticated;
grant all on public.friend_invitations to service_role;

create function public.invite_friend(p_username text) returns text
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); target uuid; handle text := lower(btrim(regexp_replace(p_username,'^@',''))); existing text;
begin
 if me is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
 if handle is null or handle !~ '^[a-z0-9_.]{3,24}$' then return 'INVALID_USERNAME'; end if;
 -- Serializes outgoing requests to enforce the daily limit even concurrently.
 perform pg_advisory_xact_lock(hashtextextended(me::text,0));
 select id into target from public.profiles where lower(btrim(display_name))=handle;
 if target is null then return 'NOT_FOUND'; end if;
 if target=me then return 'SELF'; end if;
 if exists(select 1 from public.friendships where user_id=me and friend_id=target) then return 'ALREADY_FRIENDS'; end if;
 select status into existing from public.friend_invitations where least(sender_id,recipient_id)=least(me,target) and greatest(sender_id,recipient_id)=greatest(me,target);
 if found then return case when existing='pending' then 'ALREADY_PENDING' else 'ALREADY_RESOLVED' end; end if;
 if (select count(*) from public.friend_invitations where sender_id=me and created_at > now()-interval '24 hours') >= 20 then return 'LIMIT'; end if;
 insert into public.friend_invitations(sender_id,recipient_id) values(me,target) on conflict do nothing;
 if not found then return 'ALREADY_PENDING'; end if;
 return 'SENT';
end $$;

create function public.respond_friend_invite(p_id uuid,p_accept boolean) returns text
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid(); invitation public.friend_invitations;
begin
 if me is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
 if p_accept is null then return 'INVALID'; end if;
 select * into invitation from public.friend_invitations where id=p_id and recipient_id=me for update;
 if not found then return 'NOT_FOUND'; end if;
 if invitation.status<>'pending' then return 'ALREADY_RESOLVED'; end if;
 if p_accept then
  insert into public.friendships(user_id,friend_id) values(me,invitation.sender_id),(invitation.sender_id,me) on conflict do nothing;
 end if;
 update public.friend_invitations set status=case when p_accept then 'accepted' else 'declined' end where id=p_id;
 return case when p_accept then 'ACCEPTED' else 'DECLINED' end;
end $$;

create function public.get_my_circle() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare me uuid := auth.uid(); result jsonb;
begin
 if me is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
 select jsonb_build_object(
  'friends',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'username',p.display_name,'avatar',p.avatar_config) order by lower(p.display_name)) from public.friendships f join public.profiles p on p.id=f.friend_id where f.user_id=me),'[]'::jsonb),
  'incoming',coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'username',p.display_name,'avatar',p.avatar_config) order by i.created_at desc) from public.friend_invitations i join public.profiles p on p.id=i.sender_id where i.recipient_id=me and i.status='pending'),'[]'::jsonb),
  'outgoing',coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'username',p.display_name,'avatar',p.avatar_config) order by i.created_at desc) from public.friend_invitations i join public.profiles p on p.id=i.recipient_id where i.sender_id=me and i.status='pending'),'[]'::jsonb)
 ) into result;
 return result;
end $$;
revoke all on function public.invite_friend(text),public.respond_friend_invite(uuid,boolean),public.get_my_circle() from public,anon;
grant execute on function public.invite_friend(text),public.respond_friend_invite(uuid,boolean),public.get_my_circle() to authenticated;

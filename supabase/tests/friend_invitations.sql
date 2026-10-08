begin;
insert into auth.users(id,email) values
 ('f1000000-0000-4000-8000-000000000001','circle-a@example.invalid'),
 ('f1000000-0000-4000-8000-000000000002','circle-b@example.invalid'),
 ('f1000000-0000-4000-8000-000000000003','circle-c@example.invalid');
update public.profiles set display_name=case id
 when 'f1000000-0000-4000-8000-000000000001' then 'qa_circle_a'
 when 'f1000000-0000-4000-8000-000000000002' then 'qa_circle_b'
 else 'qa_circle_c' end
 where id in ('f1000000-0000-4000-8000-000000000001','f1000000-0000-4000-8000-000000000002','f1000000-0000-4000-8000-000000000003');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"f1000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$ begin
 if public.invite_friend('qa_circle_a') <> 'SELF' then raise exception 'self invite'; end if;
 if public.invite_friend('%') <> 'INVALID_USERNAME' then raise exception 'wildcard lookup'; end if;
 if public.invite_friend('qa_missing_xyz') <> 'NOT_FOUND' then raise exception 'unknown'; end if;
 if public.invite_friend('@QA_CIRCLE_B') <> 'SENT' then raise exception 'send'; end if;
 if public.invite_friend('qa_circle_b') <> 'ALREADY_PENDING' then raise exception 'duplicate'; end if;
 if jsonb_array_length(public.get_my_circle()->'outgoing') <> 1 then raise exception 'outgoing'; end if;
 if public.respond_friend_invite((public.get_my_circle()->'outgoing'->0->>'id')::uuid,true) <> 'NOT_FOUND' then raise exception 'sender accepted own invite'; end if;
 begin
  perform * from public.friend_invitations;
  raise exception 'direct invitation read allowed';
 exception when insufficient_privilege then null; end;
 begin
  update public.profiles set display_name='QA_CIRCLE_B' where id=auth.uid();
  raise exception 'duplicate username allowed';
 exception when unique_violation then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"f1000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
do $$ begin
 if public.get_my_circle() <> '{"friends":[],"incoming":[],"outgoing":[]}'::jsonb then raise exception 'outsider data leaked'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"f1000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
do $$ declare invitation uuid; begin
 if public.invite_friend('qa_circle_a') <> 'ALREADY_PENDING' then raise exception 'reverse duplicate'; end if;
 invitation := (public.get_my_circle()->'incoming'->0->>'id')::uuid;
 if public.respond_friend_invite(invitation,true) <> 'ACCEPTED' then raise exception 'accept'; end if;
 if public.respond_friend_invite(invitation,true) <> 'ALREADY_RESOLVED' then raise exception 'idempotent accept'; end if;
 if jsonb_array_length(public.get_my_circle()->'friends') <> 1 then raise exception 'friend not visible'; end if;
 if public.get_my_circle()->'friends'->0 ? 'email' or public.get_my_circle()->'friends'->0 ? 'tone' then raise exception 'private fields'; end if;
 if public.invite_friend('qa_circle_c') <> 'SENT' then raise exception 'send second'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"f1000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
do $$ begin
 if public.respond_friend_invite((public.get_my_circle()->'incoming'->0->>'id')::uuid,false) <> 'DECLINED' then raise exception 'decline'; end if;
 if jsonb_array_length(public.get_my_circle()->'friends') <> 0 then raise exception 'decline made friendship'; end if;
end $$;
select set_config('request.jwt.claims','{"sub":"f1000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$ begin
 if public.invite_friend('qa_circle_b') <> 'ALREADY_FRIENDS' then raise exception 'accepted duplicate'; end if;
 if jsonb_array_length(public.get_my_circle()->'friends') <> 1 then raise exception 'not reciprocal'; end if;
end $$;
set local role anon;
do $$ begin
 begin perform public.get_my_circle(); raise exception 'anonymous access'; exception when insufficient_privilege then null; end;
end $$;
rollback;

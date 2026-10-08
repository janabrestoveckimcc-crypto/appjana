-- Run AFTER the initial migration, as postgres in the Supabase SQL editor.
-- Transactional security acceptance check; all fixtures are rolled back.
-- This complements (does not replace) the real two-account HTTP/iPhone checks.
begin;
insert into auth.users(id,email) values
 ('10000000-0000-4000-8000-000000000001','rls-a@example.invalid'),
 ('10000000-0000-4000-8000-000000000002','rls-b@example.invalid');
insert into public.documents(id,user_id,storage_path,file_hash,mime_type,title) values
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001/20000000-0000-4000-8000-000000000001.pdf',repeat('a',64),'application/pdf','A'),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000002/20000000-0000-4000-8000-000000000002.pdf',repeat('b',64),'application/pdf','B');
insert into public.tasks(id,user_id,document_id,kind,title,tier,source,due_date) values
 ('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001','deadline','A task',1,'document',now()),
 ('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000002','deadline','B task',1,'document',now());
insert into storage.objects(bucket_id,name) values
 ('documents','10000000-0000-4000-8000-000000000001/a.pdf'),
 ('documents','10000000-0000-4000-8000-000000000002/b.pdf');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$
begin
  if (select count(*) from public.profiles) <> 1 then raise exception 'FAIL: profile isolation'; end if;
  if (select count(*) from public.documents) <> 1 then raise exception 'FAIL: document isolation'; end if;
  if (select count(*) from public.tasks) <> 1 then raise exception 'FAIL: task isolation'; end if;
  if (select count(*) from storage.objects where bucket_id='documents') <> 1 then raise exception 'FAIL: storage isolation'; end if;
  update public.profiles set display_name='QA A',tone='sarkasticno',language='en',
    avatar_config='{"gender":"male","height":"tall","build":"medium"}'::jsonb where id=auth.uid();
  if not found then raise exception 'FAIL: own profile cannot be edited'; end if;
  if (select hp from public.profiles where id=auth.uid()) <> 0 then raise exception 'FAIL: profile edit changed HP'; end if;
  update public.tasks set title = 'Edited A' where id='30000000-0000-4000-8000-000000000001';
  if not found then raise exception 'FAIL: own task cannot be edited'; end if;
  update public.tasks set title = 'Hacked B' where id='30000000-0000-4000-8000-000000000002';
  if found then raise exception 'FAIL: other task edited'; end if;
  begin
    update public.profiles set hp=99 where id=auth.uid();
    raise exception 'FAIL: client wrote HP';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.tasks set status='done',completed_at=now() where user_id=auth.uid();
    raise exception 'FAIL: client completed task';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.hp_ledger(user_id,amount,reason) values(auth.uid(),99,'forged');
    raise exception 'FAIL: client wrote ledger';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.tasks(user_id,kind,title,tier,source,due_date)
    values(auth.uid(),'deadline','forged',1,'chat',now());
    raise exception 'FAIL: client inserted task';
  exception when insufficient_privilege then null;
  end;
  raise notice 'PASS: A ownership and four forbidden client writes';
end;
$$;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
do $$
begin
  if (select count(*) from public.profiles) <> 1 then raise exception 'FAIL: B profile isolation'; end if;
  if (select count(*) from public.tasks) <> 1 then raise exception 'FAIL: B task isolation'; end if;
  if exists(select 1 from public.documents where user_id <> auth.uid()) then raise exception 'FAIL: B sees A document'; end if;
  if (select title from public.tasks where id='30000000-0000-4000-8000-000000000002') <> 'B task' then raise exception 'FAIL: B task changed'; end if;
  if exists(select 1 from storage.objects where bucket_id='documents' and name like '10000000-0000-4000-8000-000000000001/%') then raise exception 'FAIL: B sees A storage'; end if;
  raise notice 'PASS: B ownership';
end;
$$;
reset role;
rollback;

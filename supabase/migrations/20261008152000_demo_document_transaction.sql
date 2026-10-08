-- Prepared for MAKE_IT_WORK step 1. Service-only, atomic document + task save.
begin;
create or replace function public.save_extracted_document(p_user_id uuid,p_document jsonb,p_task jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare saved public.documents; created_task public.tasks;
begin
 perform 1 from public.profiles where id=p_user_id for update;
 if not found then raise exception 'Profile missing'; end if;
 insert into public.documents(id,user_id,storage_path,file_hash,mime_type,category,title,document_date,expiry_date,extracted)
 values((p_document->>'id')::uuid,p_user_id,p_document->>'storage_path',p_document->>'file_hash',p_document->>'mime_type',p_document->>'category',p_document->>'title',
  (p_document->>'document_date')::timestamptz,(p_document->>'expiry_date')::timestamptz,p_document->'extracted')
 on conflict(user_id,file_hash) do nothing returning * into saved;
 if saved.id is null then
  select * into saved from public.documents where user_id=p_user_id and file_hash=p_document->>'file_hash';
  return jsonb_build_object('document',to_jsonb(saved),'task',null,'duplicate',true);
 end if;
 if p_task is not null then
  insert into public.tasks(user_id,document_id,kind,title,tier,source,remind_at,due_date)
  values(p_user_id,saved.id,'deadline',p_task->>'title',(p_task->>'tier')::smallint,'document',(p_task->>'remind_at')::timestamptz,(p_task->>'due_date')::timestamptz)
  returning * into created_task;
 end if;
 return jsonb_build_object('document',to_jsonb(saved),'task',case when created_task.id is null then null else to_jsonb(created_task) end,'duplicate',false);
end;
$$;
revoke all on function public.save_extracted_document(uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.save_extracted_document(uuid,jsonb,jsonb) to service_role;
commit;

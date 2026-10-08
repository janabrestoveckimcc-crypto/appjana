import { createClient } from 'npm:@supabase/supabase-js@2';
import { AppError } from './errors.ts';
export async function authenticate(request: Request) {
 const authorization=request.headers.get('Authorization') ?? '';
 if(!authorization.startsWith('Bearer '))throw new AppError('AUTH-0001');
 const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:authorization}},auth:{persistSession:false}});
 const {data,error}=await client.auth.getUser(authorization.slice(7));
 if(error||!data.user)throw new AppError('AUTH-0001');
 const {data:profile,error:profileError}=await client.from('profiles').select('*').eq('id',data.user.id).single();
 if(profileError)throw new AppError('SYS-0001');
 return {client,user:data.user,profile};
}

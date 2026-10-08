import {z} from 'zod';
import {getSupabase} from '../../lib/supabase';
const member=z.object({id:z.string().uuid(),username:z.string(),avatar:z.record(z.string(),z.unknown())});
const circle=z.object({friends:z.array(member),incoming:z.array(member),outgoing:z.array(member)});
export type Circle=z.infer<typeof circle>;
export async function readCircle():Promise<Circle>{
 const {data,error}=await getSupabase().rpc('get_my_circle');
 if(error)throw error;
 return circle.parse(data);
}
export async function inviteFriend(username:string):Promise<string>{
 const {data,error}=await getSupabase().rpc('invite_friend',{p_username:username.trim().replace(/^@/,'')});
 if(error)throw error;
 return data;
}
export async function respondToInvite(id:string,accept:boolean):Promise<string>{
 const {data,error}=await getSupabase().rpc('respond_friend_invite',{p_id:id,p_accept:accept});
 if(error)throw error;
 return data;
}

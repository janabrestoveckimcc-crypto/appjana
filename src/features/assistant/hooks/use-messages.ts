import { useQuery } from '@tanstack/react-query';
import { readMessages } from '../services/chat.service';
export function useMessages(userId:string) {
  return useQuery({queryKey:['messages',userId],queryFn:readMessages,retry:false});
}

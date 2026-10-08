import { useQuery } from '@tanstack/react-query';
import { readTasks } from '../services/tasks.service';
export function useTasks(userId:string) {
  return useQuery({queryKey:['tasks',userId],queryFn:readTasks,retry:false});
}

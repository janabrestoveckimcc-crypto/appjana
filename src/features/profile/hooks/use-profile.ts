import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { readProfile, saveProfile } from '../services/profile.service';
import type { ProfileInput } from '../profile.types';
export function useProfile(userId: string) {
  const cache = useQueryClient();
  const profile = useQuery({ queryKey: ['profile',userId], queryFn: () => readProfile(userId), retry: false });
  const save = useMutation({
    mutationFn: (input: ProfileInput) => saveProfile(userId,input),
    onSuccess: (data) => { cache.setQueryData(['profile',userId],data); },
  });
  return { profile, save };
}

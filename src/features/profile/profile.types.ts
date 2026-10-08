import { z } from 'zod';
import type { Database } from '../../lib/database.types';
export type Profile = Database['public']['Tables']['profiles']['Row'];
export const avatarSchema = z.object({
  gender: z.enum(['female','male']).default('female'),
  height: z.enum(['short','medium','tall']).default('medium'),
  build: z.enum(['slim','medium','strong']).default('medium'),
});
export type AvatarConfig = z.infer<typeof avatarSchema>;
export const profileSchema = z.object({
  display_name: z.string().trim().min(1).max(80),
  tone: z.enum(['blago','sarkasticno','brutalno']),
  language: z.enum(['hr','en']),
  avatar_config: avatarSchema,
});
export type ProfileInput = z.infer<typeof profileSchema>;

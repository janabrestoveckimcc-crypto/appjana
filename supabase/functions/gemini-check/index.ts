import { z } from 'npm:zod@4';
import { serverConfig } from '../_shared/config.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { AppError, errorResponse } from '../_shared/errors.ts';
import type { Language } from '../_shared/errors.ts';
import { checkGemini } from '../_shared/gemini.ts';

const inputSchema = z.object({ language: z.enum(['hr', 'en']).default('hr') }).strict();

// Temporary operator-only endpoint, never called automatically by the frontend.
// It uses the existing server-only service role key; no new secret is needed.
Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  let language: Language = 'hr';
  try {
    if (request.method !== 'POST') throw new AppError('REQ-0001');
    if (!serverConfig.serviceRoleKey || request.headers.get('Authorization') !== `Bearer ${serverConfig.serviceRoleKey}`) {
      throw new AppError('AUTH-0001');
    }
    const text = await request.text();
    if (text.length > 128) throw new AppError('REQ-0002');
    let value: unknown;
    try { value = text ? JSON.parse(text) : {}; } catch { throw new AppError('REQ-0002'); }
    const input = inputSchema.safeParse(value);
    if (!input.success) throw new AppError('REQ-0002');
    language = input.data.language;
    return jsonResponse(await checkGemini({ apiKey: serverConfig.geminiApiKey, language, now: new Date(), fetcher: fetch }));
  } catch (error) { return errorResponse(error, language); }
});

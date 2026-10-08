import { z } from 'npm:zod@4';
import { MAIN_MODEL_ID, REQUEST_TIMEOUT_MS } from './config.ts';
import { currentTimeContext } from './context.ts';
import { AppError } from './errors.ts';
import type { Language } from './errors.ts';
import { checkPrompts } from './prompts.ts';

const envelopeSchema = z.object({
  candidates: z.array(z.object({
    finishReason: z.literal('STOP'),
    content: z.object({ parts: z.array(z.object({ text: z.string().optional(), thought: z.boolean().optional() })) }),
  })).min(1),
});
const replySchema = z.object({ reply: z.literal('OK') }).strict();

function validateReply(value: unknown): void {
  try {
    const envelope = envelopeSchema.parse(value);
    const text = envelope.candidates[0].content.parts
      .filter((part) => !part.thought).map((part) => part.text ?? '').join('');
    replySchema.parse(JSON.parse(text));
  } catch { throw new AppError('AI-0004'); }
}

// This temporary smoke check intentionally has NO retries or automatic fallback.
// Each authenticated invocation makes at most one generation request.
export async function checkGemini(input: {
  apiKey: string; language: Language; now: Date; fetcher: typeof fetch;
}): Promise<{ ok: true; model: string }> {
  if (!input.apiKey) throw new AppError('AI-0001');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await input.fetcher(
      `https://generativelanguage.googleapis.com/v1beta/models/${MAIN_MODEL_ID}:generateContent`,
      {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': input.apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: `${currentTimeContext(input.now, input.language)}\n${checkPrompts[input.language]}` }] },
          contents: [{ role: 'user', parts: [{ text: 'OK' }] }],
          generationConfig: {
            maxOutputTokens: 256, thinkingConfig: { thinkingLevel: 'low' },
            responseMimeType: 'application/json',
            responseSchema: { type: 'OBJECT', properties: { reply: { type: 'STRING', enum: ['OK'] } }, required: ['reply'] },
          },
        }),
      },
    );
    if (!response.ok) {
      await response.body?.cancel();
      throw new AppError('AI-0002');
    }
    validateReply(await response.json());
    return { ok: true, model: MAIN_MODEL_ID };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(controller.signal.aborted ? 'AI-0003' : 'AI-0002');
  } finally { clearTimeout(timeout); }
}

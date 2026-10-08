// Set from an authenticated models.list response; never guess API resource IDs.
// Pending: the project's Gemini secret is currently absent.
export const MAIN_MODEL_ID = '';
export const FALLBACK_MODEL_ID = '';
export const REQUEST_TIMEOUT_MS = 20_000;

// Read once per isolate. The user reported the existing secret in lower case.
// Never include values from this object in responses, logs or client bundles.
export const serverConfig = {
  geminiApiKey: Deno.env.get('GEMINI_API_KEY') || Deno.env.get('gemini_api_key') || '',
  serviceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
};

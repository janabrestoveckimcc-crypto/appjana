import type { hr } from './hr';
export const en: Record<keyof typeof hr, string> = {
  brand: 'relAI', tagline: 'You can always rely on your future self.',
  welcome: 'Your next step.', intro: 'Paper becomes a deadline. A deadline becomes progress.',
  email: 'Email', password: 'Password', signIn: 'Sign in', signUp: 'Create account',
  haveAccount: 'Already have an account?', needAccount: 'First time here?', loading: 'One moment…',
  setupTitle: 'Connect your relAI.', setupBody: 'The app is running locally. Connect your Supabase project to enable sign-in and private documents.',
  setupHint: 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local, then restart the development server.',
  authError: 'Sign-in failed. Check your details and try again.',
  signupError: 'Your account was not created. Check your email and use a password with at least 8 characters.',
  confirmEmail: 'Check your email and confirm your account, then sign in.',
  signedIn: 'You are signed in.', connected: 'Supabase sign-in is connected. Next, we will connect your profile and existing tables.',
  signOut: 'Sign out', language: 'Hrvatski', sessionError: 'Unable to check your session. Please try again.', retry: 'Try again',
};

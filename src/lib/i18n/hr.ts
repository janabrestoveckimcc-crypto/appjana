export const hr = {
  brand: 'relAI', tagline: 'Na budućeg sebe se uvijek možeš osloniti.',
  welcome: 'Tvoj sljedeći korak.', intro: 'Papir postaje rok. Rok postaje napredak.',
  email: 'Email', password: 'Lozinka', signIn: 'Prijavi se', signUp: 'Kreiraj račun',
  haveAccount: 'Već imaš račun?', needAccount: 'Prvi put ovdje?', loading: 'Samo trenutak…',
  setupTitle: 'Povežimo tvoj relAI.', setupBody: 'Aplikacija radi lokalno. Za prijavu i privatne dokumente još treba povezati Supabase projekt.',
  setupHint: 'U .env.local postavi VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY pa ponovno pokreni razvojni server.',
  authError: 'Prijava nije uspjela. Provjeri podatke i pokušaj ponovno.',
  signupError: 'Račun nije kreiran. Provjeri email i koristi lozinku od najmanje 8 znakova.',
  confirmEmail: 'Provjeri email i potvrdi račun, zatim se prijavi.',
  signedIn: 'Uspješno si prijavljen/a.', connected: 'Supabase prijava je povezana. Sljedeći korak je povezivanje profila i postojećih tablica.',
  signOut: 'Odjavi se', language: 'English', sessionError: 'Sesiju nije moguće provjeriti. Pokušaj ponovno.', retry: 'Pokušaj ponovno',
} as const;

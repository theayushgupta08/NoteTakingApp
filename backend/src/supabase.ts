// @ts-ignore
import fetch, { RequestInit, Response } from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Sign up with email/OTP (send magic link)
export async function signUpWithEmail(email: string) {
  const url = `${SUPABASE_URL}/auth/v1/otp`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error_description || 'Failed to send OTP');
  }
  return res.json();
}

// Sign in with email/OTP (same endpoint as signup)
export async function signInWithEmail(email: string) {
  return signUpWithEmail(email);
}

// Google OAuth URL
type GoogleOAuthOptions = { redirectTo?: string };
export function getGoogleOAuthUrl(options?: GoogleOAuthOptions) {
  // Supabase Google OAuth URL format:
  // {SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=...
  const redirectTo = options?.redirectTo || process.env.GOOGLE_REDIRECT_URL || '';
  const url = `${SUPABASE_URL}/auth/v1/authorize?provider=google` + (redirectTo ? `&redirect_to=${encodeURIComponent(redirectTo)}` : '');
  return url;
}

// Exchange Google OAuth code for Supabase session
type ExchangeSession = any; // You can type this more strictly if desired
export async function exchangeGoogleCodeForSession(code: string, state?: string): Promise<ExchangeSession> {
  const url = `${SUPABASE_URL}/auth/v1/token`;
  const redirectTo = process.env.GOOGLE_REDIRECT_URL || '';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_to: redirectTo,
    }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error_description || 'Failed to exchange code');
  }
  return res.json();
}

// Verify OTP with Supabase
export async function verifyOtpWithSupabase(email: string, otp: string) {
  const url = `${SUPABASE_URL}/auth/v1/verify`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      token: otp,
      type: 'magiclink', // or 'signup' depending on Supabase config
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || 'OTP verification failed');
  }
  // data contains access_token, user, etc.
  return {
    user: data.user,
    jwt: data.access_token,
  };
} 
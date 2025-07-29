import { Router } from 'express';
import { signUpWithEmail, signInWithEmail, getGoogleOAuthUrl, exchangeGoogleCodeForSession, verifyOtpWithSupabase } from './supabase';
import { getNotes, createNote, deleteNote } from './services/notesService';
import { upsertProfile } from './services/profileService';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// JWT auth middleware
function authenticateJWT(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Auth endpoints
router.post('/auth/signup', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    await signUpWithEmail(email);
    res.json({ message: 'Signup initiated (OTP sent if email is valid)' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send OTP' });
  }
});

router.post('/auth/signin', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    await signInWithEmail(email);
    res.json({ message: 'Signin initiated (OTP sent if email is valid)' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send OTP' });
  }
});

router.post('/auth/verify-otp', async (req: Request, res: Response) => {
  const { email, otp, name, dob } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });
  try {
    const { user, jwt: userJwt } = await verifyOtpWithSupabase(email, otp);
    
    // If this is a signup (name and dob provided), create/update profile
    if (name && dob) {
      try {
        await upsertProfile(user.id, name, dob, userJwt);
      } catch (profileErr) {
        console.error('Profile creation failed:', profileErr);
        // Don't fail the signup if profile creation fails
      }
    }
    
    res.json({ token: userJwt, user });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'OTP verification failed' });
  }
});

router.get('/auth/google-url', (req: Request, res: Response) => {
  const { redirectTo } = req.query;
  const url = getGoogleOAuthUrl({ redirectTo: redirectTo as string | undefined });
  res.json({ url });
});

router.get('/auth/google/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing code' });
  try {
    const session = await exchangeGoogleCodeForSession(code as string, state as string | undefined);
    res.json(session);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to exchange code' });
  }
});

// Notes endpoints
router.get('/notes', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const jwtToken = req.headers.authorization!.split(' ')[1];
    const notes = await getNotes(userId, jwtToken);
    res.json({ notes });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch notes' });
  }
});

router.post('/notes', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const jwtToken = req.headers.authorization!.split(' ')[1];
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    const note = await createNote(userId, content, jwtToken);
    res.json({ note });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create note' });
  }
});

router.delete('/notes/:id', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const jwtToken = req.headers.authorization!.split(' ')[1];
    const { id } = req.params;
    const result = await deleteNote(userId, id, jwtToken);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete note' });
  }
});

export default router; 
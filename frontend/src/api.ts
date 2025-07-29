export async function sendSignUpOtp(email: string) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to send OTP');
  return res.json();
}

export async function sendSignInOtp(email: string) {
  const res = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to send OTP');
  return res.json();
}

export async function verifyOtp(email: string, otp: string, name?: string, dob?: string) {
  const body: any = { email, otp };
  if (name) body.name = name;
  if (dob) body.dob = dob;
  
  const res = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'OTP verification failed');
  return { token: data.token, user: data.user };
}

export async function getGoogleOAuthUrl() {
  const res = await fetch('/api/auth/google-url');
  if (!res.ok) throw new Error('Failed to get Google OAuth URL');
  const data = await res.json();
  return data.url;
}

export async function getNotes() {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/notes', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch notes');
  return data.notes;
}

export async function createNote(content: string) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create note');
  return data.note;
}

export async function deleteNote(id: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete note');
  return data.success;
} 
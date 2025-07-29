const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function getNotes(userId: string, jwt: string) {
  const url = `${SUPABASE_URL}/rest/v1/notes?user_id=eq.${userId}&order=created_at.desc`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${jwt}`,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch notes');
  }
  return res.json();
}

export async function createNote(userId: string, content: string, jwt: string) {
  const url = `${SUPABASE_URL}/rest/v1/notes`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify([{ user_id: userId, content }]),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create note');
  }
  return (await res.json())[0];
}

export async function deleteNote(userId: string, noteId: string, jwt: string) {
  const url = `${SUPABASE_URL}/rest/v1/notes?id=eq.${noteId}&user_id=eq.${userId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${jwt}`,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to delete note');
  }
  return { success: true };
} 
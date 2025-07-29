const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function upsertProfile(userId: string, name: string, dob: string, jwt: string) {
  const url = `${SUPABASE_URL}/rest/v1/profiles`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify([{ id: userId, name, dob }]),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to upsert profile');
  }
  return (await res.json())[0];
}

export async function getProfile(userId: string, jwt: string) {
  const url = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${jwt}`,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch profile');
  }
  const profiles = await res.json();
  return profiles[0] || null;
} 
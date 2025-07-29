import React, { useEffect, useState } from 'react';
import { getNotes, createNote, deleteNote } from '../api';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const notes = await getNotes();
      setNotes(notes);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setCreating(true);
    setError('');
    try {
      const note = await createNote(newNote);
      setNotes([note, ...notes]);
      setNewNote('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setError('');
    try {
      await deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Dashboard</h2>
        <button onClick={handleLogout}>Sign Out</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Welcome, {user?.name || user?.email || 'User'}!</strong>
        <div style={{ fontSize: 12, color: '#888' }}>{user?.email}</div>
      </div>
      <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="New note..."
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          style={{ width: '80%', marginRight: 8 }}
        />
        <button type="submit" disabled={creating}>
          {creating ? 'Adding...' : 'Create Note'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {loading ? (
        <div>Loading notes...</div>
      ) : notes.length === 0 ? (
        <div>No notes yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notes.map(note => (
            <li key={note.id} style={{ marginBottom: 8, border: '1px solid #eee', padding: 8, borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{note.content}</span>
              <button onClick={() => handleDelete(note.id)} disabled={deleting === note.id} style={{ marginLeft: 8 }}>
                {deleting === note.id ? 'Deleting...' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DashboardPage; 
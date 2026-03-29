import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { getArtists, getUsers, createUser, updateUser, type AdminUser } from '../services/api';
import type { Artist } from '../types';

export default function AdminUsers() {
  const userStr = localStorage.getItem('user');
  const me = userStr ? JSON.parse(userStr) : null;

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'MANAGER' as 'ADMIN' | 'MANAGER',
    artistIds: [] as string[],
  });

  const [editForm, setEditForm] = useState({
    email: '',
    name: '',
    role: 'MANAGER' as 'ADMIN' | 'MANAGER',
    isActive: true,
    password: '',
    artistIds: [] as string[],
  });

  const load = async () => {
    setError('');
    try {
      const [u, a] = await Promise.all([getUsers(), getArtists()]);
      setUsers(u);
      setArtists(a);
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (me?.role === 'ADMIN') load();
  }, [me?.role]);

  if (!me || me.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  const startEdit = (u: AdminUser) => {
    setEditingId(u.id);
    setEditForm({
      email: u.email,
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      password: '',
      artistIds: u.artists.map((x) => x.id),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const toggleArtist = (id: string, current: string[], setIds: (ids: string[]) => void) => {
    if (current.includes(id)) setIds(current.filter((x) => x !== id));
    else setIds([...current, id]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createUser({
        email: createForm.email,
        password: createForm.password,
        name: createForm.name,
        role: createForm.role,
        artistIds: createForm.artistIds.length ? createForm.artistIds : undefined,
      });
      setCreateForm({ email: '', password: '', name: '', role: 'MANAGER', artistIds: [] });
      setCreateOpen(false);
      await load();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al crear usuario');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setError('');
    try {
      const body: Parameters<typeof updateUser>[1] = {
        email: editForm.email,
        name: editForm.name,
        role: editForm.role,
        isActive: editForm.isActive,
        artistIds: editForm.artistIds,
      };
      if (editForm.password.trim()) body.password = editForm.password;
      await updateUser(editingId, body);
      cancelEdit();
      await load();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al guardar');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 10,
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    borderRadius: 8,
  };

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, opacity: 0.8, marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'white', padding: '40px 20px' }}>
      <div className="shell" style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <Link to="/dashboard" style={{ color: 'white', opacity: 0.7 }}>
            <ArrowLeft size={24} />
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Usuarios del sistema</h1>
        </div>

        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Crear cuentas, asignar artistas, cambiar rol y contraseña. Solo visible para administradores.
        </p>

        {error ? (
          <div style={{ background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.3)', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setCreateOpen((o) => !o)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'var(--bg-soft)',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          <UserPlus size={18} /> {createOpen ? 'Cerrar formulario' : 'Nuevo usuario'}
        </button>

        {createOpen && (
          <form
            onSubmit={handleCreate}
            style={{
              background: 'var(--bg-soft)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: 24,
              borderRadius: 16,
              marginBottom: 32,
              display: 'grid',
              gap: 16,
            }}
          >
            <h3 style={{ fontSize: 16, margin: 0 }}>Crear usuario</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input required value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Correo</label>
                <input required type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Contraseña (mín. 8)</label>
                <input required minLength={8} type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Rol</label>
                <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as 'ADMIN' | 'MANAGER' })} style={inputStyle}>
                  <option value="MANAGER">Manager (solo artistas asignados)</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Artistas asignados</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {artists.map((a) => (
                  <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={createForm.artistIds.includes(a.id)}
                      onChange={() => toggleArtist(a.id, createForm.artistIds, (ids) => setCreateForm({ ...createForm, artistIds: ids }))}
                    />
                    {a.name}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" style={{ justifySelf: 'start', padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--accent-orange, #f97316)', color: '#111', fontWeight: 700, cursor: 'pointer' }}>
              Crear usuario
            </button>
          </form>
        )}

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Cargando…</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {users.map((u) => (
              <div
                key={u.id}
                style={{
                  background: 'var(--bg-elevated, #1a1a2e)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                {editingId === u.id ? (
                  <form onSubmit={handleSaveEdit} style={{ display: 'grid', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Nombre</label>
                        <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Correo</label>
                        <input required type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Nueva contraseña (opcional)</label>
                        <input minLength={8} type="password" placeholder="Dejar vacío para no cambiar" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Rol</label>
                        <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'ADMIN' | 'MANAGER' })} style={inputStyle}>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Administrador</option>
                        </select>
                      </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} />
                      Cuenta activa
                    </label>
                    <div>
                      <label style={labelStyle}>Artistas</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {artists.map((a) => (
                          <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={editForm.artistIds.includes(a.id)}
                              onChange={() => toggleArtist(a.id, editForm.artistIds, (ids) => setEditForm({ ...editForm, artistIds: ids }))}
                            />
                            {a.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 8, border: 'none', background: 'var(--accent-blue, #60a5fa)', color: '#0a0a12', fontWeight: 700, cursor: 'pointer' }}>
                        <Save size={16} /> Guardar
                      </button>
                      <button type="button" onClick={cancelEdit} style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: 'pointer' }}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 17 }}>{u.name}</div>
                      <div style={{ opacity: 0.75, fontSize: 14 }}>{u.email}</div>
                      <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
                        <span style={{ color: u.role === 'ADMIN' ? 'var(--accent-orange)' : 'var(--accent-blue)' }}>{u.role}</span>
                        {' · '}
                        {u.isActive ? <span style={{ color: '#4ade80' }}>Activo</span> : <span style={{ color: '#f87171' }}>Inactivo</span>}
                      </div>
                      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                        Artistas: {u.artists.length ? u.artists.map((x) => x.name).join(', ') : 'ninguno'}
                      </div>
                    </div>
                    <button type="button" onClick={() => startEdit(u)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'var(--bg-soft)', color: 'white', cursor: 'pointer' }}>
                      Editar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

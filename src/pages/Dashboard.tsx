import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Users, Image as ImageIcon, Calendar, KeyRound } from 'lucide-react';
import { changePassword, getArtists } from '../services/api';
import type { Artist } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.role === 'ADMIN';

  const [rosterArtists, setRosterArtists] = useState<Artist[] | null>(null);
  const [rosterLoading, setRosterLoading] = useState(false);

  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setRosterLoading(true);
    getArtists()
      .then((list) => {
        if (!cancelled) setRosterArtists(list);
      })
      .catch(() => {
        if (!cancelled) setRosterArtists([]);
      })
      .finally(() => {
        if (!cancelled) setRosterLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const displayArtists: { id: string; slug: string; name: string }[] = isAdmin
    ? rosterArtists?.map((a) => ({ id: a.id, slug: a.slug, name: a.name })) ?? []
    : user?.artists ?? [];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdErr('');
    if (pwdNew !== pwdConfirm) {
      setPwdErr('La nueva contraseña y la confirmación no coinciden.');
      return;
    }
    setPwdLoading(true);
    try {
      const { message } = await changePassword({ currentPassword: pwdCurrent, newPassword: pwdNew });
      setPwdMsg(message);
      setPwdCurrent('');
      setPwdNew('');
      setPwdConfirm('');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string | string[] } } };
      const msg = ax.response?.data?.message;
      setPwdErr(Array.isArray(msg) ? msg.join(', ') : msg || 'No se pudo actualizar la contraseña.');
    } finally {
      setPwdLoading(false);
    }
  };

  const pwdInput: React.CSSProperties = {
    width: '100%',
    maxWidth: 320,
    padding: 10,
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
    borderRadius: 8,
    boxSizing: 'border-box',
  };

  const btnRowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 'auto',
  };

  const secondaryBtn: React.CSSProperties = {
    flex: '1 1 120px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    background: 'rgba(168,85,247,0.12)',
    color: 'white',
    border: '1px solid rgba(168,85,247,0.35)',
    padding: '10px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    transition: 'all 0.2s',
  };

  const primaryBtn: React.CSSProperties = {
    flex: '1 1 120px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    background: 'var(--bg-soft)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '10px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    transition: 'all 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'white', padding: '40px 20px' }}>
      <div className="shell" style={{ maxWidth: 880, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Panel de Control Artista</h1>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.1)', border: 'none', padding: '10px 16px', borderRadius: 8, color: 'white', cursor: 'pointer' }}
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>

        <div style={{ background: 'var(--bg-soft)', border: '1px solid rgba(255,255,255,0.1)', padding: 30, borderRadius: 16, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 10, color: 'var(--accent-orange, #f97316)' }}>Bienvenido, {user?.name || 'Administrador'}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
            {isAdmin
              ? 'Cuenta con rol administrador: puedes gestionar cualquier artista del sistema.'
              : 'Panel de gestión: solo los artistas asignados a tu cuenta.'}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.5, opacity: 0.95 }}>
            Las <strong>fotos de galería</strong> y la <strong>portada</strong> se suben dentro de cada artista, pestaña <strong style={{ color: '#c084fc' }}>Galería</strong>.
            También puedes abrir la galería directamente con el botón morado en cada tarjeta.
          </p>
          {isAdmin && (
            <Link
              to="/dashboard/admin/users"
              style={{
                marginTop: 16,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 8,
                background: 'rgba(96,165,250,0.15)',
                border: '1px solid rgba(96,165,250,0.35)',
                color: 'var(--accent-blue, #60a5fa)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <Users size={18} /> Gestionar usuarios
            </Link>
          )}
        </div>

        <div
          style={{
            background: 'var(--bg-soft)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: 24,
            borderRadius: 16,
            marginBottom: 28,
          }}
        >
          <h3 style={{ fontSize: 16, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
            <KeyRound size={18} /> Cambiar tu contraseña
          </h3>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Contraseña actual</label>
              <input
                type="password"
                autoComplete="current-password"
                value={pwdCurrent}
                onChange={(e) => setPwdCurrent(e.target.value)}
                style={pwdInput}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Nueva contraseña (mín. 8 caracteres)</label>
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={pwdNew}
                onChange={(e) => setPwdNew(e.target.value)}
                style={pwdInput}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Confirmar nueva contraseña</label>
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={pwdConfirm}
                onChange={(e) => setPwdConfirm(e.target.value)}
                style={pwdInput}
                required
              />
            </div>
            {pwdErr ? (
              <p style={{ color: '#f87171', fontSize: 14, margin: 0 }}>{pwdErr}</p>
            ) : null}
            {pwdMsg ? (
              <p style={{ color: '#86efac', fontSize: 14, margin: 0 }}>{pwdMsg}</p>
            ) : null}
            <button
              type="submit"
              disabled={pwdLoading}
              style={{
                alignSelf: 'flex-start',
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: 'rgba(255,255,255,0.12)',
                color: 'white',
                fontWeight: 600,
                cursor: pwdLoading ? 'wait' : 'pointer',
                opacity: pwdLoading ? 0.7 : 1,
              }}
            >
              {pwdLoading ? 'Guardando…' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>

        <div>
          <h3 style={{ fontSize: 20, marginBottom: 12, fontWeight: 'bold' }}>
            {isAdmin ? 'Artistas del roster' : 'Tus Artistas Asignados'}
          </h3>

          {isAdmin && rosterLoading && <p style={{ color: 'var(--text-muted)' }}>Cargando artistas…</p>}

          {!isAdmin && (!user?.artists || user.artists.length === 0) ? (
            <div style={{ background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', padding: 20, borderRadius: 12 }}>
              <p style={{ color: '#ff6b6b' }}>
                No tienes artistas asignados en este momento. Si crees que es un error, contacta al administrador principal.
              </p>
            </div>
          ) : isAdmin && !rosterLoading && displayArtists.length === 0 ? (
            <div style={{ background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', padding: 20, borderRadius: 12 }}>
              <p style={{ color: '#ff6b6b' }}>No hay artistas activos en la base de datos. Crea uno desde el API o el seed.</p>
            </div>
          ) : (
            !rosterLoading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {displayArtists.map((artist: { id: string; slug: string; name: string }) => (
                  <div
                    key={artist.id}
                    style={{
                      background: 'var(--bg-elevated, #1a1a2e)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 16,
                      padding: 24,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 16,
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: 18, fontWeight: 600 }}>{artist.name}</h4>
                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--accent-blue, #60a5fa)',
                          background: 'rgba(96,165,250,0.1)',
                          padding: '4px 8px',
                          borderRadius: 4,
                          display: 'inline-block',
                          marginTop: 8,
                        }}
                      >
                        /{artist.slug}
                      </span>
                    </div>
                    <div style={btnRowStyle}>
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/${artist.slug}`)}
                        style={primaryBtn}
                        onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue, #60a5fa)')}
                        onMouseOut={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                      >
                        <Calendar size={16} /> Fechas y perfil
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/${artist.slug}?tab=gallery`)}
                        style={secondaryBtn}
                        onMouseOver={(e) => (e.currentTarget.style.borderColor = 'rgba(192,132,252,0.8)')}
                        onMouseOut={(e) => (e.currentTarget.style.borderColor = 'rgba(168,85,247,0.35)')}
                      >
                        <ImageIcon size={16} /> Galería
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

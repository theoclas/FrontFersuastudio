import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  // Al loguear, guardamos el string de usuario, así que lo parseamos:
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'white', padding: '40px 20px' }}>
      <div className="shell" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Panel de Control Artista</h1>
          <button 
            onClick={handleLogout}
            style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.1)', border: 'none', padding: '10px 16px', borderRadius: 8, color: 'white', cursor: 'pointer' }}
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>

        <div style={{ background: 'var(--bg-soft)', border: '1px solid rgba(255,255,255,0.1)', padding: 30, borderRadius: 16, marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, marginBottom: 10, color: 'var(--accent-orange, #f97316)' }}>Bienvenido, {user?.name || 'Administrador'}</h2>
          <p style={{ color: 'var(--text-muted)' }}>Panel de gestión activado bajo autorización robusta (RBAC).</p>
        </div>

        <div>
          <h3 style={{ fontSize: 20, marginBottom: 20, fontWeight: 'bold' }}>Tus Artistas Asignados</h3>
          
          {(!user?.artists || user.artists.length === 0) ? (
            <div style={{ background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', padding: 20, borderRadius: 12 }}>
              <p style={{ color: '#ff6b6b' }}>No tienes artistas asignados en este momento. Si crees que es un error, contacta al administrador principal.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
              {user.artists.map((artist: any) => (
                <div key={artist.id} style={{
                  background: 'var(--bg-elevated, #1a1a2e)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 16,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}>
                  <div>
                    <h4 style={{ fontSize: 18, fontWeight: 600 }}>{artist.name}</h4>
                    <span style={{ fontSize: 12, color: 'var(--accent-blue, #60a5fa)', background: 'rgba(96,165,250,0.1)', padding: '4px 8px', borderRadius: 4, display: 'inline-block', marginTop: 8 }}>
                      /{artist.slug}
                    </span>
                  </div>
                  <button 
                    style={{ 
                      marginTop: 'auto', 
                      background: 'var(--bg-soft)', 
                      color: 'white', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      padding: '10px', 
                      borderRadius: 8, 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-blue, #60a5fa)'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  >
                    Gestionar Fechas y Perfil
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

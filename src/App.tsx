import { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ArtistBooking from './pages/ArtistBooking';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminUsers from './pages/AdminUsers';
import ArtistDashboard from './pages/ArtistDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// Error Boundary so that backend errors in one page don't blank the whole app
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: string }> {
  state = { hasError: false, error: '' };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#050505', color:'#fff', flexDirection:'column', gap:'1rem', padding:'2rem', textAlign:'center' }}>
          <h2 style={{ fontSize:'1.5rem', fontWeight:700 }}>⚠️ Error al cargar la página</h2>
          <p style={{ color:'#888', maxWidth:'400px' }}>El backend podría no estar activo. Asegúrate de que <strong>npm run start:dev</strong> esté corriendo en la carpeta <code>backend</code>.</p>
          <code style={{ background:'rgba(255,255,255,0.05)', padding:'0.5rem 1rem', borderRadius:'8px', fontSize:'0.8rem', color:'#ff6b6b' }}>{this.state.error}</code>
          <button onClick={() => window.location.reload()} style={{ marginTop:'1rem', padding:'0.75rem 1.5rem', background:'#fff', color:'#000', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600 }}>Reintentar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          {/* Selector de Djs - Página principal */}
          <Route path="/" element={<Home />} />
          
          {/* Panel Administrativo Authentication */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Privadas / Dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/admin/users" element={<AdminUsers />} />
            <Route path="/dashboard/:slug" element={<ArtistDashboard />} />
          </Route>

          {/* Página dinámica de booking por artista (Ej: /macfly-mikebran, /diann-makinne) */}
          <Route path="/:slug" element={<ArtistBooking />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;


import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  
  // Si no hay token guardado, redirigimos al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, permitimos ver las rutas hijas (el Dashboard)
  return <Outlet />;
}

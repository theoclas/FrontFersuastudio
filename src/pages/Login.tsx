import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRegistrationOpen, loginAdmin, registerPublic } from '../services/api';
import './Login.css';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { publicRegistrationEnabled } = await getRegistrationOpen();
        if (!cancelled) setRegistrationOpen(!!publicRegistrationEnabled);
      } catch {
        if (!cancelled) setRegistrationOpen(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await loginAdmin({ email: formData.email, password: formData.password });
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        navigate('/dashboard');
      } else {
        const response = await registerPublic({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
        if (response.access_token) {
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          navigate('/dashboard');
        } else {
          setInfo(response.message || 'Cuenta creada. Revisa tu correo o espera activación por un administrador.');
          setIsLogin(true);
          setFormData((f) => ({ ...f, password: '' }));
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al procesar la solicitud. Revisa tus credenciales.');
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    if (isLogin && !registrationOpen) return;
    setIsLogin(!isLogin);
    setError('');
    setInfo('');
    setFormData({ name: '', email: '', password: '' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="login-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="login-left">
        <div className="login-left-content">
          <motion.h1 
            className="brand-title"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            FersuaStudio.
          </motion.h1>
          <motion.p 
            className="brand-subtitle"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            El panel administrativo diseñado para gestionar el talento musical. Ingresa para actualizar perfiles, eventos y solicitudes de booking.
          </motion.p>
        </div>
      </div>

      <div className="login-right">
        <div className="ambient-light"></div>
        
        <motion.div 
          className="glass-panel"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="login-header">
            <h2>{isLogin ? 'Bienvenido de vuelta' : 'Crear nueva cuenta'}</h2>
            <p>{isLogin ? 'Ingresa tus credenciales para acceder al panel.' : 'Registra tus datos para acceder.'}</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                className="form-error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}
            {info && (
              <motion.div
                className="form-error"
                style={{ borderColor: 'rgba(74,222,128,0.35)', background: 'rgba(74,222,128,0.08)', color: '#86efac' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <span>{info}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <AnimatePresence>
              {!isLogin && (
                <motion.div 
                  className="form-group"
                  variants={itemVariants}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label>Nombre Completo</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input 
                      type="text" 
                      name="name"
                      className="glass-input" 
                      placeholder="Ej: Fernando Suárez" 
                      value={formData.name}
                      onChange={handleInputChange}
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div className="form-group" variants={itemVariants}>
              <label>Correo Electrónico</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input 
                  type="email" 
                  name="email"
                  className="glass-input" 
                  placeholder="admin@fersuastudio.com" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </motion.div>

            <motion.div className="form-group" variants={itemVariants}>
              <label>Contraseña</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input 
                  type="password" 
                  name="password"
                  className="glass-input" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </motion.div>

            <motion.button 
              type="submit" 
              className="submit-btn" 
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
              {!loading && <ArrowRight size={20} />}
            </motion.button>
          </form>

          {registrationOpen ? (
            <motion.div className="toggle-mode" variants={itemVariants}>
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}
              <button type="button" onClick={toggleMode}>
                {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
              </button>
            </motion.div>
          ) : (
            <p className="toggle-mode" style={{ opacity: 0.65, fontSize: 14, marginTop: 8 }}>
              El registro público está desactivado. Si necesitas acceso, un administrador debe crear tu cuenta.
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;

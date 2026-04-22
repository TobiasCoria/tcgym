import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const [vista, setVista] = useState('login');
  const [modo, setModo] = useState('email');
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', documento: '', contrasena: '', confirmar: ''
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const resetForm = () => {
    setForm({ nombre: '', apellido: '', email: '', documento: '', contrasena: '', confirmar: '' });
    setError('');
    setExito('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const body = {
        contrasena: form.contrasena,
        ...(modo === 'email' ? { email: form.email } : { documento: form.documento }),
      };
      const { data } = await api.post('/auth/login', body);
      login(data.token, data.usuario);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    if (form.contrasena !== form.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setCargando(true);
    setError('');
    try {
      await api.post('/auth/registro', {
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        documento: form.documento,
        contrasena: form.contrasena,
      });
      setExito('¡Cuenta creada! Ya podés iniciar sesión.');
      setTimeout(() => {
        resetForm();
        setVista('login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-6 overflow-hidden">

      {/* Fondo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[-80px] w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] animate-glow-pulse" />
        <div className="absolute bottom-[-100px] right-[-60px] w-[300px] h-[300px] bg-orange-500/8 rounded-full blur-[80px] animate-glow-pulse" style={{animationDelay:'1.2s'}} />
        <div className="absolute top-[40%] left-[60%] w-[200px] h-[200px] bg-orange-500/5 rounded-full blur-[60px] animate-glow-pulse" style={{animationDelay:'0.6s'}} />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 animate-float">
            <img src="/logo.png" alt="TCgym" className="w-20 h-20 object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-wide">TCGYM</h1>
          <p className="text-white/30 text-sm mt-1 font-medium">
            {vista === 'login' ? 'Ingresá a tu cuenta' : 'Creá tu cuenta'}
          </p>
        </div>

        {/* Card */}
        <div className="animate-fadeIn delay-100 bg-white/5 border border-white/8 rounded-2xl p-6">

          {/* ── LOGIN ── */}
          {vista === 'login' && (
            <>
              {/* Toggle email/documento */}
              <div className="flex bg-white/5 rounded-xl p-1 mb-5">
                {['email', 'documento'].map((op) => (
                  <button
                    key={op}
                    onClick={() => setModo(op)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      modo === op ? 'bg-orange-500 text-white shadow' : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {op === 'email' ? 'Email' : 'Documento'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    {modo === 'email' ? 'Email' : 'Documento'}
                  </label>
                  <input
                    type={modo === 'email' ? 'email' : 'text'}
                    placeholder={modo === 'email' ? 'tu@email.com' : '12345678'}
                    value={modo === 'email' ? form.email : form.documento}
                    onChange={(e) => setForm({ ...form, [modo]: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-white/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.contrasena}
                    onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-white/20"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs font-medium animate-scaleIn">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 text-sm tracking-wide"
                >
                  {cargando ? 'Ingresando...' : 'Ingresar'}
                </button>
              </form>

              <div className="mt-5 pt-5 border-t border-white/8 text-center">
                <p className="text-white/30 text-xs mb-3">¿No tenés cuenta?</p>
                <button
                  onClick={() => { resetForm(); setVista('registro'); }}
                  className="text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors"
                >
                  Crear cuenta →
                </button>
              </div>
            </>
          )}

          {/* ── REGISTRO ── */}
          {vista === 'registro' && (
            <>
              <form onSubmit={handleRegistro} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">
                      Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Juan"
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500 text-white rounded-xl px-3 py-3 text-sm outline-none transition-all placeholder-white/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">
                      Apellido
                    </label>
                    <input
                      type="text"
                      placeholder="Pérez"
                      value={form.apellido}
                      onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500 text-white rounded-xl px-3 py-3 text-sm outline-none transition-all placeholder-white/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-white/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Documento
                  </label>
                  <input
                    type="text"
                    placeholder="12345678"
                    value={form.documento}
                    onChange={(e) => setForm({ ...form, documento: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-white/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={form.contrasena}
                    onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-white/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Repetí la contraseña"
                    value={form.confirmar}
                    onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500 text-white rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-white/20"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs font-medium animate-scaleIn">
                    {error}
                  </div>
                )}

                {exito && (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-3 text-xs font-medium animate-scaleIn">
                    {exito}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 text-sm tracking-wide"
                >
                  {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </form>

              <div className="mt-5 pt-5 border-t border-white/8 text-center">
                <p className="text-white/30 text-xs mb-3">¿Ya tenés cuenta?</p>
                <button
                  onClick={() => { resetForm(); setVista('login'); }}
                  className="text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors"
                >
                  ← Iniciar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
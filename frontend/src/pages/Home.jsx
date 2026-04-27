import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Home() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [proximoTurno, setProximoTurno] = useState(null);
  const [stats, setStats] = useState({ usuarios: 0, turnosHoy: 0, reservados: 0, completados: 0 });

  const esAdmin = usuario?.rol === 'admin';

  useEffect(() => {
    const cargar = async () => {
      try {
        if (esAdmin) {
          const [u, t] = await Promise.all([api.get('/usuarios'), api.get('/turnos')]);
          const hoy = new Date().toISOString().split('T')[0];
          const turnosHoy = t.data.filter(t => t.fecha?.split('T')[0] === hoy);
          setStats({
            usuarios: u.data.length,
            turnosHoy: turnosHoy.length,
            reservados: turnosHoy.filter(t => t.estado === 'reservado').length,
            completados: turnosHoy.filter(t => t.estado === 'completado').length,
          });
        } else {
          const { data } = await api.get('/turnos/mis-turnos');
          const hoy = new Date().toISOString().split('T')[0];
          const proximo = data.find(t => t.estado === 'reservado' && t.fecha?.split('T')[0] >= hoy);
          setProximoTurno(proximo || null);
        }
      } catch (err) {
        console.error("Error cargando datos", err);
      }
    };
    cargar();
  }, [esAdmin]);

  return (
    <div className={`min-h-screen text-white selection:bg-orange-500/30 ${esAdmin ? 'bg-[#05080d]' : 'bg-[#05070f]'}`}>
      
      {/* Luces Ambientales (Glows) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${esAdmin ? 'bg-blue-600' : 'bg-orange-600'}`} />
        <div className={`absolute bottom-[5%] -right-[5%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-10 ${esAdmin ? 'bg-blue-400' : 'bg-orange-400'}`} />
      </div>

      {/* Navbar Minimalista */}
      <nav className="relative z-40 flex items-center justify-between px-6 py-5 backdrop-blur-md border-b border-white/[0.03]">
        <button 
          onClick={() => setMenuAbierto(true)} 
          className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-all duration-300 group active:scale-90"
        >
          <div className="flex flex-col gap-1.5">
            <span className="block w-6 h-[1.5px] bg-white/80 group-hover:bg-white transition-colors" />
            <span className="block w-4 h-[1.5px] bg-white/50 group-hover:w-6 group-hover:bg-white transition-all" />
          </div>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="font-black text-lg tracking-tighter italic">TCGYM</span>
          <div className={`h-[2px] w-full rounded-full ${esAdmin ? 'bg-blue-500' : 'bg-orange-500'}`} />
        </div>

        <button 
          onClick={() => navigate(esAdmin ? '/admin' : '/mis-datos')}
          className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-all shadow-xl active:scale-95 ${
            esAdmin ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-orange-500/30 bg-orange-500/10 text-orange-400'
          }`}
        >
          {usuario?.nombre?.charAt(0).toUpperCase()}
        </button>
      </nav>

      {/* Contenido Principal */}
      <main className="relative z-10 px-6 pt-8 pb-20 max-w-4xl mx-auto space-y-8">
        
        {/* Card de Bienvenida Premium */}
        <section className="animate-fadeIn">
          <div className={`p-8 rounded-[2rem] border relative overflow-hidden group transition-all duration-500 ${
            esAdmin ? 'bg-blue-900/10 border-blue-500/20' : 'bg-white/[0.03] border-white/10'
          }`}>
            <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 transition-opacity duration-500 opacity-30 group-hover:opacity-50 ${esAdmin ? 'bg-blue-600' : 'bg-orange-600'}`} />
            
            <div className="relative z-10">
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${
                esAdmin ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
              }`}>
                {esAdmin ? 'Dashboard Administrativo' : 'Socio Premium'}
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                Hola, {usuario?.nombre} <span className="inline-block animate-float">{esAdmin ? '⚡' : '🔥'}</span>
              </h1>
              <div className="flex items-center gap-2 opacity-60">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Conectado ahora</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid (Solo Admin o modo expandido) */}
        {esAdmin && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn delay-100">
            {[
              { label: 'Socios', val: stats.usuarios, icon: '👥' },
              { label: 'Turnos', val: stats.turnosHoy, icon: '📅' },
              { label: 'Checks', val: stats.completados, icon: '✅' },
              { label: 'Espera', val: stats.reservados, icon: '⏳' },
            ].map((s, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-5 rounded-[1.5rem] hover:bg-white/[0.05] transition-colors">
                <span className="text-lg mb-2 block">{s.icon}</span>
                <p className="text-2xl font-black">{s.val}</p>
                <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">{s.label}</p>
              </div>
            ))}
          </section>
        )}

        {/* Acciones Principales */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate(esAdmin ? '/admin' : '/turnos')}
            className={`group relative overflow-hidden p-6 rounded-[1.8rem] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] md:col-span-2 flex items-center justify-between shadow-2xl ${
              esAdmin ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/40'
            }`}
          >
            <div className="text-left">
              <p className="text-white font-black text-xl md:text-2xl">{esAdmin ? 'Administrar Gimnasio' : 'Reservar mi lugar'}</p>
              <p className="text-white/80 text-sm font-medium">{esAdmin ? 'Gestionar turnos y usuarios' : 'Asegura tu entrenamiento de hoy'}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">
              {esAdmin ? '🛠️' : '⚡'}
            </div>
          </button>

          {/* Cards Secundarias */}
          <div 
            onClick={() => navigate(esAdmin ? '/admin' : '/turnos')}
            className="p-6 rounded-[1.8rem] bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">🗓️</span>
              <span className="text-xs font-black opacity-30 group-hover:opacity-100 transition-opacity uppercase tracking-widest italic">Ver más</span>
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">
              {esAdmin ? 'Actividad Total' : 'Próxima Clase'}
            </p>
            <p className="text-xl font-black mt-1">
              {esAdmin ? `${stats.turnosHoy} Turnos Hoy` : (proximoTurno ? `${proximoTurno.hora?.slice(0,5)} hs` : 'Sin reservas')}
            </p>
          </div>

          <div 
            onClick={() => navigate(esAdmin ? '/admin' : '/mis-datos')}
            className="p-6 rounded-[1.8rem] bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">👤</span>
              <span className="text-xs font-black opacity-30 group-hover:opacity-100 transition-opacity uppercase tracking-widest italic">Gestionar</span>
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Mi Cuenta</p>
            <p className="text-xl font-black mt-1">Perfil y Ajustes</p>
          </div>
        </section>

      </main>

      {/* Menú Lateral Rediseñado */}
      {menuAbierto && (
        <div className="fixed inset-0 z-[100] flex animate-fadeIn">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setMenuAbierto(false)} />
          
          <aside className={`relative w-80 h-full flex flex-col shadow-2xl animate-slideInRight ${
            esAdmin ? 'bg-[#080d14] border-l border-blue-900/30' : 'bg-[#0f1117] border-l border-white/10'
          }`}>
            <div className="p-8 border-b border-white/5">
              <div className={`w-16 h-16 rounded-[1.3rem] flex items-center justify-center text-2xl font-black mb-4 shadow-2xl ${
                esAdmin ? 'bg-blue-600 shadow-blue-600/30' : 'bg-orange-500 shadow-orange-500/30'
              }`}>
                {usuario?.nombre?.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-xl font-black leading-none">{usuario?.nombre} {usuario?.apellido}</h3>
              <p className="text-xs opacity-40 mt-2 font-bold tracking-tight">{usuario?.email}</p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {(esAdmin ? [
                { label: 'Inicio', icon: '🏠', path: '/home' },
                { label: 'Gestión Admin', icon: '⚙️', path: '/admin' },
              ] : [
                { label: 'Inicio', icon: '🏠', path: '/home' },
                { label: 'Reservar Turno', icon: '📅', path: '/turnos' },
                { label: 'Mi Perfil', icon: '👤', path: '/mis-datos' },
              ]).map((item) => (
                <button 
                  key={item.path} 
                  onClick={() => { navigate(item.path); setMenuAbierto(false); }} 
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/[0.04] text-white/70 hover:text-white transition-all font-bold group"
                >
                  <span className="text-lg group-hover:scale-125 transition-transform">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-6 border-t border-white/5">
              <button 
                onClick={() => { logout(); navigate('/'); }} 
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest"
              >
                Cerrar Sesión 🚪
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
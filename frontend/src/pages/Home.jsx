import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Home() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [proximoTurno, setProximoTurno] = useState(null);
  const [stats, setStats] = useState({ usuarios: 0, turnosHoy: 0, reservados: 0 });

  const esAdmin = usuario?.rol === 'admin';

  useEffect(() => {
    const cargar = async () => {
      try {
        if (esAdmin) {
          const [u, t] = await Promise.all([
            api.get('/usuarios'),
            api.get('/turnos'),
          ]);
          const hoy = new Date().toISOString().split('T')[0];
          const turnosHoy = t.data.filter(t => t.fecha?.split('T')[0] === hoy);
          const reservados = turnosHoy.filter(t => t.estado === 'reservado').length;
          setStats({ usuarios: u.data.length, turnosHoy: turnosHoy.length, reservados });
        } else {
          const { data } = await api.get('/turnos/mis-turnos');
          const hoy = new Date().toISOString().split('T')[0];
          const proximo = data.find(t => t.estado === 'reservado' && t.fecha?.split('T')[0] >= hoy);
          setProximoTurno(proximo || null);
        }
      } catch {}
    };
    cargar();
  }, []);

  // Colores según rol
  const accent = esAdmin ? 'blue' : 'orange';
  const accentClasses = {
    orange: {
      glow1: 'bg-orange-500/10',
      glow2: 'bg-orange-500/8',
      glow3: 'bg-orange-500/5',
      avatar: 'bg-orange-500 shadow-orange-500/30',
      btn: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/25 hover:shadow-orange-500/30',
      card: 'hover:border-orange-500/50',
      cardText: 'text-orange-400 group-hover:text-orange-300',
      adminBtn: 'border-orange-500/25 hover:border-orange-500/60 hover:bg-orange-500/5 text-orange-400',
      badge: 'bg-orange-500',
    },
    blue: {
      glow1: 'bg-blue-500/10',
      glow2: 'bg-blue-500/8',
      glow3: 'bg-blue-500/5',
      avatar: 'bg-blue-500 shadow-blue-500/30',
      btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 hover:shadow-blue-500/30',
      card: 'hover:border-blue-500/50',
      cardText: 'text-blue-400 group-hover:text-blue-300',
      adminBtn: 'border-blue-500/25 hover:border-blue-500/60 hover:bg-blue-500/5 text-blue-400',
      badge: 'bg-blue-600',
    },
  }[accent];

  return (
    <div className="min-h-screen bg-[#0f1117] text-white overflow-hidden">

      {/* Fondo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={'absolute top-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full blur-[100px] animate-glow-pulse ' + accentClasses.glow1} />
        <div className={'absolute bottom-[-100px] right-[-60px] w-[300px] h-[300px] rounded-full blur-[80px] animate-glow-pulse ' + accentClasses.glow2} style={{animationDelay:'1.2s'}} />
        <div className={'absolute top-[40%] left-[60%] w-[200px] h-[200px] rounded-full blur-[60px] animate-glow-pulse ' + accentClasses.glow3} style={{animationDelay:'0.6s'}} />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between px-6 py-5 border-b border-white/5 animate-fadeIn">
        <button
          onClick={() => setMenuAbierto(true)}
          className="flex flex-col gap-[5px] p-2 rounded-lg hover:bg-white/5 transition-colors group"
        >
          <span className="block w-5 h-[2px] bg-white/60 group-hover:bg-white transition-colors"></span>
          <span className="block w-4 h-[2px] bg-white/60 group-hover:bg-white group-hover:w-5 transition-all duration-200"></span>
          <span className="block w-5 h-[2px] bg-white/60 group-hover:bg-white transition-colors"></span>
        </button>
        <span className="text-white font-bold tracking-widest text-sm">TCGYM</span>
        <div className={'w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ' + accentClasses.avatar}>
          {usuario?.nombre?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Contenido */}
      <div className="relative px-6 pt-8 pb-10 flex flex-col items-center max-w-sm mx-auto">

        {/* Saludo */}
        <div className="w-full mb-6 animate-fadeIn">
          <div className="bg-white/5 border border-white/8 rounded-2xl px-6 py-6 relative overflow-hidden">
            <div className={'absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none ' + accentClasses.glow1} />
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">
              {esAdmin ? 'Panel de control' : 'Bienvenido de vuelta'}
            </p>
            <h2 className="text-white text-3xl font-bold">{usuario?.nombre} {esAdmin ? '⚙️' : '👋'}</h2>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/30 text-xs font-medium">
                {esAdmin ? 'Administrador' : 'Activo'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats para admin */}
        {esAdmin && (
          <div className="grid grid-cols-3 gap-3 w-full mb-3 animate-fadeIn delay-100">
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4 text-center">
              <p className="text-white text-2xl font-bold">{stats.usuarios}</p>
              <p className="text-white/30 text-xs mt-1">Usuarios</p>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4 text-center">
              <p className="text-white text-2xl font-bold">{stats.turnosHoy}</p>
              <p className="text-white/30 text-xs mt-1">Hoy</p>
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4 text-center">
              <p className="text-white text-2xl font-bold">{stats.reservados}</p>
              <p className="text-white/30 text-xs mt-1">Pendientes</p>
            </div>
          </div>
        )}

        {/* Botón principal */}
        <button
          onClick={() => navigate(esAdmin ? '/admin' : '/turnos')}
          className={'animate-fadeIn w-full text-white font-semibold text-base py-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg ' + accentClasses.btn}
        >
          <span className="text-xl">{esAdmin ? '⚙️' : '📅'}</span>
          {esAdmin ? 'Ir al panel admin' : 'Reservar turno'}
        </button>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-3 w-full mt-3">
          {!esAdmin && (
            <div className="animate-fadeIn delay-200 bg-white/5 border border-white/8 hover:border-white/15 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5">
              <span className="text-2xl">🗓️</span>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider mt-3 mb-1">Próximo turno</p>
              <p className="text-white font-semibold text-sm">
                {proximoTurno ? `${proximoTurno.hora?.slice(0,5)}hs` : 'Sin turnos'}
              </p>
            </div>
          )}
          {esAdmin && (
            <div
              onClick={() => navigate('/admin')}
              className={'animate-fadeIn delay-200 bg-white/5 border border-white/8 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group ' + accentClasses.card}
            >
              <span className="text-2xl">👥</span>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider mt-3 mb-1">Usuarios</p>
              <p className={'font-semibold text-sm ' + accentClasses.cardText}>Ver todos →</p>
            </div>
          )}
          <div
            onClick={() => navigate(esAdmin ? '/admin' : '/mis-datos')}
            className={'animate-fadeIn delay-300 bg-white/5 border border-white/8 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group ' + accentClasses.card}
          >
            <span className="text-2xl">{esAdmin ? '📅' : '👤'}</span>
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider mt-3 mb-1">
              {esAdmin ? 'Turnos hoy' : 'Mi perfil'}
            </p>
            <p className={'font-semibold text-sm ' + accentClasses.cardText}>
              {esAdmin ? 'Ver turnos →' : 'Ver datos →'}
            </p>
          </div>
        </div>

        {/* Botón admin para usuario normal */}
        {!esAdmin && (
          <div
            onClick={() => navigate('/mis-datos')}
            className="animate-fadeIn delay-300 w-full mt-3 bg-white/5 border border-white/8 hover:border-white/15 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group"
          >
            <span className="text-2xl">👤</span>
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider mt-3 mb-1">Mi perfil</p>
            <p className="text-orange-400 font-semibold text-sm group-hover:text-orange-300 transition-colors">Ver datos →</p>
          </div>
        )}
      </div>

      {/* Menú lateral */}
      {menuAbierto && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/70 backdrop-blur-sm" onClick={() => setMenuAbierto(false)} />
          <div className="w-72 bg-[#0f1117] border-l border-white/8 h-full flex flex-col animate-slideInRight">
            <div className="px-6 py-8 border-b border-white/8 relative overflow-hidden">
              <div className={'absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none ' + accentClasses.glow1} />
              <div className={'w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg ' + accentClasses.avatar}>
                {usuario?.nombre?.charAt(0).toUpperCase()}
              </div>
              <p className="text-white font-bold text-lg">{usuario?.nombre} {usuario?.apellido}</p>
              <p className="text-white/40 text-sm mt-1">{usuario?.email}</p>
              {esAdmin && (
                <span className={'inline-block mt-2 text-white text-xs font-semibold px-3 py-1 rounded-full ' + accentClasses.badge}>
                  Administrador
                </span>
              )}
            </div>

            <div className="flex-1 py-2">
              {esAdmin ? (
                <>
                  {[
                    { label: 'Inicio', path: '/home' },
                    { label: 'Dashboard', path: '/admin' },
                    { label: 'Usuarios', path: '/admin' },
                    { label: 'Turnos', path: '/admin' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { navigate(item.path); setMenuAbierto(false); }}
                      className="w-full text-left px-6 py-4 text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center gap-3 text-sm font-medium group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{item.label}</span>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { label: 'Inicio', emoji: '🏠', path: '/home' },
                    { label: 'Reservar turno', emoji: '📅', path: '/turnos' },
                    { label: 'Mis datos', emoji: '👤', path: '/mis-datos' },
                  ].map((item) => (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setMenuAbierto(false); }}
                      className="w-full text-left px-6 py-4 text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center gap-3 text-sm font-medium group"
                    >
                      <span className="text-base">{item.emoji}</span>
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{item.label}</span>
                    </button>
                  ))}
                </>
              )}
            </div>

            <div className="border-t border-white/8 p-4">
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/8 rounded-xl transition-colors text-sm font-medium flex items-center gap-3"
              >
                <span>🚪</span> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
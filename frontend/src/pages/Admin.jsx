import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Admin() {
  const [seccion, setSeccion] = useState('dashboard');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { cargarDatos(); }, []);

  const marcarEstado = async (id, estado) => {
  try {
    await api.patch('/turnos/' + id + '/estado', { estado });
    setTurnos(turnos.map(t => t.id === id ? { ...t, estado } : t));
  } catch {}
};

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [u, t] = await Promise.all([api.get('/usuarios'), api.get('/turnos')]);
      setUsuarios(u.data);
      setTurnos(t.data);
    } catch {}
    finally { setCargando(false); }
  };

  const eliminarUsuario = async (id) => {
    if (!confirm('¿Seguro?')) return;
    try {
      await api.delete('/usuarios/' + id);
      setUsuarios(usuarios.filter(u => u.id !== id));
    } catch {}
  };

  const cancelarTurno = async (id) => {
    try {
      await api.patch('/turnos/' + id + '/cancelar');
      setTurnos(turnos.map(t => t.id === id ? { ...t, estado: 'cancelado' } : t));
    } catch {}
  };

  const hoy = new Date().toISOString().split('T')[0];
  const turnosHoy = turnos.filter(t => t.fecha?.split('T')[0] === hoy);
  const reservadosHoy = turnosHoy.filter(t => t.estado === 'reservado').length;
  const ocupacion = Math.round((reservadosHoy / 150) * 100);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white overflow-hidden">

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-100px] left-[-80px] w-[350px] h-[350px] bg-orange-500/8 rounded-full blur-[100px] animate-glow-pulse" />
        <div className="absolute bottom-[-80px] right-[-60px] w-[250px] h-[250px] bg-orange-500/6 rounded-full blur-[80px] animate-glow-pulse" style={{animationDelay:'1.2s'}} />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between px-6 py-5 border-b border-white/5 animate-fadeIn">
        <button onClick={() => setMenuAbierto(true)} className="flex flex-col gap-[5px] p-2 rounded-lg hover:bg-white/5 transition-colors group">
          <span className="block w-5 h-[2px] bg-white/60 group-hover:bg-white transition-colors" />
          <span className="block w-4 h-[2px] bg-white/60 group-hover:bg-white group-hover:w-5 transition-all duration-200" />
          <span className="block w-5 h-[2px] bg-white/60 group-hover:bg-white transition-colors" />
        </button>
        <div className="text-center">
          <span className="text-white font-bold tracking-widest text-sm">TCGYM</span>
          <p className="text-orange-400 text-xs font-medium">Panel Admin</p>
        </div>
        <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/30">
          {usuario?.nombre?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Tabs */}
      <div className="relative flex gap-2 px-6 py-4">
        {[
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'usuarios', label: 'Usuarios (' + usuarios.length + ')' },
          { key: 'turnos', label: 'Turnos (' + turnosHoy.length + ')' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSeccion(tab.key)}
            className={'px-4 py-2 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all duration-200 ' + (seccion === tab.key ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' : 'bg-white/5 text-white/40 hover:text-white border border-white/8')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative px-6 pb-10 max-w-sm mx-auto">
        {cargando ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div>

            {/* DASHBOARD */}
            {seccion === 'dashboard' && (
              <div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Usuarios', valor: usuarios.length },
                    { label: 'Turnos hoy', valor: turnosHoy.length },
                    { label: 'Ocupacion', valor: ocupacion + '%' },
                    { label: 'Reservados', valor: reservadosHoy },
                  ].map((stat, i) => (
                    <div key={stat.label} className="animate-fadeIn bg-white/5 border border-white/8 rounded-2xl p-5" style={{ animationDelay: i * 0.05 + 's' }}>
                      <p className="text-3xl font-bold text-white">{stat.valor}</p>
                      <p className="text-white/40 text-xs font-medium uppercase tracking-wider mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">Turnos de hoy</p>
                <div className="space-y-2">
                  {turnosHoy.length === 0 && (
                    <p className="text-white/20 text-sm text-center py-6">Sin turnos hoy</p>
                  )}
                  {turnosHoy.map((turno, i) => (
  <div key={turno.id} className="animate-fadeIn bg-white/5 border border-white/8 rounded-2xl px-5 py-4" style={{ animationDelay: i * 0.05 + 's' }}>
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-white font-semibold text-sm">{turno.nombre} {turno.apellido}</p>
        <p className="text-white/30 text-xs mt-0.5">{turno.hora?.slice(0, 5)}hs</p>
      </div>
      <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + (turno.estado === 'reservado' ? 'bg-orange-500/15 text-orange-400' : turno.estado === 'completado' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400')}>
        {turno.estado}
      </span>
    </div>
    {turno.estado === 'reservado' && (
      <div className="flex gap-2">
        <button
          onClick={() => marcarEstado(turno.id, 'completado')}
          className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-semibold py-2.5 rounded-xl transition-colors"
        >
          ✓ Asistió
        </button>
        <button
          onClick={() => cancelarTurno(turno.id)}
          className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold py-2.5 rounded-xl transition-colors"
        >
          ✕ No asistió
        </button>
      </div>
    )}
  </div>
))}
                </div>
              </div>
            )}

            {/* USUARIOS */}
            {seccion === 'usuarios' && (
              <div className="space-y-2">
                {usuarios.map((u, i) => (
                  <div key={u.id} className="animate-fadeIn bg-white/5 border border-white/8 rounded-2xl px-5 py-4 transition-all" style={{ animationDelay: i * 0.05 + 's' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {u.nombre.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">{u.nombre} {u.apellido}</p>
                        <p className="text-white/30 text-xs truncate mt-0.5">{u.email}</p>
                      </div>
                      {u.rol !== 'admin' && (
                        <button onClick={() => eliminarUsuario(u.id)} className="text-white/20 hover:text-red-400 transition-colors text-sm font-bold shrink-0">
                          x
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {u.peso && (
                        <span className="bg-white/5 text-white/40 text-xs px-3 py-1 rounded-full">{u.peso} kg</span>
                      )}
                      {u.estatura && (
                        <span className="bg-white/5 text-white/40 text-xs px-3 py-1 rounded-full">{u.estatura} cm</span>
                      )}
                      {u.peso && u.estatura && (
                        <span className="bg-white/5 text-white/40 text-xs px-3 py-1 rounded-full">
                          IMC {(u.peso / Math.pow(u.estatura / 100, 2)).toFixed(1)}
                        </span>
                      )}
                      {u.rutina_archivo ? (
                        <a href={'http://localhost:3001/uploads/' + u.rutina_archivo} target="_blank" rel="noreferrer" className="bg-orange-500/10 text-orange-400 text-xs px-3 py-1 rounded-full">
                          Ver rutina
                        </a>
                      ) : (
                        <span className="bg-white/5 text-white/20 text-xs px-3 py-1 rounded-full">Sin rutina</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TURNOS */}
            {seccion === 'turnos' && (
              <div className="space-y-2">
                {turnosHoy.length === 0 && (
                  <p className="text-white/20 text-sm text-center py-6">Sin turnos hoy</p>
                )}
                {turnosHoy.map((turno, i) => (
                  <div key={turno.id} className="animate-fadeIn bg-white/5 border border-white/8 rounded-2xl px-5 py-4" style={{ animationDelay: i * 0.05 + 's' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-semibold text-sm">{turno.nombre} {turno.apellido}</p>
                        <p className="text-white/30 text-xs mt-0.5">{turno.hora?.slice(0, 5)}hs</p>
                      </div>
                      <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + (turno.estado === 'reservado' ? 'bg-orange-500/15 text-orange-400' : turno.estado === 'completado' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400')}>
                        {turno.estado}
                      </span>
                    </div>
                    {turno.estado === 'reservado' && (
                      <button onClick={() => cancelarTurno(turno.id)} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold py-2.5 rounded-xl transition-colors">
                        Cancelar turno
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>

      {/* Menu lateral */}
      {menuAbierto && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/70 backdrop-blur-sm" onClick={() => setMenuAbierto(false)} />
          <div className="w-72 bg-[#0f1117] border-l border-white/8 h-full flex flex-col animate-slideInRight">
            <div className="px-6 py-8 border-b border-white/8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg shadow-orange-500/30">
                {usuario?.nombre?.charAt(0).toUpperCase()}
              </div>
              <p className="text-white font-bold text-lg">{usuario?.nombre} {usuario?.apellido}</p>
              <p className="text-white/40 text-sm mt-1">{usuario?.email}</p>
              <span className="inline-block mt-2 bg-orange-500/15 text-orange-400 text-xs font-semibold px-3 py-1 rounded-full">
                Administrador
              </span>
            </div>
            <div className="flex-1 py-2">
              {[
                { label: 'Dashboard', key: 'dashboard' },
                { label: 'Usuarios', key: 'usuarios' },
                { label: 'Turnos', key: 'turnos' },
              ].map((item) => (
                <button key={item.key} onClick={() => { setSeccion(item.key); setMenuAbierto(false); }} className="w-full text-left px-6 py-4 text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
                  {item.label}
                </button>
              ))}
              <button onClick={() => { navigate('/home'); setMenuAbierto(false); }} className="w-full text-left px-6 py-4 text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">
                Ir al Home
              </button>
            </div>
            <div className="border-t border-white/8 p-4">
              <button onClick={() => { logout(); navigate('/'); }} className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/8 rounded-xl transition-colors text-sm font-medium">
                Cerrar sesion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
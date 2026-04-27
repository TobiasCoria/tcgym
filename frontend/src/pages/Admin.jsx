import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CalendarioTurnos from '../pages/Calendarioturnos';

export default function Admin() {
  const [seccion, setSeccion] = useState('dashboard');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [u, t] = await Promise.all([api.get('/usuarios'), api.get('/turnos')]);
      setUsuarios(u.data);
      setTurnos(t.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const eliminarUsuario = async (id) => {
    if (!confirm('¿Seguro que querés eliminar este usuario?')) return;
    try {
      await api.delete('/usuarios/' + id);
      setUsuarios(usuarios.filter(u => u.id !== id));
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const cancelarTurno = async (id) => {
    try {
      await api.patch('/turnos/' + id + '/cancelar');
      setTurnos(turnos.map(t => t.id === id ? { ...t, estado: 'cancelado' } : t));
    } catch (err) {
      alert('Error al cancelar turno');
    }
  };

  const marcarEstado = async (id, estado) => {
    try {
      await api.patch('/turnos/' + id + '/estado', { estado });
      setTurnos(turnos.map(t => t.id === id ? { ...t, estado } : t));
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const hoy = new Date().toISOString().split('T')[0];
  const turnosHoy = turnos.filter(t => t.fecha?.split('T')[0] === hoy);
  const reservadosHoy = turnosHoy.filter(t => t.estado === 'reservado').length;
  const completadosHoy = turnosHoy.filter(t => t.estado === 'completado').length;
  const canceladosHoy = turnosHoy.filter(t => t.estado === 'cancelado').length;
  const ocupacion = Math.round((reservadosHoy / 150) * 100);

  const STATS = [
    { label: 'Usuarios', valor: usuarios.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Turnos hoy', valor: turnosHoy.length, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Asistieron', valor: completadosHoy, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Cancelados', valor: canceladosHoy, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Pendientes', valor: reservadosHoy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Ocupación', valor: ocupacion + '%', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] text-white overflow-hidden">

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-100px] left-[-80px] w-[350px] h-[350px] bg-orange-500/8 rounded-full blur-[100px] animate-glow-pulse" />
        <div className="absolute bottom-[-80px] right-[-60px] w-[250px] h-[250px] bg-orange-500/6 rounded-full blur-[80px] animate-glow-pulse" style={{animationDelay:'1.2s'}} />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => setMenuAbierto(true)} className="flex flex-col gap-[5px] p-2 rounded-lg hover:bg-white/5 transition-colors group md:hidden">
            <span className="block w-5 h-[2px] bg-white/60 group-hover:bg-white transition-colors" />
            <span className="block w-4 h-[2px] bg-white/60 group-hover:bg-white transition-all duration-200" />
            <span className="block w-5 h-[2px] bg-white/60 group-hover:bg-white transition-colors" />
          </button>
          <div>
            <span className="text-white font-bold tracking-widest text-sm">TCGYM</span>
            <p className="text-orange-400 text-xs font-medium">Panel Admin</p>
          </div>
        </div>

        {/* Tabs desktop */}
        <div className="hidden md:flex gap-2">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'usuarios', label: 'Usuarios (' + usuarios.length + ')' },
            { key: 'turnos', label: 'Turnos (' + turnosHoy.length + ')' },
            { key: 'calendario', label: 'Calendario' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSeccion(tab.key)}
              className={`px-4 py-2 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all duration-200 ${
                seccion === tab.key 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
                  : 'bg-white/5 text-white/40 hover:text-white border border-white/8'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="hidden md:block text-white/40 hover:text-white text-xs font-medium transition-colors">
            Ir al Home
          </button>
          <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/30">
            {usuario?.nombre?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Tabs mobile */}
      <div className="md:hidden flex gap-2 px-6 py-4">
        {[
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'usuarios', label: 'Usuarios' },
          { key: 'turnos', label: 'Turnos' },
          { key: 'calendario', label: 'Calendario' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSeccion(tab.key)}
            className={`px-4 py-2 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all duration-200 ${
              seccion === tab.key 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
                : 'bg-white/5 text-white/40 hover:text-white border border-white/8'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="relative px-6 pb-10 md:max-w-6xl md:mx-auto">
        {cargando ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div>

            {/* DASHBOARD */}
            {seccion === 'dashboard' && (
              <div>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
                  {STATS.map((stat, i) => (
                    <div key={stat.label} className={`animate-fadeIn border border-white/8 rounded-2xl p-5 ${stat.bg}`} style={{ animationDelay: i * 0.05 + 's' }}>
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.valor}</p>
                      <p className="text-white/40 text-xs font-medium uppercase tracking-wider mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-4">Turnos de hoy</p>

                {/* === TABLA DESKTOP MEJORADA === */}
                <div className="hidden md:block bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-8 py-5 text-white/50 text-xs font-semibold uppercase tracking-widest">Usuario</th>
                        <th className="text-left px-8 py-5 text-white/50 text-xs font-semibold uppercase tracking-widest">Hora</th>
                        <th className="text-left px-8 py-5 text-white/50 text-xs font-semibold uppercase tracking-widest">Estado</th>
                        <th className="text-left px-8 py-5 text-white/50 text-xs font-semibold uppercase tracking-widest">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {turnosHoy.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center py-12 text-white/30 text-sm">Sin turnos hoy</td>
                        </tr>
                      )}
                      {turnosHoy.map((turno) => (
                        <tr key={turno.id} className="hover:bg-white/5 transition-all duration-200 group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-inner">
                                {turno.nombre?.charAt(0)}{turno.apellido?.charAt(0)}
                              </div>
                              <p className="font-semibold text-white">{turno.nombre} {turno.apellido}</p>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-white/70 font-medium">{turno.hora?.slice(0, 5)} hs</td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-2xl text-xs font-semibold tracking-wide border
                              ${turno.estado === 'completado' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                                turno.estado === 'cancelado' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                                'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                              {turno.estado === 'completado' ? '✓ Asistió' : 
                               turno.estado === 'cancelado' ? '✕ Cancelado' : 'Reservado'}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            {turno.estado === 'reservado' && (
                              <div className="flex gap-3">
                                <button 
                                  onClick={() => marcarEstado(turno.id, 'completado')}
                                  className="px-5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-2xl transition-all active:scale-95"
                                >
                                  ✓ Asistió
                                </button>
                                <button 
                                  onClick={() => cancelarTurno(turno.id)}
                                  className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-2xl transition-all active:scale-95"
                                >
                                  ✕ Cancelar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards (mantengo por ahora, pero se pueden mejorar después) */}
                <div className="md:hidden space-y-3">
                  {turnosHoy.length === 0 && <p className="text-white/20 text-sm text-center py-8">Sin turnos hoy</p>}
                  {turnosHoy.map((turno) => (
                    <div key={turno.id} className="bg-white/5 border border-white/10 rounded-3xl p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-white">{turno.nombre} {turno.apellido}</p>
                          <p className="text-white/50 text-sm mt-1">{turno.hora?.slice(0, 5)} hs</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-2xl text-xs font-medium
                          ${turno.estado === 'completado' ? 'bg-emerald-500/20 text-emerald-400' : 
                            turno.estado === 'cancelado' ? 'bg-red-500/20 text-red-400' : 
                            'bg-orange-500/20 text-orange-400'}`}>
                          {turno.estado === 'completado' ? '✓ Asistió' : turno.estado === 'cancelado' ? '✕ Cancelado' : 'Reservado'}
                        </span>
                      </div>

                      {turno.estado === 'reservado' && (
                        <div className="flex gap-3 mt-5">
                          <button onClick={() => marcarEstado(turno.id, 'completado')} className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-3 rounded-2xl text-sm font-medium transition-colors">
                            ✓ Asistió
                          </button>
                          <button onClick={() => cancelarTurno(turno.id)} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-2xl text-sm font-medium transition-colors">
                            ✕ Cancelar
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
              <div>
                {/* Desktop tabla mejorada */}
                <div className="hidden md:block bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-8 py-5 text-white/50 text-xs font-semibold uppercase tracking-widest">Usuario</th>
                        <th className="text-left px-8 py-5 text-white/50 text-xs font-semibold uppercase tracking-widest">Documento</th>
                        <th className="text-left px-8 py-5 text-white/50 text-xs font-semibold uppercase tracking-widest">Datos Físicos</th>
                        <th className="text-left px-8 py-5 text-white/50 text-xs font-semibold uppercase tracking-widest">Rutina</th>
                        <th className="text-left px-8 py-5 text-white/50 text-xs font-semibold uppercase tracking-widest">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {usuarios.map((u) => (
                        <tr key={u.id} className="hover:bg-white/5 transition-all duration-200">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-inner">
                                {u.nombre.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{u.nombre} {u.apellido}</p>
                                <p className="text-white/40 text-sm">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-white/70">{u.documento}</td>
                          <td className="px-8 py-5">
                            <div className="flex flex-wrap gap-2">
                              {u.peso && <span className="bg-white/5 px-3.5 py-1 rounded-2xl text-xs text-white/70">{u.peso} kg</span>}
                              {u.estatura && <span className="bg-white/5 px-3.5 py-1 rounded-2xl text-xs text-white/70">{u.estatura} cm</span>}
                              {u.peso && u.estatura && (
                                <span className="bg-white/5 px-3.5 py-1 rounded-2xl text-xs text-white/70">
                                  IMC {(u.peso / Math.pow(u.estatura / 100, 2)).toFixed(1)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            {u.rutina_archivo ? (
                              <a href={'https://tcgym.onrender.com/uploads/' + u.rutina_archivo} target="_blank" rel="noreferrer" 
                                 className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-5 py-2 rounded-2xl text-sm font-medium transition-colors inline-flex items-center gap-2">
                                Ver rutina →
                              </a>
                            ) : (
                              <span className="text-white/30 text-sm">Sin rutina</span>
                            )}
                          </td>
                          <td className="px-8 py-5">
                            {u.rol !== 'admin' && (
                              <button onClick={() => eliminarUsuario(u.id)} className="text-red-400 hover:text-red-300 font-medium transition-colors">
                                Eliminar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards usuarios */}
                <div className="md:hidden space-y-3">
                  {usuarios.map((u) => (
                    <div key={u.id} className="bg-white/5 border border-white/10 rounded-3xl p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                          {u.nombre.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white">{u.nombre} {u.apellido}</p>
                          <p className="text-white/40 text-sm truncate">{u.email}</p>
                        </div>
                        {u.rol !== 'admin' && (
                          <button onClick={() => eliminarUsuario(u.id)} className="text-red-400 hover:text-red-300 text-xl font-light">×</button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {u.peso && <span className="bg-white/5 px-4 py-1.5 rounded-2xl text-xs">{u.peso} kg</span>}
                        {u.estatura && <span className="bg-white/5 px-4 py-1.5 rounded-2xl text-xs">{u.estatura} cm</span>}
                        {u.peso && u.estatura && (
                          <span className="bg-white/5 px-4 py-1.5 rounded-2xl text-xs">
                            IMC {(u.peso / Math.pow(u.estatura / 100, 2)).toFixed(1)}
                          </span>
                        )}
                        {u.rutina_archivo ? (
                          <a href={'https://tcgym.onrender.com/uploads/' + u.rutina_archivo} target="_blank" rel="noreferrer" 
                             className="bg-orange-500/10 text-orange-400 px-4 py-1.5 rounded-2xl text-xs font-medium">
                            Ver rutina
                          </a>
                        ) : (
                          <span className="bg-white/5 text-white/40 px-4 py-1.5 rounded-2xl text-xs">Sin rutina</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TURNOS */}
            {seccion === 'turnos' && (
              <div>
                <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-4">Todos los turnos de hoy</p>
                
                {/* Reutilizamos la misma tabla mejorada del dashboard */}
                <div className="hidden md:block bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-8 py-5 text-white/50 text-xs font-semibold uppercase tracking-widest">Usuario</th>
                        <th className="text-left px-8 py-5 text-white/50 text-xs font-semibold uppercase tracking-widest">Hora</th>
                        <th className="text-left px-8 py-5 text-white/50 text-xs font-semibold uppercase tracking-widest">Estado</th>
                        <th className="text-left px-8 py-5 text-white/50 text-xs font-semibold uppercase tracking-widest">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {turnosHoy.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-12 text-white/30">Sin turnos hoy</td></tr>
                      )}
                      {turnosHoy.map((turno) => (
                        <tr key={turno.id} className="hover:bg-white/5 transition-all duration-200 group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-inner">
                                {turno.nombre?.charAt(0)}{turno.apellido?.charAt(0)}
                              </div>
                              <p className="font-semibold text-white">{turno.nombre} {turno.apellido}</p>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-white/70 font-medium">{turno.hora?.slice(0, 5)} hs</td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-2xl text-xs font-semibold tracking-wide border
                              ${turno.estado === 'completado' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                                turno.estado === 'cancelado' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                                'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                              {turno.estado === 'completado' ? '✓ Asistió' : turno.estado === 'cancelado' ? '✕ Cancelado' : 'Reservado'}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            {turno.estado === 'reservado' && (
                              <div className="flex gap-3">
                                <button onClick={() => marcarEstado(turno.id, 'completado')} className="px-5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-2xl transition-all active:scale-95">
                                  ✓ Asistió
                                </button>
                                <button onClick={() => cancelarTurno(turno.id)} className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-2xl transition-all active:scale-95">
                                  ✕ Cancelar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards para Turnos */}
                <div className="md:hidden space-y-3">
                  {turnosHoy.length === 0 && <p className="text-white/20 text-sm text-center py-8">Sin turnos hoy</p>}
                  {turnosHoy.map((turno) => (
                    <div key={turno.id} className="bg-white/5 border border-white/10 rounded-3xl p-5">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-semibold">{turno.nombre} {turno.apellido}</p>
                          <p className="text-white/50 text-sm mt-1">{turno.hora?.slice(0, 5)} hs</p>
                        </div>
                        <span className={`px-4 py-1 rounded-2xl text-xs font-medium ${turno.estado === 'completado' ? 'bg-emerald-500/20 text-emerald-400' : turno.estado === 'cancelado' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          {turno.estado === 'completado' ? '✓ Asistió' : turno.estado === 'cancelado' ? '✕ Cancelado' : 'Reservado'}
                        </span>
                      </div>
                      {turno.estado === 'reservado' && (
                        <div className="grid grid-cols-2 gap-3 mt-5">
                          <button onClick={() => marcarEstado(turno.id, 'completado')} className="py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-2xl text-sm font-medium">✓ Asistió</button>
                          <button onClick={() => cancelarTurno(turno.id)} className="py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl text-sm font-medium">✕ Cancelar</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CALENDARIO */}
            {seccion === 'calendario' && (
              <div>
                <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-4">Calendario de Turnos</p>
                <CalendarioTurnos />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Menú lateral mobile */}
      {menuAbierto && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="flex-1 bg-black/70 backdrop-blur-sm" onClick={() => setMenuAbierto(false)} />
          <div className="w-72 bg-[#0f1117] border-l border-white/8 h-full flex flex-col animate-slideInRight">
            <div className="px-6 py-8 border-b border-white/8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-4 shadow-lg shadow-orange-500/30">
                {usuario?.nombre?.charAt(0).toUpperCase()}
              </div>
              <p className="text-white font-bold text-lg">{usuario?.nombre} {usuario?.apellido}</p>
              <p className="text-white/40 text-sm mt-1">{usuario?.email}</p>
              <span className="inline-block mt-2 bg-orange-500/15 text-orange-400 text-xs font-semibold px-3 py-1 rounded-full">Administrador</span>
            </div>
            <div className="flex-1 py-2">
              {[
                { label: 'Dashboard', key: 'dashboard' },
                { label: 'Usuarios', key: 'usuarios' },
                { label: 'Turnos', key: 'turnos' },
                { label: 'Calendario', key: 'calendario' },
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
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
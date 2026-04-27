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
      alert('Error al eliminar usuario');
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

      {/* Background glows */}
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
              className={`px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                seccion === tab.key 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="hidden md:block text-white/50 hover:text-white text-sm transition-colors">
            Ir al Home
          </button>
          <div className="w-9 h-9 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
            {usuario?.nombre?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Tabs mobile */}
      <div className="md:hidden flex gap-2 px-6 py-4 border-b border-white/10">
        {[
          { key: 'dashboard', label: 'Dashboard' },
          { key: 'usuarios', label: 'Usuarios' },
          { key: 'turnos', label: 'Turnos' },
          { key: 'calendario', label: 'Calendario' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSeccion(tab.key)}
            className={`px-4 py-2 rounded-2xl font-medium text-sm transition-all ${
              seccion === tab.key 
                ? 'bg-orange-500 text-white' 
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="relative px-6 pb-12 md:max-w-6xl md:mx-auto pt-6">
        {cargando ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div>

            {/* DASHBOARD */}
            {seccion === 'dashboard' && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-10">
                  {STATS.map((stat, i) => (
                    <div key={i} className={`rounded-3xl p-6 border border-white/10 ${stat.bg} transition-all hover:scale-105`}>
                      <p className={`text-4xl font-bold ${stat.color}`}>{stat.valor}</p>
                      <p className="text-white/50 text-sm mt-2 tracking-wide">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-medium">Turnos de Hoy</p>

                {/* Tabla Premium - Turnos Hoy */}
                <div className="hidden md:block bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-8 py-6 text-white/50 text-sm font-semibold">Usuario</th>
                        <th className="text-left px-8 py-6 text-white/50 text-sm font-semibold">Hora</th>
                        <th className="text-left px-8 py-6 text-white/50 text-sm font-semibold">Estado</th>
                        <th className="text-left px-8 py-6 text-white/50 text-sm font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {turnosHoy.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-16 text-white/30">No hay turnos para hoy</td></tr>
                      ) : (
                        turnosHoy.map((turno) => (
                          <tr key={turno.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white font-bold">
                                  {turno.nombre?.[0]}{turno.apellido?.[0]}
                                </div>
                                <div>
                                  <p className="font-semibold text-white">{turno.nombre} {turno.apellido}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-white/70 font-medium">{turno.hora?.slice(0,5)} hs</td>
                            <td className="px-8 py-6">
                              <span className={`px-5 py-2 rounded-2xl text-sm font-medium inline-block
                                ${turno.estado === 'completado' ? 'bg-emerald-500/20 text-emerald-400' :
                                  turno.estado === 'cancelado' ? 'bg-red-500/20 text-red-400' :
                                  'bg-orange-500/20 text-orange-400'}`}>
                                {turno.estado === 'completado' ? '✓ Asistió' : turno.estado === 'cancelado' ? '✕ Cancelado' : 'Reservado'}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              {turno.estado === 'reservado' && (
                                <div className="flex gap-3">
                                  <button onClick={() => marcarEstado(turno.id, 'completado')} 
                                    className="px-6 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-2xl text-sm font-medium transition-all">
                                    ✓ Asistió
                                  </button>
                                  <button onClick={() => cancelarTurno(turno.id)} 
                                    className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl text-sm font-medium transition-all">
                                    ✕ Cancelar
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* USUARIOS - Tabla Premium */}
            {seccion === 'usuarios' && (
              <div>
                <div className="hidden md:block bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-8 py-6 text-white/50 text-sm font-semibold">Usuario</th>
                        <th className="text-left px-8 py-6 text-white/50 text-sm font-semibold">Documento</th>
                        <th className="text-left px-8 py-6 text-white/50 text-sm font-semibold">Datos Físicos</th>
                        <th className="text-left px-8 py-6 text-white/50 text-sm font-semibold">Rutina</th>
                        <th className="text-left px-8 py-6 text-white/50 text-sm font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {usuarios.map((u) => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                                {u.nombre?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold">{u.nombre} {u.apellido}</p>
                                <p className="text-white/50 text-sm">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-white/70">{u.documento}</td>
                          <td className="px-8 py-6">
                            <div className="flex gap-2">
                              {u.peso && <span className="bg-white/10 px-4 py-1.5 rounded-2xl text-sm">{u.peso}kg</span>}
                              {u.estatura && <span className="bg-white/10 px-4 py-1.5 rounded-2xl text-sm">{u.estatura}cm</span>}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            {u.rutina_archivo ? (
                              <a href={`https://tcgym.onrender.com/uploads/${u.rutina_archivo}`} target="_blank" rel="noreferrer" 
                                 className="text-orange-400 hover:text-orange-300 font-medium">Ver rutina →</a>
                            ) : (
                              <span className="text-white/40">Sin rutina</span>
                            )}
                          </td>
                          <td className="px-8 py-6">
                            {u.rol !== 'admin' && (
                              <button onClick={() => eliminarUsuario(u.id)} className="text-red-400 hover:text-red-500">Eliminar</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TURNOS */}
            {seccion === 'turnos' && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-medium">Turnos de Hoy</p>
                <div className="hidden md:block bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-8 py-6 text-white/50 text-sm font-semibold">Usuario</th>
                        <th className="text-left px-8 py-6 text-white/50 text-sm font-semibold">Hora</th>
                        <th className="text-left px-8 py-6 text-white/50 text-sm font-semibold">Estado</th>
                        <th className="text-left px-8 py-6 text-white/50 text-sm font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {turnosHoy.map((turno) => (
                        <tr key={turno.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center text-white font-bold">
                                {turno.nombre?.[0]}{turno.apellido?.[0]}
                              </div>
                              <p className="font-semibold">{turno.nombre} {turno.apellido}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-white/70 font-medium">{turno.hora?.slice(0,5)} hs</td>
                          <td className="px-8 py-6">
                            <span className={`px-5 py-2 rounded-2xl text-sm font-medium
                              ${turno.estado === 'completado' ? 'bg-emerald-500/20 text-emerald-400' : 
                                turno.estado === 'cancelado' ? 'bg-red-500/20 text-red-400' : 
                                'bg-orange-500/20 text-orange-400'}`}>
                              {turno.estado === 'completado' ? '✓ Asistió' : turno.estado === 'cancelado' ? '✕ Cancelado' : 'Reservado'}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            {turno.estado === 'reservado' && (
                              <div className="flex gap-3">
                                <button onClick={() => marcarEstado(turno.id, 'completado')} className="px-6 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-2xl text-sm">✓ Asistió</button>
                                <button onClick={() => cancelarTurno(turno.id)} className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl text-sm">✕ Cancelar</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CALENDARIO */}
            {seccion === 'calendario' && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-widest mb-4 font-medium">Calendario</p>
                <CalendarioTurnos />
              </div>
            )}

          </div>
        )}
      </div>

      {/* Menú móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="flex-1 bg-black/70" onClick={() => setMenuAbierto(false)} />
          <div className="w-72 bg-[#0f1117] h-full flex flex-col">
            {/* ... tu menú móvil actual ... */}
          </div>
        </div>
      )}
    </div>
  );
}
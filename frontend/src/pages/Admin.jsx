import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CalendarioTurnos from '../pages/Calendarioturnos';

export default function Admin() {
  const [seccion, setSeccion] = useState('dashboard');
  const [usuarios, setUsuarios] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [u, t] = await Promise.all([api.get('/usuarios'), api.get('/turnos')]);
      setUsuarios(u.data);
      setTurnos(t.data);
    } catch (err) { console.error(err); } 
    finally { setCargando(false); }
  };

  const hoy = new Date().toISOString().split('T')[0];
  const turnosHoy = turnos.filter(t => t.fecha?.split('T')[0] === hoy);
  const reservadosHoy = turnosHoy.filter(t => t.estado === 'reservado').length;
  const completadosHoy = turnosHoy.filter(t => t.estado === 'completado').length;
  const canceladosHoy = turnosHoy.filter(t => t.estado === 'cancelado').length;
  const ocupacion = Math.round((reservadosHoy / 150) * 100);

  const STATS = [
    { label: 'Usuarios Activos', valor: usuarios.length, icon: '👥', color: 'from-blue-500 to-cyan-400' },
    { label: 'Turnos Hoy', valor: turnosHoy.length, icon: '📅', color: 'from-orange-600 to-amber-400' },
    { label: 'Check-in', valor: completadosHoy, icon: '✅', color: 'from-emerald-600 to-teal-400' },
    { label: 'Cancelados', valor: canceladosHoy, icon: '🚫', color: 'from-red-600 to-rose-400' },
    { label: 'Pendientes', valor: reservadosHoy, icon: '⏳', color: 'from-yellow-600 to-orange-400' },
    { label: 'Ocupación', valor: ocupacion + '%', icon: '📈', color: 'from-purple-600 to-fuchsia-400' },
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-white flex flex-col md:flex-row">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-72 border-r border-white/[0.05] bg-[#080a0f] p-6 space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center font-black shadow-lg shadow-orange-600/20">TC</div>
          <div>
            <h1 className="text-sm font-black tracking-tighter uppercase">TCGYM <span className="text-orange-500">PRO</span></h1>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Command Center</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'usuarios', label: 'Usuarios', icon: '👤', count: usuarios.length },
            { id: 'turnos', label: 'Turnos Hoy', icon: '🕒', count: turnosHoy.length },
            { id: 'calendario', label: 'Calendario', icon: '🗓️' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSeccion(item.id)}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest ${
                seccion === item.id ? 'bg-orange-600 text-white shadow-xl shadow-orange-600/10' : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3"><span>{item.icon}</span> {item.label}</span>
              {item.count !== undefined && <span className="bg-white/10 px-2 py-1 rounded-lg text-[10px]">{item.count}</span>}
            </button>
          ))}
        </nav>

        <button onClick={() => navigate('/home')} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
          ← Volver al Terminal
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto relative h-screen">
        {/* Glow Effects */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[120px] pointer-events-none" />

        <header className="sticky top-0 z-40 backdrop-blur-md bg-[#05070a]/80 border-b border-white/[0.05] px-8 py-6 flex items-center justify-between md:hidden">
          <h2 className="font-black uppercase text-xs tracking-widest text-orange-500">Admin Panel</h2>
          <div className="w-8 h-8 rounded-full bg-orange-600" />
        </header>

        <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-10">
          
          {cargando ? (
            <div className="h-[60vh] flex flex-col items-center justify-center animate-pulse">
              <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[.4em] text-white/20">Cargando Protocolos</p>
            </div>
          ) : (
            <div className="animate-fadeIn">
              
              {/* SECTION: DASHBOARD */}
              {seccion === 'dashboard' && (
                <div className="space-y-10">
                  <header>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">Sistema de <span className="text-orange-500">Métricas</span></h1>
                    <p className="text-white/30 text-xs font-bold uppercase tracking-widest mt-2 italic">Análisis en tiempo real - {new Date().toLocaleDateString()}</p>
                  </header>

                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {STATS.map((stat, i) => (
                      <div key={i} className="group bg-[#080a0f] border border-white/5 p-6 rounded-[2rem] hover:border-orange-500/50 transition-all cursor-default relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} opacity-[0.03] rounded-bl-full`} />
                        <span className="text-xl mb-4 block">{stat.icon}</span>
                        <p className="text-3xl font-black tracking-tighter mb-1">{stat.valor}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white/50 transition-colors">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#080a0f] border border-white/5 rounded-[2.5rem] overflow-hidden">
                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-widest">Actividad Reciente - Turnos</h3>
                        <span className="px-3 py-1 bg-orange-500 text-black text-[10px] font-black rounded-full uppercase">En Vivo</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/[0.02]">
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Usuario</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Horario</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Estado</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Control</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {turnosHoy.map((t) => (
                            <tr key={t.id} className="hover:bg-white/[0.02] transition-all group">
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-600/20 flex items-center justify-center font-black text-orange-500 text-xs">
                                    {t.nombre?.[0]}{t.apellido?.[0]}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black uppercase">{t.nombre} {t.apellido}</p>
                                    <p className="text-[10px] text-white/20 font-bold tracking-tight">ID: #{t.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <span className="font-mono text-lg font-black text-orange-500/80">{t.hora?.slice(0,5)}</span>
                              </td>
                              <td className="px-8 py-5">
                                <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-full border ${
                                  t.estado === 'completado' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
                                  t.estado === 'cancelado' ? 'border-red-500/30 text-red-400 bg-red-500/5' : 'border-orange-500/30 text-orange-500 bg-orange-500/5'
                                }`}>
                                  {t.estado}
                                </span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                  {t.estado === 'reservado' && (
                                    <button className="p-2 bg-emerald-500 text-black rounded-lg hover:scale-110 transition-transform">✓</button>
                                  )}
                                  <button className="p-2 bg-white/5 text-white/40 rounded-lg hover:text-red-500 transition-colors">✕</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTIONS FOR OTHER VIEWS (REUSE THE SAME TABLE PATTERN) */}
              {seccion === 'usuarios' && (
                <div className="space-y-6">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter underline decoration-orange-500 underline-offset-8">Base de Datos <span className="text-orange-500">Usuarios</span></h2>
                    <div className="bg-[#080a0f] border border-white/5 rounded-[2.5rem] overflow-hidden p-2">
                        {/* Aquí podrías mapear la lista de usuarios con el mismo estilo de tabla elite */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                            {usuarios.map(u => (
                                <div key={u.id} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl flex items-center justify-between hover:border-orange-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl">👤</div>
                                        <div>
                                            <p className="text-sm font-black uppercase">{u.nombre} {u.apellido}</p>
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{u.documento}</p>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-black uppercase text-orange-500 border border-orange-500/20 px-4 py-2 rounded-xl hover:bg-orange-500 hover:text-black transition-all">Expediente</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              )}

              {seccion === 'calendario' && (
                <div className="animate-fadeIn">
                  <CalendarioTurnos />
                </div>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
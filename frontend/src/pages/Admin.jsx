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
    } catch {}
  };

  const cancelarTurno = async (id) => {
    try {
      await api.patch('/turnos/' + id + '/cancelar');
      setTurnos(turnos.map(t => t.id === id ? { ...t, estado: 'cancelado' } : t));
    } catch {}
  };

  const marcarEstado = async (id, estado) => {
    try {
      await api.patch('/turnos/' + id + '/estado', { estado });
      setTurnos(turnos.map(t => t.id === id ? { ...t, estado } : t));
    } catch {}
  };

  const hoy = new Date().toISOString().split('T')[0];
  const turnosHoy = turnos.filter(t => t.fecha?.split('T')[0] === hoy);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0f1117]/95 backdrop-blur-md border-b border-white/10 px-6 py-5">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-white font-bold tracking-widest text-xl">TCGYM</span>
            <span className="text-orange-400 text-sm font-medium">ADMIN</span>
          </div>

          <div className="hidden md:flex gap-2">
            {['dashboard', 'usuarios', 'turnos', 'calendario'].map((key) => (
              <button
                key={key}
                onClick={() => setSeccion(key)}
                className={`px-6 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  seccion === key 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {key === 'dashboard' && 'Dashboard'}
                {key === 'usuarios' && 'Usuarios'}
                {key === 'turnos' && 'Turnos'}
                {key === 'calendario' && 'Calendario'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/home')} className="text-white/60 hover:text-white text-sm">Home</button>
            <div className="w-9 h-9 bg-orange-500 rounded-2xl flex items-center justify-center font-bold">
              {usuario?.nombre?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {seccion === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-8">Turnos de Hoy</h2>
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-8 py-5 text-white/50">Usuario</th>
                    <th className="text-left px-8 py-5 text-white/50">Hora</th>
                    <th className="text-left px-8 py-5 text-white/50">Estado</th>
                    <th className="text-left px-8 py-5 text-white/50">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {turnosHoy.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-16 text-white/40">No hay turnos hoy</td></tr>
                  ) : (
                    turnosHoy.map(turno => (
                      <tr key={turno.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-5 font-medium">{turno.nombre} {turno.apellido}</td>
                        <td className="px-8 py-5 text-white/70">{turno.hora?.slice(0,5)} hs</td>
                        <td className="px-8 py-5">
                          <span className={`px-5 py-1.5 rounded-full text-xs ${turno.estado === 'completado' ? 'bg-green-500/20 text-green-400' : turno.estado === 'cancelado' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                            {turno.estado === 'completado' ? 'Asistió' : turno.estado === 'cancelado' ? 'Cancelado' : 'Reservado'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          {turno.estado === 'reservado' && (
                            <div className="flex gap-2">
                              <button onClick={() => marcarEstado(turno.id, 'completado')} className="bg-green-500/10 hover:bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-sm">✓ Asistió</button>
                              <button onClick={() => cancelarTurno(turno.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm">✕ Cancelar</button>
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

        {/* TABLA DE PRUEBA - Debería verse diferente */}
<div className="hidden md:block bg-white/5 border border-orange-500/30 rounded-3xl overflow-hidden shadow-2xl">
  <div className="bg-orange-500/10 px-8 py-5 border-b border-orange-500/20">
    <h3 className="text-orange-400 font-bold text-lg">TABLA NUEVA - ¿Ves el naranja?</h3>
  </div>
  <table className="w-full">
    <thead>
      <tr className="border-b border-white/10">
        <th className="text-left px-8 py-6 text-white/70 font-semibold">Usuario</th>
        <th className="text-left px-8 py-6 text-white/70 font-semibold">Hora</th>
        <th className="text-left px-8 py-6 text-white/70 font-semibold">Estado</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-white/10">
      {turnosHoy.length === 0 ? (
        <tr><td colSpan={3} className="text-center py-20 text-orange-400">No hay turnos hoy (versión nueva)</td></tr>
      ) : (
        turnosHoy.map((turno) => (
          <tr key={turno.id} className="hover:bg-orange-500/10 transition-colors">
            <td className="px-8 py-6 text-white font-medium">{turno.nombre} {turno.apellido}</td>
            <td className="px-8 py-6 text-orange-400 font-medium">{turno.hora?.slice(0,5)} hs</td>
            <td className="px-8 py-6">
              <span className="bg-orange-500 text-black px-5 py-1 rounded-full text-xs font-bold">
                NUEVO DISEÑO
              </span>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

        {/* TABLA DE PRUEBA - Debería verse diferente */}
<div className="hidden md:block bg-white/5 border border-orange-500/30 rounded-3xl overflow-hidden shadow-2xl">
  <div className="bg-orange-500/10 px-8 py-5 border-b border-orange-500/20">
    <h3 className="text-orange-400 font-bold text-lg">TABLA NUEVA - ¿Ves el naranja?</h3>
  </div>
  <table className="w-full">
    <thead>
      <tr className="border-b border-white/10">
        <th className="text-left px-8 py-6 text-white/70 font-semibold">Usuario</th>
        <th className="text-left px-8 py-6 text-white/70 font-semibold">Hora</th>
        <th className="text-left px-8 py-6 text-white/70 font-semibold">Estado</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-white/10">
      {turnosHoy.length === 0 ? (
        <tr><td colSpan={3} className="text-center py-20 text-orange-400">No hay turnos hoy (versión nueva)</td></tr>
      ) : (
        turnosHoy.map((turno) => (
          <tr key={turno.id} className="hover:bg-orange-500/10 transition-colors">
            <td className="px-8 py-6 text-white font-medium">{turno.nombre} {turno.apellido}</td>
            <td className="px-8 py-6 text-orange-400 font-medium">{turno.hora?.slice(0,5)} hs</td>
            <td className="px-8 py-6">
              <span className="bg-orange-500 text-black px-5 py-1 rounded-full text-xs font-bold">
                NUEVO DISEÑO
              </span>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

        {seccion === 'calendario' && <CalendarioTurnos />}

      </div>
    </div>
  );
}
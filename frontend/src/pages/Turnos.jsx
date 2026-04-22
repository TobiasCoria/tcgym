import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const HORARIOS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00'
];

export default function Turnos() {
  const [seleccionado, setSeleccionado] = useState(null);
  const [confirmado, setConfirmado] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState({});
  const [misTurnos, setMisTurnos] = useState([]);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
  const [vista, setVista] = useState('reservar');
  const navigate = useNavigate();

  const fechaLegible = (f) => {
  if (!f) return '';
  const fecha = f.includes('T') ? f.split('T')[0] : f;
  const [anio, mes, dia] = fecha.split('-');
  return new Date(anio, mes - 1, dia).toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
};
  useEffect(() => {
    cargarDisponibilidad();
  }, [fecha]);

  useEffect(() => {
    cargarMisTurnos();
  }, []);

  const cargarDisponibilidad = async () => {
    try {
      const { data } = await api.get(`/turnos/disponibilidad?fecha=${fecha}`);
      const mapa = {};
      data.forEach(({ hora, ocupados }) => {
        mapa[hora.slice(0, 5)] = ocupados;
      });
      setDisponibilidad(mapa);
    } catch {}
  };

  const cargarMisTurnos = async () => {
    try {
      const { data } = await api.get('/turnos/mis-turnos');
      setMisTurnos(data);
    } catch {}
  };

  const handleReservar = async () => {
    if (!seleccionado) return;
    setCargando(true);
    setError('');
    try {
      await api.post('/turnos', { fecha, hora: seleccionado + ':00' });
      setConfirmado(true);
      cargarMisTurnos();
      setTimeout(() => { setConfirmado(false); setSeleccionado(null); }, 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al reservar');
    } finally {
      setCargando(false);
    }
  };

  const handleCancelar = async (id) => {
    try {
      await api.patch(`/turnos/${id}/cancelar`);
      cargarMisTurnos();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white overflow-hidden">

      {/* Fondo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-120px] right-[-80px] w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] animate-glow-pulse" />
        <div className="absolute bottom-[-100px] left-[-60px] w-[300px] h-[300px] bg-orange-500/8 rounded-full blur-[80px] animate-glow-pulse" style={{animationDelay:'1s'}} />
      </div>

      {/* Header */}
      <div className="relative flex items-center gap-4 px-6 py-5 border-b border-white/5 animate-fadeIn">
        <button
          onClick={() => navigate('/home')}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white"
        >←</button>
        <h1 className="text-white font-bold text-lg">Turnos</h1>
      </div>

      {/* Tabs */}
      <div className="relative flex gap-2 px-6 py-4">
        {[
          { key: 'reservar', label: 'Reservar' },
          { key: 'mis-turnos', label: `Mis turnos ${misTurnos.filter(t => t.estado === 'reservado').length > 0 ? `(${misTurnos.filter(t => t.estado === 'reservado').length})` : ''}` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setVista(tab.key)}
            className={`px-4 py-2 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all duration-200 ${
              vista === tab.key
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-white/5 text-white/40 hover:text-white border border-white/8'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative px-6 pb-36 max-w-sm mx-auto">

        {/* RESERVAR */}
        {vista === 'reservar' && (
          <>
            {/* Selector de fecha */}
            <div className="animate-fadeIn bg-white/5 border border-white/8 rounded-2xl px-5 py-4 mb-4">
              <label className="block text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => { setFecha(e.target.value); setSeleccionado(null); }}
                className="w-full bg-transparent text-white text-base font-semibold focus:outline-none [color-scheme:dark]"
              />
              <p className="text-white/30 text-xs mt-1 capitalize">{fechaLegible(fecha)}</p>
            </div>

            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3 animate-fadeIn">
              Seleccioná un horario
            </p>

            <div className="grid grid-cols-3 gap-2.5">
              {HORARIOS.map((hora, i) => {
                const ocupados = disponibilidad[hora] || 0;
                const lleno = ocupados >= 10;
                const estaSeleccionado = seleccionado === hora;
                return (
                  <button
                    key={hora}
                    onClick={() => !lleno && setSeleccionado(hora)}
                    disabled={lleno}
                    className={`animate-fadeIn py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 border flex flex-col items-center gap-0.5 ${
                      lleno
                        ? 'bg-white/3 border-white/5 text-white/20 cursor-not-allowed'
                        : estaSeleccionado
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105'
                        : 'bg-white/5 border-white/8 text-white/70 hover:border-white/20 hover:text-white'
                    }`}
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <span>{hora}</span>
                    {!lleno && (
                      <span className={`text-[10px] font-medium ${estaSeleccionado ? 'text-orange-100' : 'text-white/30'}`}>
                        {10 - ocupados} lugares
                      </span>
                    )}
                    {lleno && <span className="text-[10px] font-medium text-red-400">Lleno</span>}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs font-medium animate-scaleIn">
                {error}
              </div>
            )}
          </>
        )}

        {/* MIS TURNOS */}
        {vista === 'mis-turnos' && (
          <div className="space-y-2">
            {misTurnos.length === 0 && (
              <div className="text-center py-12 animate-fadeIn">
                <p className="text-white/20 text-sm">No tenés turnos reservados</p>
              </div>
            )}
            {misTurnos.map((turno, i) => (
              <div
                key={turno.id}
                className="animate-fadeIn bg-white/5 border border-white/8 rounded-2xl px-5 py-4"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold text-sm capitalize">{fechaLegible(turno.fecha)}</p>
                    <p className="text-white/40 text-xs mt-0.5">{turno.hora.slice(0,5)}hs</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    turno.estado === 'reservado' ? 'bg-orange-500/15 text-orange-400' :
                    turno.estado === 'completado' ? 'bg-green-500/15 text-green-400' :
                    'bg-red-500/15 text-red-400'
                  }`}>
                    {turno.estado}
                  </span>
                </div>
                {turno.estado === 'reservado' && (
                  <button
                    onClick={() => handleCancelar(turno.id)}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold py-2.5 rounded-xl transition-colors mt-1"
                  >
                    Cancelar turno
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón flotante */}
      {vista === 'reservar' && (
        <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-[#0f1117] via-[#0f1117]/95 to-transparent">
          {seleccionado && (
            <p className="text-center text-white/40 text-xs font-medium mb-3 uppercase tracking-widest animate-fadeIn">
              Turno seleccionado — <span className="text-orange-400 font-bold">{seleccionado}hs</span>
            </p>
          )}
          <button
            onClick={handleReservar}
            disabled={!seleccionado || cargando}
            className="w-full max-w-sm mx-auto block bg-orange-500 hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-sm py-4 rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 active:translate-y-0 tracking-wide"
          >
            {cargando ? 'Reservando...' : seleccionado ? `Confirmar — ${seleccionado}hs` : 'Seleccioná un horario'}
          </button>
        </div>
      )}

      {/* Modal confirmación */}
      {confirmado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-scaleIn">
          <div className="bg-[#1a1d27] border border-white/10 rounded-2xl p-8 mx-6 text-center shadow-2xl max-w-xs w-full">
            <div className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-5 animate-scaleInBounce">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Turno confirmado</h2>
            <p className="text-white/40 text-sm">
              Reservaste el turno de las <span className="text-orange-400 font-semibold">{seleccionado}hs</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
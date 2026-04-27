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
    const dateObj = new Date(f.includes('T') ? f : f + 'T00:00:00');
    return dateObj.toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  };

  useEffect(() => { cargarDisponibilidad(); }, [fecha]);
  useEffect(() => { cargarMisTurnos(); }, []);

  const cargarDisponibilidad = async () => {
    try {
      const { data } = await api.get(`/turnos/disponibilidad?fecha=${fecha}`);
      const mapa = {};
      data.forEach(({ hora, ocupados }) => { mapa[hora.slice(0, 5)] = ocupados; });
      setDisponibilidad(mapa);
    } catch (e) {}
  };

  const cargarMisTurnos = async () => {
    try {
      const { data } = await api.get('/turnos/mis-turnos');
      setMisTurnos(data);
    } catch (e) {}
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
    } finally { setCargando(false); }
  };

  const handleCancelar = async (id) => {
    try {
      await api.patch(`/turnos/${id}/cancelar`);
      cargarMisTurnos();
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-white selection:bg-orange-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header Pro */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#05070a]/80 border-b border-white/[0.05] px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/home')}
          className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
        >
          <span className="opacity-60">←</span>
        </button>
        <h1 className="text-sm font-black uppercase tracking-[0.2em]">Agenda de Turnos</h1>
        <div className="w-10 h-10" /> {/* Spacer */}
      </header>

      {/* Navegación de Vistas (Tabs) */}
      <div className="px-6 mt-6 max-w-lg mx-auto">
        <div className="bg-white/[0.03] border border-white/[0.05] p-1.5 rounded-[1.5rem] flex gap-2">
          {['reservar', 'mis-turnos'].map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className={`flex-1 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                vista === v ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {v === 'reservar' ? 'Nuevo Turno' : `Mis Reservas (${misTurnos.filter(t => t.estado === 'reservado').length})`}
            </button>
          ))}
        </div>
      </div>

      <main className="px-6 pt-8 pb-32 max-w-lg mx-auto">
        
        {vista === 'reservar' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Fecha Selector */}
            <div className="bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] relative overflow-hidden group transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Día del Entrenamiento</label>
              <input
                type="date"
                value={fecha}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => { setFecha(e.target.value); setSeleccionado(null); }}
                className="w-full bg-transparent text-xl font-black focus:outline-none [color-scheme:dark] cursor-pointer"
              />
              <p className="text-orange-500 text-xs font-bold mt-2 capitalize italic">{fechaLegible(fecha)}</p>
            </div>

            {/* Grilla Horarios */}
            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Horarios Disponibles</h2>
              <div className="grid grid-cols-3 gap-3">
                {HORARIOS.map((hora, i) => {
                  const ocupados = disponibilidad[hora] || 0;
                  const lleno = ocupados >= 10;
                  const isSel = seleccionado === hora;
                  
                  return (
                    <button
                      key={hora}
                      onClick={() => !lleno && setSeleccionado(hora)}
                      disabled={lleno}
                      className={`relative group p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-1 ${
                        lleno ? 'bg-white/[0.02] border-white/5 opacity-30 cursor-not-allowed' :
                        isSel ? 'bg-orange-500 border-orange-400 scale-105 shadow-2xl shadow-orange-500/40' :
                        'bg-white/[0.04] border-white/[0.05] hover:border-orange-500/50'
                      }`}
                      style={{ animationDelay: `${i * 0.02}s` }}
                    >
                      <span className={`text-sm font-black ${isSel ? 'text-white' : 'text-white/80'}`}>{hora}</span>
                      <div className={`h-[3px] w-8 rounded-full ${lleno ? 'bg-red-500' : isSel ? 'bg-white/40' : 'bg-orange-500/20'}`} />
                      <span className={`text-[9px] font-bold ${isSel ? 'text-white/70' : 'opacity-40'}`}>
                        {lleno ? 'Full' : `${10 - ocupados} cupos`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {vista === 'mis-turnos' && (
          <div className="space-y-4 animate-fadeIn">
            {misTurnos.length === 0 ? (
              <div className="py-20 text-center opacity-20 font-black uppercase tracking-widest text-sm">Sin historial</div>
            ) : (
              misTurnos.map((turno, i) => (
                <div key={turno.id} className="bg-white/[0.03] border border-white/10 rounded-[1.8rem] p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-black capitalize">{fechaLegible(turno.fecha)}</p>
                      <p className="text-xs font-bold text-orange-500/70">{turno.hora.slice(0,5)} HS</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                      turno.estado === 'reservado' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                      turno.estado === 'completado' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                      'bg-white/5 border-white/10 text-white/30'
                    }`}>
                      {turno.estado}
                    </span>
                  </div>
                  {turno.estado === 'reservado' && (
                    <button
                      onClick={() => handleCancelar(turno.id)}
                      className="w-full py-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Cancelar Reserva
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Botón Flotante Dinámico */}
      {vista === 'reservar' && (
        <div className="fixed bottom-0 left-0 right-0 p-6 z-40 bg-gradient-to-t from-[#05070a] via-[#05070a]/90 to-transparent">
          <button
            onClick={handleReservar}
            disabled={!seleccionado || cargando}
            className={`w-full max-w-sm mx-auto block py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all duration-500 shadow-2xl active:scale-95 ${
              seleccionado 
                ? 'bg-white text-black shadow-white/10' 
                : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
            }`}
          >
            {cargando ? 'Procesando...' : seleccionado ? `Confirmar ${seleccionado} hs` : 'Elige un horario'}
          </button>
        </div>
      )}

      {/* Modal de Confirmación Ultra-Pro */}
      {confirmado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="relative bg-[#0a0c10] border border-white/10 w-full max-w-xs rounded-[3rem] p-10 text-center shadow-[0_0_50px_rgba(249,115,22,0.2)] animate-scaleIn">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/40">
              <span className="text-white text-4xl">✓</span>
            </div>
            <h2 className="text-2xl font-black mb-2 italic">¡LISTO!</h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">
              Tu lugar está reservado para las <span className="text-white">{seleccionado}hs</span>. <br/>¡A darle con todo!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
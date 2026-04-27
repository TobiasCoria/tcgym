import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import api from '../services/api';

export default function CalendarioTurnos() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescar, setRefrescar] = useState(false);
  const [modalEvento, setModalEvento] = useState(null); // Para gestionar acciones

  const cargarTurnos = async () => {
    try {
      const res = await api.get('/turnos');
      const turnosFormateados = res.data.map((turno) => ({
        id: turno.id.toString(),
        title: `${turno.nombre} ${turno.apellido}`,
        start: `${turno.fecha.split('T')[0]}T${turno.hora}`,
        extendedProps: { estado: turno.estado, hora: turno.hora },
        // Colores dinámicos basados en estado
        backgroundColor: turno.estado === 'completado' ? 'rgba(34, 197, 94, 0.2)' : 
                         turno.estado === 'cancelado' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(249, 115, 22, 0.2)',
        borderColor: turno.estado === 'completado' ? '#22c55e' : 
                     turno.estado === 'cancelado' ? '#ef4444' : '#f97316',
      }));
      setEventos(turnosFormateados);
    } catch (err) {
      console.error(err);
    } finally { setCargando(false); }
  };

  useEffect(() => { cargarTurnos(); }, [refrescar]);

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const endpoint = nuevoEstado === 'cancelado' ? `/turnos/${id}/cancelar` : `/turnos/${id}/estado`;
      const body = nuevoEstado === 'cancelado' ? {} : { estado: nuevoEstado };
      
      nuevoEstado === 'cancelado' ? await api.patch(endpoint) : await api.patch(endpoint, body);
      
      setModalEvento(null);
      setRefrescar(!refrescar);
    } catch (e) { alert("Error al actualizar"); }
  };

  if (cargando) return (
    <div className="h-96 flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[.3em] text-orange-500">Sincronizando Sistema</p>
    </div>
  );

  return (
    <div className="bg-[#080a0f] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn">
      
      {/* HEADER TÉCNICO */}
      <div className="px-10 py-8 border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[.4em] text-white/30">Admin Dashboard</span>
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Gestión de <span className="text-orange-500">Turnos</span></h2>
        </div>
        
        <button 
          onClick={() => setRefrescar(!refrescar)}
          className="bg-white text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all active:scale-95"
        >
          Refrescar Base
        </button>
      </div>

      {/* CALENDARIO CONTAINER */}
      <div className="p-4 sm:p-8 calendar-custom-wrapper">
        <style>{`
          .fc { --fc-border-color: rgba(255,255,255,0.05); --fc-page-bg-color: transparent; }
          .fc-theme-standard td, .fc-theme-standard th { border: 1px solid rgba(255,255,255,0.03) !important; }
          .fc .fc-toolbar-title { font-size: 1.2rem !important; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; italic; }
          .fc .fc-button-primary { background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(255,255,255,0.1) !important; font-size: 0.7rem !important; font-weight: 800 !important; text-transform: uppercase !important; border-radius: 12px !important; }
          .fc .fc-button-primary:hover { background: rgba(255,255,255,0.1) !important; }
          .fc .fc-button-active { background: #f97316 !important; border-color: #f97316 !important; color: black !important; }
          .fc-v-event { border-width: 0 0 0 4px !important; border-radius: 8px !important; padding: 4px 8px !important; margin: 2px 0 !important; }
          .fc-event-title { font-weight: 800 !important; font-size: 0.75rem !important; }
          .fc-timegrid-slot { height: 3rem !important; }
          .fc-col-header-cell { padding: 15px 0 !important; background: rgba(255,255,255,0.01); }
          .fc-col-header-cell-cushion { font-size: 0.65rem !important; font-weight: 900 !important; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); }
        `}</style>
        
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay,dayGridMonth'
          }}
          events={eventos}
          eventClick={(info) => setModalEvento({
            id: info.event.id,
            title: info.event.title,
            ...info.event.extendedProps
          })}
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          height="auto"
          locale={esLocale}
          nowIndicator={true}
          dayMaxEvents={true}
        />
      </div>

      {/* MODAL DE ACCIÓN PRO */}
      {modalEvento && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setModalEvento(null)} />
          <div className="relative bg-[#0d1017] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-scaleIn">
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-[.3em] text-orange-500">Gestionar Turno</span>
              <h3 className="text-2xl font-black text-white mt-1 italic uppercase">{modalEvento.title}</h3>
              <p className="text-white/40 text-xs font-bold mt-1">Horario registrado: {modalEvento.hora} hs</p>
            </div>

            <div className="space-y-3">
              {modalEvento.estado === 'reservado' && (
                <>
                  <button 
                    onClick={() => actualizarEstado(modalEvento.id, 'completado')}
                    className="w-full bg-green-500 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-400 transition-all"
                  >
                    Confirmar Asistencia
                  </button>
                  <button 
                    onClick={() => actualizarEstado(modalEvento.id, 'cancelado')}
                    className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                  >
                    Cancelar Turno
                  </button>
                </>
              )}
              <button 
                onClick={() => setModalEvento(null)}
                className="w-full bg-white/5 text-white/40 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
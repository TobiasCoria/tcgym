import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../services/api';

export default function CalendarioTurnos() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescar, setRefrescar] = useState(false);

  const cargarTurnos = async () => {
    try {
      const res = await api.get('/turnos');
      const turnosFormateados = res.data.map((turno) => ({
        id: turno.id.toString(),
        title: turno.nombre + " " + turno.apellido,
        start: `${turno.fecha.split('T')[0]}T${turno.hora}`,
        extendedProps: { 
          estado: turno.estado, 
          hora: turno.hora 
        },
        backgroundColor: turno.estado === 'completado' ? '#22c55e' : 
                        turno.estado === 'cancelado' ? '#ef4444' : '#f97316',
        textColor: '#fff',
        classNames: ['luxury-event'],
      }));

      setEventos(turnosFormateados);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTurnos();
  }, [refrescar]);

  // Funciones de click (mantengo simples por ahora)
  const handleEventClick = (info) => {
    const { estado, hora } = info.event.extendedProps;
    if (estado === 'reservado') {
      if (confirm(`Turno de ${info.event.title} a las ${hora} hs\n\n¿Qué querés hacer?`)) {
        if (confirm('Marcar como Asistió?')) marcarAsistencia(info.event.id, 'completado');
        else if (confirm('Cancelar turno?')) cancelarTurno(info.event.id);
      }
    }
  };

  const marcarAsistencia = async (id) => {
    await api.patch(`/turnos/${id}/estado`, { estado: 'completado' });
    setRefrescar(!refrescar);
  };

  const cancelarTurno = async (id) => {
    await api.patch(`/turnos/${id}/cancelar`);
    setRefrescar(!refrescar);
  };

  if (cargando) return <div className="py-20 flex justify-center"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="bg-[#05070f] border border-white/5 rounded-3xl overflow-hidden">
      <div className="px-8 py-6 border-b border-white/10 bg-gradient-to-r from-[#0a0c14] to-black flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-orange-500">●</span> 
          Calendario de Turnos
        </h2>
        <button onClick={() => setRefrescar(!refrescar)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm">
          Actualizar
        </button>
      </div>

      <div className="p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={eventos}
          eventClick={handleEventClick}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          height="auto"
          locale="es"
          eventClassNames="luxury-event"
        />
      </div>
    </div>
  );
}
// components/CalendarioTurnos.jsx
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
      const turnosFormateados = res.data.map((turno) => {
        const isCompletado = turno.estado === 'completado';
        const isCancelado = turno.estado === 'cancelado';
        
        return {
          id: turno.id.toString(),
          title: `${turno.nombre} ${turno.apellido}`,
          start: `${turno.fecha.split('T')[0]}T${turno.hora}`,
          extendedProps: {
            estado: turno.estado,
            hora: turno.hora,
          },
          backgroundColor: isCompletado ? '#10b981' : isCancelado ? '#ef4444' : '#f97316',
          borderColor: isCompletado ? '#34d399' : isCancelado ? '#f87171' : '#fb923c',
          textColor: '#ffffff',
          classNames: ['premium-event'],
        };
      });

      setEventos(turnosFormateados);
    } catch (err) {
      console.error("Error cargando turnos:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTurnos();
  }, [refrescar]);

  const handleEventClick = (info) => {
    const { estado, hora } = info.event.extendedProps;
    const nombre = info.event.title;

    if (estado === 'reservado') {
      if (confirm(`📍 ${nombre}\n⏰ ${hora} hs\n\n¿Qué acción deseas realizar?`)) {
        if (confirm('¿Marcar como ASISTIÓ?')) {
          marcarAsistencia(info.event.id, 'completado');
        } else if (confirm('¿Cancelar turno?')) {
          cancelarTurno(info.event.id);
        }
      }
    } else {
      alert(`Este turno ya está ${estado}`);
    }
  };

  const marcarAsistencia = async (id, nuevoEstado) => {
    try {
      await api.patch(`/turnos/${id}/estado`, { estado: nuevoEstado });
      alert('✅ ¡Turno actualizado correctamente!');
      setRefrescar(!refrescar);
    } catch (err) {
      alert('Error al actualizar el estado');
    }
  };

  const cancelarTurno = async (id) => {
    try {
      await api.patch(`/turnos/${id}/cancelar`);
      alert('❌ Turno cancelado');
      setRefrescar(!refrescar);
    } catch (err) {
      alert('Error al cancelar el turno');
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#0a0c14] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header llamativo */}
      <div className="px-8 py-7 border-b border-white/10 bg-gradient-to-r from-black/80 to-[#0f1117] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full animate-pulse shadow-lg" />
          <h2 className="text-3xl font-bold tracking-tighter text-white">Calendario TCGYM</h2>
        </div>
        <button
          onClick={() => setRefrescar(!refrescar)}
          className="px-6 py-3 bg-white/5 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500 rounded-2xl text-sm font-medium transition-all flex items-center gap-2"
        >
          🔄 Actualizar
        </button>
      </div>

      <div className="p-6 md:p-8">
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
          selectable={true}
          select={(selectInfo) => {
            alert(`Selecciona un horario para crear un nuevo turno\nFecha: ${selectInfo.startStr.split('T')[0]}`);
            selectInfo.view.calendar.unselect();
          }}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          allDaySlot={false}
          height="auto"
          locale="es"
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
          }}
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}

          // Estilos premium para celdas y eventos
          eventClassNames="premium-event cursor-pointer"
          
          eventContent={(arg) => {
            const estado = arg.event.extendedProps.estado;
            const emoji = estado === 'completado' ? '✅' : estado === 'cancelado' ? '❌' : '🔥';
            return {
              html: `
                <div class="event-inner">
                  <div class="event-time">${arg.timeText}</div>
                  <div class="event-title">${emoji} ${arg.event.title}</div>
                </div>
              `
            };
          }}
        />
      </div>
    </div>
  );
}
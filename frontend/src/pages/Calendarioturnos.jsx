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
      const turnosFormateados = res.data.map((turno) => ({
        id: turno.id.toString(),
        title: `${turno.nombre} ${turno.apellido}`,
        start: `${turno.fecha.split('T')[0]}T${turno.hora}`,
        extendedProps: {
          estado: turno.estado,
          hora: turno.hora,
        },
        backgroundColor: 
          turno.estado === 'completado' ? '#10b981' : 
          turno.estado === 'cancelado' ? '#ef4444' : '#f97316',
        borderColor: turno.estado === 'reservado' ? '#fb923c' : 'transparent',
        textColor: '#ffffff',
        classNames: ['premium-event'],
      }));

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
      const accion = window.confirm(`📅 ${nombre}\n⏰ ${hora} hs\nEstado: Reservado\n\n¿Qué deseas hacer?`);
      if (accion) {
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
      alert('✅ Turno marcado como completado');
      setRefrescar(!refrescar);
    } catch (err) {
      alert('Error al actualizar');
    }
  };

  const cancelarTurno = async (id) => {
    try {
      await api.patch(`/turnos/${id}/cancelar`);
      alert('❌ Turno cancelado');
      setRefrescar(!refrescar);
    } catch (err) {
      alert('Error al cancelar');
    }
  };

  const handleDateSelect = (selectInfo) => {
    const fecha = selectInfo.startStr.split('T')[0];
    const hora = selectInfo.startStr.split('T')[1]?.slice(0, 5);
    if (confirm(`Crear nuevo turno?\n\nFecha: ${fecha}\nHora: ${hora} hs`)) {
      alert("Próximamente modal completo para seleccionar usuario...");
    }
    selectInfo.view.calendar.unselect();
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#0a0c14] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header Premium */}
      <div className="px-8 py-6 border-b border-white/10 bg-black/60 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse" />
          <h2 className="text-3xl font-bold text-white tracking-tighter">Calendario de Turnos</h2>
        </div>
        <button
          onClick={() => setRefrescar(!refrescar)}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500 rounded-2xl text-sm font-medium transition-all active:scale-95"
        >
          🔄 Actualizar Calendario
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
          select={handleDateSelect}
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

          // Mejoras avanzadas en celdas y eventos
          dayCellClassNames="hover:bg-white/5 transition-colors duration-200"
          dayHeaderClassNames="text-orange-400 font-semibold text-sm py-3"
          slotLabelClassNames="text-white/70 text-xs font-medium"

          // Estilos premium para los eventos
          eventClassNames="premium-event text-sm font-semibold rounded-2xl shadow-md border border-white/10 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"

          eventMouseEnter={(info) => {
            info.el.style.boxShadow = '0 20px 25px -5px rgb(249 115 22 / 0.5), 0 8px 10px -6px rgb(249 115 22 / 0.3)';
          }}
          eventMouseLeave={(info) => {
            info.el.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
          }}
        />
      </div>
    </div>
  );
}
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
          turno.estado === 'completado' ? '#16a34a' :     // Verde más vibrante
          turno.estado === 'cancelado' ? '#dc2626' :      // Rojo más intenso
          '#ea580c',                                      // Naranja TCGYM más fuerte
        borderColor: turno.estado === 'reservado' ? '#f97316' : 'transparent',
        textColor: '#ffffff',
        classNames: ['tcgym-event'],
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

    const mensaje = `📅 ${nombre}\n⏰ ${hora} hs\n📊 Estado: ${estado.toUpperCase()}\n\n¿Qué deseas hacer?`;

    if (window.confirm(mensaje)) {
      if (estado === 'reservado') {
        if (confirm('¿Marcar como ASISTIÓ?')) {
          marcarAsistencia(info.event.id, 'completado');
        } else if (confirm('¿Cancelar turno?')) {
          cancelarTurno(info.event.id);
        }
      } else {
        alert('Este turno ya está ' + estado);
      }
    }
  };

  const marcarAsistencia = async (id, nuevoEstado) => {
    try {
      await api.patch(`/turnos/${id}/estado`, { estado: nuevoEstado });
      alert('✅ Turno marcado como completado');
      setRefrescar(!refrescar);
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const cancelarTurno = async (id) => {
    try {
      await api.patch(`/turnos/${id}/cancelar`);
      alert('❌ Turno cancelado correctamente');
      setRefrescar(!refrescar);
    } catch (err) {
      alert('Error al cancelar turno');
    }
  };

  const handleDateSelect = (selectInfo) => {
    const fecha = selectInfo.startStr.split('T')[0];
    const hora = selectInfo.startStr.split('T')[1]?.slice(0, 5);

    if (confirm(`¿Crear nuevo turno?\n\nFecha: ${fecha}\nHora: ${hora} hs`)) {
      alert(`✅ Turno programado para ${fecha} a las ${hora}hs\n\n(Modal de selección de usuario próximamente)`);
      // Aquí más adelante abriremos un modal bonito
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
    <div className="bg-[#0f1117] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header del Calendario */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
          <h2 className="text-2xl font-bold tracking-tight text-white">Calendario de Turnos</h2>
        </div>
        <button 
          onClick={() => setRefrescar(!refrescar)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/30 rounded-2xl text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
        >
          🔄 Actualizar
        </button>
      </div>

      <div className="p-4 md:p-6">
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
          
          // Mejores estilos y hover
          eventClassNames="tcgym-event cursor-pointer transition-all duration-200"
          eventMouseEnter={(info) => {
            info.el.style.transform = 'translateY(-2px)';
            info.el.style.boxShadow = '0 10px 15px -3px rgb(249 115 22 / 0.3)';
          }}
          eventMouseLeave={(info) => {
            info.el.style.transform = 'translateY(0)';
            info.el.style.boxShadow = 'none';
          }}
        />
      </div>
    </div>
  );
}
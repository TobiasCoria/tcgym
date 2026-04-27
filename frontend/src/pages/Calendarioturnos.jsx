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
  const [refrescar, setRefrescar] = useState(false); // Para refrescar después de acciones

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
          usuarioId: turno.usuario_id,
        },
        backgroundColor:
          turno.estado === 'completado' ? '#22c55e' :
          turno.estado === 'cancelado' ? '#ef4444' : '#f59e0b',
        borderColor: 'transparent',
        textColor: '#ffffff',
        classNames: ['custom-event'],
      }));

      setEventos(turnosFormateados);
    } catch (err) {
      console.error("Error al cargar turnos:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTurnos();
  }, [refrescar]);

  // Click en un turno → Mostrar opciones
  const handleEventClick = (info) => {
    const { estado, hora } = info.event.extendedProps;
    const nombre = info.event.title;

    const accion = window.confirm(
      `Turno: ${nombre}\nHora: ${hora}\nEstado: ${estado}\n\n¿Qué querés hacer?\n\n1 - Marcar como Asistió\n2 - Cancelar turno\n3 - Cerrar`
    );

    if (accion === null) return;

    if (accion.toString().includes('1') || accion === true) {
      if (estado !== 'completado') marcarAsistencia(info.event.id, 'completado');
    } else if (accion.toString().includes('2')) {
      if (estado !== 'cancelado') cancelarTurno(info.event.id);
    }
  };

  const marcarAsistencia = async (id, nuevoEstado) => {
    if (!confirm('¿Marcar como asistió?')) return;
    try {
      await api.patch(`/turnos/${id}/estado`, { estado: nuevoEstado });
      alert('Estado actualizado correctamente');
      setRefrescar(!refrescar); // Refresca el calendario
    } catch (err) {
      alert('Error al actualizar');
    }
  };

  const cancelarTurno = async (id) => {
    if (!confirm('¿Cancelar este turno?')) return;
    try {
      await api.patch(`/turnos/${id}/cancelar`);
      alert('Turno cancelado');
      setRefrescar(!refrescar);
    } catch (err) {
      alert('Error al cancelar');
    }
  };

  // Seleccionar horario → Crear turno (por ahora simple)
  const handleDateSelect = (selectInfo) => {
    const fecha = selectInfo.startStr.split('T')[0];
    const hora = selectInfo.startStr.split('T')[1]?.slice(0, 5);

    if (confirm(`¿Crear un nuevo turno el ${fecha} a las ${hora}?`)) {
      alert(`Funcionalidad de crear turno para ${fecha} ${hora}hs (próximamente con selector de usuario)`);
      // En el futuro aquí abrirías un modal con lista de usuarios
    }
    selectInfo.view.calendar.unselect(); // Limpia la selección
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Calendario de Turnos</h2>
        <button 
          onClick={() => setRefrescar(!refrescar)}
          className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors"
        >
          Actualizar
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
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          // Estilos personalizados vía CSS variables
          eventClassNames="cursor-pointer hover:brightness-110 transition-all"
        />
      </div>
    </div>
  );
}
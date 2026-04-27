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

  // Cargar todos los turnos y convertirlos a eventos de FullCalendar
  const cargarTurnos = async () => {
    try {
      const res = await api.get('/turnos');
      const turnosFormateados = res.data.map(turno => ({
        id: turno.id,
        title: `${turno.nombre} ${turno.apellido}`,
        start: `${turno.fecha.split('T')[0]}T${turno.hora}`,
        end: `${turno.fecha.split('T')[0]}T${turno.hora}`, // por ahora mismo horario (puedes ajustar)
        extendedProps: {
          estado: turno.estado,
          usuarioId: turno.usuario_id,
          hora: turno.hora
        },
        backgroundColor: 
          turno.estado === 'completado' ? '#22c55e' :
          turno.estado === 'cancelado' ? '#ef4444' : '#f59e0b',
        borderColor: 'transparent',
        textColor: '#fff'
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
  }, []);

  // Cuando se hace click en un evento (turno)
  const handleEventClick = (info) => {
    const { estado, hora } = info.event.extendedProps;
    alert(`Turno de ${info.event.title}\nHora: ${hora}\nEstado: ${estado}`);
    // Aquí puedes abrir un modal para cambiar estado, cancelar, etc.
  };

  // Cuando se selecciona una fecha/horario (para crear nuevo turno en el futuro)
  const handleDateSelect = (selectInfo) => {
    const fecha = selectInfo.startStr.split('T')[0];
    const hora = selectInfo.startStr.split('T')[1]?.slice(0,5);

    if (confirm(`¿Reservar turno para el ${fecha} a las ${hora}?`)) {
      // Aquí llamarías a tu endpoint crearTurno (pero como es admin, quizás necesites seleccionar usuario)
      alert("Funcionalidad de crear turno desde calendario (pendiente)");
    }
  };

  if (cargando) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="bg-white/5 border border-white/8 rounded-3xl p-4 md:p-6">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"           // Vista por defecto: semana con horas
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={eventos}
        eventClick={handleEventClick}
        selectable={true}
        select={handleDateSelect}
        slotMinTime="06:00:00"              // Horario de apertura del gym
        slotMaxTime="23:00:00"              // Horario de cierre
        allDaySlot={false}
        height="auto"
        locale="es"                         // Importante: en español
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día'
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        themeSystem="standard"
      />
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// 👉 FullCalendar
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

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
      const [u, t] = await Promise.all([
        api.get('/usuarios'),
        api.get('/turnos')
      ]);
      setUsuarios(u.data);
      setTurnos(t.data);
    } catch {}
    finally { setCargando(false); }
  };

  // 👉 EVENTOS CALENDARIO
  const eventos = turnos.map(t => ({
    title: `${t.nombre} ${t.apellido}`,
    date: t.fechaCompleta,
    backgroundColor:
      t.estado === 'reservado'
        ? '#f97316'
        : t.estado === 'cancelado'
        ? '#ef4444'
        : '#22c55e',
    borderColor: 'transparent'
  }));

  const cancelarTurno = async (id) => {
    try {
      await api.patch('/turnos/' + id + '/cancelar');
      setTurnos(turnos.map(t =>
        t.id === id ? { ...t, estado: 'cancelado' } : t
      ));
    } catch {}
  };

  const marcarEstado = async (id, estado) => {
    try {
      await api.patch('/turnos/' + id + '/estado', { estado });
      setTurnos(turnos.map(t =>
        t.id === id ? { ...t, estado } : t
      ));
    } catch {}
  };

  const hoy = new Date().toISOString().split('T')[0];
  const turnosHoy = turnos.filter(t => t.fecha?.split('T')[0] === hoy);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white overflow-hidden">

      {/* HEADER */}
      <div className="flex justify-between p-4 border-b border-white/10">
        <h1 className="font-bold">TCGYM Admin</h1>
        <button onClick={() => { logout(); navigate('/'); }}>
          Salir
        </button>
      </div>

      {/* NAV */}
      <div className="flex gap-2 p-4">
        <button onClick={() => setSeccion('dashboard')}>Dashboard</button>
        <button onClick={() => setSeccion('usuarios')}>Usuarios</button>
        <button onClick={() => setSeccion('turnos')}>Turnos</button>
      </div>

      {/* CONTENIDO */}
      <div className="p-4">

        {cargando ? (
          <p>Cargando...</p>
        ) : (
          <>
            {/* DASHBOARD */}
            {seccion === 'dashboard' && (
              <div>
                <h2>Dashboard</h2>
                <p>Turnos hoy: {turnosHoy.length}</p>
              </div>
            )}

            {/* USUARIOS */}
            {seccion === 'usuarios' && (
              <div>
                <h2>Usuarios</h2>
                {usuarios.map(u => (
                  <p key={u.id}>
                    {u.nombre} {u.apellido}
                  </p>
                ))}
              </div>
            )}

            {/* TURNOS */}
            {seccion === 'turnos' && (
              <div>

                {/* 🔥 CALENDARIO PRO */}
                <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-4 shadow-lg">
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    events={eventos}
                    height="70vh"
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                  />
                </div>

                {/* TABLA ORIGINAL */}
                {turnosHoy.map(t => (
                  <div key={t.id} className="mb-2 p-3 bg-white/5 rounded-xl">
                    <p>{t.nombre} {t.apellido}</p>
                    <p>{t.hora}</p>
                    <p>{t.estado}</p>

                    {t.estado === 'reservado' && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => marcarEstado(t.id, 'completado')}>
                          Asistió
                        </button>
                        <button onClick={() => cancelarTurno(t.id)}>
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                ))}

              </div>
            )}
          </>
        )}
      </div>

      {/* 🎨 ESTILO DARK PARA CALENDARIO */}
      <style>
        {`
          .fc {
            color: white;
          }
          .fc-theme-standard td, 
          .fc-theme-standard th {
            border-color: rgba(255,255,255,0.08);
          }
          .fc-toolbar-title {
            color: white;
            font-weight: 600;
          }
          .fc-button {
            background: rgba(255,255,255,0.05) !important;
            border: none !important;
            color: white !important;
            border-radius: 10px !important;
          }
          .fc-button:hover {
            background: rgba(249,115,22,0.2) !important;
          }
          .fc-button-active {
            background: #f97316 !important;
          }
        `}
      </style>

    </div>
  );
}
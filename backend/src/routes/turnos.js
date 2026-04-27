const router = require('express').Router();

const { 
  getTurnos, 
  getMisTurnos, 
  crearTurno, 
  cancelarTurno, 
  getDisponibilidad, 
  marcarAsistencia 
} = require('../controllers/turnosController');

const { verificarToken, soloAdmin } = require('../middlewares/auth');

// Marcar asistencia (admin)
router.patch('/:id/estado', verificarToken, soloAdmin, marcarAsistencia);

// Obtener todos los turnos (admin)
router.get('/', verificarToken, soloAdmin, getTurnos);

// Obtener mis turnos
router.get('/mis-turnos', verificarToken, getMisTurnos);

// Disponibilidad
router.get('/disponibilidad', verificarToken, getDisponibilidad);

// Crear turno
router.post('/', verificarToken, crearTurno);

// Cancelar turno
router.patch('/:id/cancelar', verificarToken, cancelarTurno);

module.exports = router;
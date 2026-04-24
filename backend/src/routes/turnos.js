const router = require('express').Router();
const { getTurnos, getMisTurnos, crearTurno, cancelarTurno, getDisponibilidad } = require('../controllers/turnosController');
const { verificarToken, soloAdmin } = require('../middlewares/auth');
const { getTurnos, getMisTurnos, crearTurno, cancelarTurno, getDisponibilidad, marcarAsistencia } = require('../controllers/turnosController');

router.patch('/:id/estado', verificarToken, soloAdmin, marcarAsistencia);
router.get('/', verificarToken, soloAdmin, getTurnos);
router.get('/mis-turnos', verificarToken, getMisTurnos);
router.get('/disponibilidad', verificarToken, getDisponibilidad);
router.post('/', verificarToken, crearTurno);
router.patch('/:id/cancelar', verificarToken, cancelarTurno);

module.exports = router;
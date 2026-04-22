const express = require('express');
const router = express.Router();
const { getUsuarios, getMiPerfil, actualizarPerfil, eliminarUsuario, subirRutina } = require('../controllers/usuariosController');
const { verificarToken, soloAdmin } = require('../middlewares/auth');

router.get('/', verificarToken, soloAdmin, getUsuarios);
router.get('/perfil', verificarToken, getMiPerfil);
router.put('/perfil', verificarToken, actualizarPerfil);
router.delete('/:id', verificarToken, soloAdmin, eliminarUsuario);
router.post('/rutina', verificarToken, ...subirRutina);

module.exports = router;
const express = require('express');
const router = express.Router();

const { 
  getUsuarios, 
  getMiPerfil, 
  actualizarPerfil, 
  eliminarUsuario, 
  subirRutina, 
  subirFoto,
  cambiarContrasena
} = require('../controllers/usuariosController');

const { verificarToken, soloAdmin } = require('../middlewares/auth');

// Cambiar contraseña
router.put('/contrasena', verificarToken, cambiarContrasena);

// Subir foto de perfil
router.post('/foto', verificarToken, subirFoto);

// Subir rutina
router.post('/rutina', verificarToken, subirRutina);

// Obtener todos (admin)
router.get('/', verificarToken, soloAdmin, getUsuarios);

// Obtener perfil propio
router.get('/perfil', verificarToken, getMiPerfil);

// Actualizar perfil
router.put('/perfil', verificarToken, actualizarPerfil);

// Eliminar usuario
router.delete('/:id', verificarToken, soloAdmin, eliminarUsuario);

module.exports = router;
const pool = require('../config/db');
const path = require('path');
const multer = require('multer');

const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, nombre, apellido, email, documento, rol, peso, estatura, fecha_nacimiento, rutina_archivo, creado_en FROM usuarios'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const getMiPerfil = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, nombre, apellido, email, documento, peso, estatura, fecha_nacimiento, rutina_archivo FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

const actualizarPerfil = async (req, res) => {
  const { peso, estatura, fecha_nacimiento } = req.body;
  try {
    await pool.execute(
      'UPDATE usuarios SET peso = ?, estatura = ?, fecha_nacimiento = ? WHERE id = ?',
      [peso || null, estatura || null, fecha_nacimiento || null, req.usuario.id]
    );
    res.json({ mensaje: 'Perfil actualizado correctamente' });
  } catch {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

const eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ mensaje: 'Usuario eliminado' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'rutina_' + req.usuario.id + '_' + Date.now() + ext);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const permitidos = ['.pdf', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (permitidos.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no permitido'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const subirRutina = [
  upload.single('rutina'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se recibio archivo' });
    try {
      await pool.execute(
        'UPDATE usuarios SET rutina_archivo = ? WHERE id = ?',
        [req.file.filename, req.usuario.id]
      );
      res.json({ mensaje: 'Rutina subida correctamente', archivo: req.file.filename });
    } catch {
      res.status(500).json({ error: 'Error al guardar rutina' });
    }
  }
];

module.exports = { getUsuarios, getMiPerfil, actualizarPerfil, eliminarUsuario, subirRutina };
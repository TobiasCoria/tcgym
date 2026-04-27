const pool = require('../config/db');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// ================= USUARIOS =================

const getUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        id, nombre, apellido, email, documento, rol, 
        peso, estatura, fecha_nacimiento, 
        rutina_archivo, foto_perfil, creado_en 
      FROM usuarios`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const getMiPerfil = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        id, nombre, apellido, email, documento, 
        peso, estatura, fecha_nacimiento, 
        rutina_archivo, foto_perfil
      FROM usuarios 
      WHERE id = ?`,
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

// ================= RUTINA =================

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
    if (permitidos.includes(ext)) cb(null, true);
    else cb(new Error('Formato no permitido'));
  },
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

      res.json({ archivo: req.file.filename });
    } catch {
      res.status(500).json({ error: 'Error al guardar rutina' });
    }
  }
];

// ================= FOTO =================

const storageFoto = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'foto_' + req.usuario.id + '_' + Date.now() + ext);
  },
});

const uploadFoto = multer({
  storage: storageFoto,
  fileFilter: (req, file, cb) => {
    const permitidos = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (permitidos.includes(ext)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'));
  },
});

const subirFoto = [
  uploadFoto.single('foto'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });

    try {
      // 🔎 buscar foto anterior
      const [rows] = await pool.execute(
        'SELECT foto_perfil FROM usuarios WHERE id = ?',
        [req.usuario.id]
      );

      const fotoAnterior = rows[0]?.foto_perfil;

      // 🗑️ borrar foto anterior
      if (fotoAnterior) {
        const ruta = path.join(__dirname, '../uploads', fotoAnterior);
        fs.unlink(ruta, () => {}); // silencioso
      }

      // 💾 guardar nueva
      await pool.execute(
        'UPDATE usuarios SET foto_perfil = ? WHERE id = ?',
        [req.file.filename, req.usuario.id]
      );

      res.json({ foto: req.file.filename });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
];

module.exports = {
  getUsuarios,
  getMiPerfil,
  actualizarPerfil,
  eliminarUsuario,
  subirRutina,
  subirFoto
};
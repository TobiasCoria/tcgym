const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, documento, contrasena } = req.body;

  try {
    let query, params;

    if (email) {
      query = 'SELECT * FROM usuarios WHERE email = ?';
      params = [email];
    } else if (documento) {
      query = 'SELECT * FROM usuarios WHERE documento = ?';
      params = [documento];
    } else {
      return res.status(400).json({ error: 'Email o documento requerido' });
    }

    const [rows] = await pool.execute(query, params);
    if (rows.length === 0)
      return res.status(401).json({ error: 'Usuario no encontrado' });

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!passwordValida)
      return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const registro = async (req, res) => {
  const { nombre, apellido, email, documento, contrasena } = req.body;

  try {
    const hash = await bcrypt.hash(contrasena, 10);
    await pool.execute(
      'INSERT INTO usuarios (nombre, apellido, email, documento, contrasena) VALUES (?,?,?,?,?)',
      [nombre, apellido, email, documento, hash]
    );
    res.status(201).json({ mensaje: 'Usuario creado exitosamente' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ error: 'Email o documento ya registrado' });
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = { login, registro };
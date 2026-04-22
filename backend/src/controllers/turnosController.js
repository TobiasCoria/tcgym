const pool = require('../config/db');

const getTurnos = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT t.*, u.nombre, u.apellido 
      FROM turnos t 
      JOIN usuarios u ON t.usuario_id = u.id
      ORDER BY t.fecha, t.hora
    `);
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener turnos' });
  }
};

const getMisTurnos = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM turnos WHERE usuario_id = ? ORDER BY fecha, hora',
      [req.usuario.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener turnos' });
  }
};

const crearTurno = async (req, res) => {
  const { fecha, hora } = req.body;
  try {
    // Verificar si ya tiene turno ese día
    const [existe] = await pool.execute(
      'SELECT id FROM turnos WHERE usuario_id = ? AND fecha = ? AND estado = "reservado"',
      [req.usuario.id, fecha]
    );
    if (existe.length > 0)
      return res.status(400).json({ error: 'Ya tenés un turno reservado para ese día' });

    // Verificar capacidad
    const [ocupados] = await pool.execute(
      'SELECT COUNT(*) as total FROM turnos WHERE fecha = ? AND hora = ? AND estado = "reservado"',
      [fecha, hora]
    );
    if (ocupados[0].total >= 10)
      return res.status(400).json({ error: 'Ese horario está completo' });

    await pool.execute(
      'INSERT INTO turnos (usuario_id, fecha, hora) VALUES (?, ?, ?)',
      [req.usuario.id, fecha, hora]
    );
    res.status(201).json({ mensaje: 'Turno reservado correctamente' });
  } catch {
    res.status(500).json({ error: 'Error al crear turno' });
  }
};

const cancelarTurno = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute(
      'UPDATE turnos SET estado = "cancelado" WHERE id = ? AND usuario_id = ?',
      [id, req.usuario.id]
    );
    res.json({ mensaje: 'Turno cancelado' });
  } catch {
    res.status(500).json({ error: 'Error al cancelar turno' });
  }
};

const getDisponibilidad = async (req, res) => {
  const { fecha } = req.query;
  try {
    const [rows] = await pool.execute(
      'SELECT hora, COUNT(*) as ocupados FROM turnos WHERE fecha = ? AND estado = "reservado" GROUP BY hora',
      [fecha]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener disponibilidad' });
  }
};

module.exports = { getTurnos, getMisTurnos, crearTurno, cancelarTurno, getDisponibilidad };
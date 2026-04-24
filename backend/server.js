const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/turnos', require('./src/routes/turnos'));
app.use('/api/usuarios', require('./src/routes/usuarios'));

app.get('/', (req, res) => res.json({ mensaje: 'TCGym API funcionando' }));

app.get('/recordatorios', async (req, res) => {
  const secret = req.headers['x-secret'];
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  try {
    const pool = require('./src/config/db');
    const { enviarRecordatorio } = require('./src/services/emailService');
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const fechaManana = manana.toISOString().split('T')[0];
    const [turnos] = await pool.execute(
      `SELECT t.*, u.nombre, u.email 
       FROM turnos t 
       JOIN usuarios u ON t.usuario_id = u.id 
       WHERE t.fecha = ? AND t.estado = 'reservado'`,
      [fechaManana]
    );
    for (const turno of turnos) {
      await enviarRecordatorio({ nombre: turno.nombre, email: turno.email }, turno);
    }
    res.json({ mensaje: `${turnos.length} recordatorios enviados` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  console.error('STACK:', err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Servidor corriendo en puerto ' + PORT));
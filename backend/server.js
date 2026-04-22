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

app.get('/test-db', async (req, res) => {
  try {
    const pool = require('./src/config/db');
    const [rows] = await pool.execute('SELECT 1 as ok');
    res.json({ status: 'OK', rows });
  } catch (err) {
    res.json({ status: 'ERROR', message: err.message, code: err.code });
  }
});

app.get('/test-turno', async (req, res) => {
  try {
    const pool = require('./src/config/db');
    const [rows] = await pool.execute(
      'SELECT hora, COUNT(*) as ocupados FROM turnos WHERE fecha = ? AND estado = "reservado" GROUP BY hora',
      ['2026-04-22']
    );
    res.json({ status: 'OK', rows });
  } catch (err) {
    res.json({ status: 'ERROR', message: err.message, code: err.code });
  }
});

app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  console.error('STACK:', err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Servidor corriendo en puerto ' + PORT));
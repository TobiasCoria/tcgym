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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Servidor corriendo en puerto ' + PORT));
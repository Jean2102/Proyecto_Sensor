// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Configurar CORS y parsear JSON
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas (¡reemplaza con tu URL!)
const mongoURL = 'mongodb+srv://moralesjean543:J3anmarc0@cluster0.ka9udsb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongoURL, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error de conexión:', err));

// Modelo de datos
const TempSchema = new mongoose.Schema({
  value: Number,
  timestamp: { type: Date, default: Date.now }
});
const Temp = mongoose.model('Temp', TempSchema);

// Ruta POST: Recibir datos del ESP32
app.post('/api/data', async (req, res) => {
  try {
    const { value } = req.body;
    const newTemp = new Temp({ value });
    await newTemp.save();
    res.status(200).json({ message: 'Datos guardados' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar datos' });
  }
});

// Ruta GET: Obtener los últimos 50 datos
app.get('/api/data', async (req, res) => {
  try {
    const data = await Temp.find().sort({ timestamp: -1 }).limit(50);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
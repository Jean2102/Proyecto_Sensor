const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middlewares (¡IMPORTANTE el orden!)
app.use(cors());
app.use(express.json()); // Parsea el cuerpo de las solicitudes POST

// Conexión a MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://moralesjean543:J3anmarc0@cluster0.ka9udsb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error de MongoDB:', err));

// Modelo de datos
const TempSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});
const Temp = mongoose.model('Temp', TempSchema);

// Ruta POST (manejo de errores mejorado)
app.post('/api/data', async (req, res) => {
  try {
    // Validar que el cuerpo tenga el formato correcto
    if (!req.body || typeof req.body.value !== 'number') {
      return res.status(400).json({ 
        error: 'Formato inválido. Ejemplo: { "value": 25.5 }' 
      });
    }

    // Guardar en la base de datos
    const newTemp = new Temp({ value: req.body.value });
    await newTemp.save();
    
    res.status(201).json({ message: '🌡️ Datos guardados exitosamente' });
  } catch (error) {
    res.status(500).json({ error: '🔥 Error del servidor: ' + error.message });
  }
});

// Ruta GET
app.get('/api/data', async (req, res) => {
  try {
    const data = await Temp.find().sort({ timestamp: -1 }).limit(50);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '🔥 Error al obtener datos: ' + error.message });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🖥️ Servidor en http://localhost:${PORT}`);
});

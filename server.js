const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect("mongodb+srv://moralesjean543:J3anmarc0@cluster0.ka9udsb.mongodb.net/esp32data?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.error("❌ Error de conexión:", err));

// Definir esquema y modelo
const dataSchema = new mongoose.Schema({
  valor: Number,       // ajusta según los datos que envías
  timestamp: { type: Date, default: Date.now }
});

const Data = mongoose.model("Data", dataSchema);

// Ruta raíz
app.get("/", (req, res) => {
  res.send("✅ Servidor activo. Usa /api/data para acceder a los datos.");
});

// POST para recibir y guardar datos del ESP32
app.post("/api/data", async (req, res) => {
  try {
    const { valor } = req.body; // Asegúrate que el ESP32 envíe este campo
    const newData = new Data({ valor });
    await newData.save();
    res.status(201).json({ message: "✅ Datos guardados correctamente" });
  } catch (error) {
    console.error("❌ Error al guardar:", error);
    res.status(500).json({ error: "Error al guardar datos" });
  }
});

// GET para obtener todos los datos guardados
app.get("/api/data", async (req, res) => {
  try {
    const datos = await Data.find().sort({ timestamp: -1 }); // orden descendente
    res.json(datos);
  } catch (error) {
    console.error("❌ Error al obtener datos:", error);
    res.status(500).json({ error: "Error al obtener datos" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🖥️ Servidor en puerto ${PORT}`);
});

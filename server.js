
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect("mongodb+srv://moralesjean543:J3anmarc0@cluster0.ka9udsb.mongodb.net/esp32data?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.error("❌ Error de conexión:", err));

// Esquema y modelo
const dataSchema = new mongoose.Schema({
  valor: Number,
  timestamp: { type: Date, default: Date.now }
});
const Data = mongoose.model("Data", dataSchema);

// ✉️ Configura nodemailer (correo de alerta)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "moralesjean543@gmail.com",
    pass: "agsi ttva bkkn pbkz"
  }
});

function enviarAlerta(valor) {
  const mailOptions = {
    from: "moralesjean543@gmail.com",
    to: "moralesjean543@gmail.com",
    subject: "🚨 Alerta de Temperatura Alta",
    text: `Se ha registrado una temperatura elevada: ${valor} °C`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error al enviar correo:", error);
    } else {
      console.log("📧 Alerta enviada:", info.response);
    }
  });
}

app.get("/", (req, res) => {
  res.send("✅ Servidor activo. Usa /api/data para acceder a los datos.");
});

app.post("/api/data", async (req, res) => {
  try {
    const { valor } = req.body;
    const newData = new Data({ valor });
    await newData.save();

    const UMBRAL = 30;
    if (valor > UMBRAL) {
      console.log(`🚨 ALERTA: Temperatura alta registrada: ${valor} °C`);
      enviarAlerta(valor);
    }

    res.status(201).json({ message: "✅ Datos guardados correctamente" });
  } catch (error) {
    console.error("❌ Error al guardar:", error);
    res.status(500).json({ error: "Error al guardar datos" });
  }
});

app.get("/api/data", async (req, res) => {
  try {
    const datos = await Data.find().sort({ timestamp: -1 });
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

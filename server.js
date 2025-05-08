const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Configuración
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Conexión MongoDB (usar variables de entorno en producción)
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://moralesjean543:J3anmarc0@cluster0.ka9udsb.mongodb.net/esp32data?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => console.error("❌ Error MongoDB:", err));

// Esquemas
const dataSchema = new mongoose.Schema({
  valor: Number,
  timestamp: { type: Date, default: Date.now }
});

const alertSchema = new mongoose.Schema({
  valor: Number,
  threshold: Number,
  timestamp: { type: Date, default: Date.now }
});

const Data = mongoose.model("Data", dataSchema);
const Alert = mongoose.model("Alert", alertSchema);

// Configuración Email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "stccontrolador@gmail.com",
    pass: process.env.EMAIL_PASS || "voxh rjga uuyd lzsd"
  }
});

// Variables de estado
let umbral = 20;
const DESTINATARIOS = [
  "moralesjean543@gmail.com",
  "jugosmorena.ec@gmail.com"
];

// WebSockets
io.on("connection", (socket) => {
  console.log("🔌 Cliente conectado:", socket.id);
});

// Función para enviar alertas
const enviarAlertas = async (valor) => {
  try {
    const emails = DESTINATARIOS.map(destinatario => {
      return transporter.sendMail({
        from: `Sistema de Monitoreo <${process.env.EMAIL_USER}>`,
        to: destinatario,
        subject: `🚨 Alerta: Temperatura ${valor}°C`,
        html: `
          <h1 style="color: #e74c3c;">¡Alerta de Temperatura!</h1>
          <p><strong>Temperatura actual:</strong> ${valor}°C</p>
          <p><strong>Umbral configurado:</strong> ${umbral}°C</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p>Sistema de monitoreo STC - ${process.env.APP_NAME || "Controlador Temperatura"}</p>
        `
      });
    });

    await Promise.all(emails);
    console.log("📧 Alertas enviadas correctamente");
  } catch (error) {
    console.error("❌ Error enviando alertas:", error);
  }
};

// Rutas
app.post("/api/data", async (req, res) => {
  try {
    const { valor } = req.body;
    const newData = new Data({ valor });
    await newData.save();

    if (valor > umbral) {
      const newAlert = new Alert({ valor, threshold: umbral });
      await newAlert.save();
      await enviarAlertas(valor);
      io.emit("alerta", { valor, umbral, timestamp: new Date() });
    }

    io.emit("nueva_lectura", { valor, timestamp: new Date() });
    res.status(201).json({ message: "Datos guardados" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/data", async (req, res) => {
  try {
    const datos = await Data.find().sort({ timestamp: -1 }).limit(50);
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/alertas", async (req, res) => {
  try {
    const alertas = await Alert.find().sort({ timestamp: -1 }).limit(20);
    res.json(alertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/umbral", (req, res) => {
  umbral = Number(req.body.umbral);
  res.json({ 
    message: `Umbral actualizado a ${umbral}°C`,
    nuevoUmbral: umbral
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🖥️ Servidor activo en http://localhost:${PORT}`);
});

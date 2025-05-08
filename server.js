const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Configuración
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Sirve archivos estáticos

// Conexión MongoDB
mongoose.connect("mongodb+srv://moralesjean543:J3anmarc0@cluster0.ka9udsb.mongodb.net/esp32data?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch(err => console.error("❌ Error de conexión:", err));

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

// Configuración de email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "stccontrolador@gmail.com",
    pass: "voxh rjga uuyd lzsd"
  }
});

// Variables de estado
let umbral = 15;

// WebSockets
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);
});

// Rutas
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/api/data", async (req, res) => {
  try {
    const { valor } = req.body;
    const newData = new Data({ valor });
    await newData.save();

    if (valor > umbral) {
      // Guardar alerta
      const newAlert = new Alert({ valor, threshold: umbral });
      await newAlert.save();
      
      // Enviar email
      const mailOptions = {
        from: "stccontrolador@gmail.com",
        to: "moralesjean543@gmail.com",
        subject: "🚨 Alerta de Temperatura Alta",
        text: `Temperatura: ${valor}°C (Umbral: ${umbral}°C)`
      };
      
      transporter.sendMail(mailOptions);
      
      // Notificación en tiempo real
      io.emit("alerta", { valor, umbral, timestamp: new Date() });
    }

    res.status(201).json({ message: "Datos guardados" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/data", async (req, res) => {
  try {
    const datos = await Data.find().sort({ timestamp: -1 });
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/alertas", async (req, res) => {
  try {
    const alertas = await Alert.find().sort({ timestamp: -1 });
    res.json(alertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/umbral", (req, res) => {
  umbral = req.body.umbral;
  res.json({ message: `Umbral actualizado a ${umbral}°C` });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🖥️ Servidor en puerto ${PORT}`);
});

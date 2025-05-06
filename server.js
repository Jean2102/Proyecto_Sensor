const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect("mongodb+srv://moralesjean543:J3anmarc0@cluster0.ka9udsb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

// Ruta raíz (¡obligatoria!)
app.get("/", (req, res) => {
  res.send("✅ Servidor activo. Usa /api/data para acceder a los datos.");
});

// Ruta POST para recibir datos del ESP32
app.post("/api/data", async (req, res) => {
  // ... código para guardar datos ...
});

// Ruta GET para obtener datos
app.get("/api/data", async (req, res) => {
  // ... código para leer datos ...
});

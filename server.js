const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
mongoose.connect(process.env.MONGODB_URI);

const TempSchema = new mongoose.Schema({
  value: Number,
  timestamp: { type: Date, default: Date.now }
});
const Temp = mongoose.model('Temp', TempSchema);

app.post('/api/data', async (req, res) => {
  const { value } = req.body;
  const newTemp = new Temp({ value });
  await newTemp.save();
  res.send('Datos guardados');
});

app.get('/api/data', async (req, res) => {
  const data = await Temp.find().sort({ timestamp: -1 }).limit(50);
  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
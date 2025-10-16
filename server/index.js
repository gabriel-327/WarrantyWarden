const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/warrantywarden';

// Simple health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Example model & route
const { Schema } = mongoose;
const WarrantySchema = new Schema({
  title: String,
  purchaseDate: Date,
  warrantyExpires: Date,
  vendor: String
}, { timestamps: true });

const Warranty = mongoose.models.Warranty || mongoose.model('Warranty', WarrantySchema);

app.get('/api/warranties', async (req, res) => {
  try {
    const docs = await Warranty.find().limit(50);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/warranties', async (req, res) => {
  try {
    const w = new Warranty(req.body);
    await w.save();
    res.status(201).json(w);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    // Start server even if DB connection fails to allow frontend dev without DB
    app.listen(PORT, () => console.log(`Server (no DB) listening on port ${PORT}`));
  });

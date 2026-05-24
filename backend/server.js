const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const productsRoute = require('./routes/products');
const ordersRoute = require('./routes/orders');

const app = express();

app.use(express.json());
app.use(cors());

// Serve uploaded photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productsRoute);
app.use('/api/orders', ordersRoute);

// Test route
app.get('/', (req, res) => {
  res.send('Food Ordering System Backend is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
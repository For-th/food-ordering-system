const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lutom-restaurant',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  },
});

const upload = multer({ storage });

// Get all products (customer)
// Get all products (customer)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE available = true AND archived = false ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products (admin)
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE archived = false ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get archived products (admin)
router.get('/archived', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE archived = true ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1', [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new product with Cloudinary photo
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const image_url = req.file ? req.file.path : null;

    const result = await pool.query(
      'INSERT INTO products (name, description, price, category, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, category, image_url]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category } = req.body;

    const existing = await pool.query(
      'SELECT * FROM products WHERE id = $1', [id]
    );

    const image_url = req.file
      ? req.file.path
      : existing.rows[0].image_url;

    const result = await pool.query(
      'UPDATE products SET name=$1, description=$2, price=$3, category=$4, image_url=$5 WHERE id=$6 RETURNING *',
      [name, description, price, category, image_url, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { available } = req.body;
    const result = await pool.query(
      'UPDATE products SET available=$1 WHERE id=$2 RETURNING *',
      [available, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Archive product
router.patch('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE products SET archived = true WHERE id=$1 RETURNING *',
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Restore product
router.patch('/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE products SET archived = false WHERE id=$1 RETURNING *',
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
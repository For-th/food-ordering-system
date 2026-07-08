const express = require('express');
const router = express.Router();
const pool = require('../db');
const orderEvents = require('../orderEvents');

// Place a new order
router.post('/', async (req, res) => {
  try {
    const { name, phone, address, landmark, items, delivery_fee } = req.body;

    // Step 1 - Save customer info
    const customer = await pool.query(
      'INSERT INTO customers (name, phone, address, landmark) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, phone, address, landmark]
    );
    const customerId = customer.rows[0].id;

    // Step 2 - Calculate total amount
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    ) + delivery_fee;

    // Step 3 - Save the order
    const order = await pool.query(
      'INSERT INTO orders (customer_id, total_amount, delivery_fee) VALUES ($1, $2, $3) RETURNING *',
      [customerId, totalAmount, delivery_fee]
    );
    const orderId = order.rows[0].id;

    // Step 4 - Save each item in the order
    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES ($1, $2, $3, $4, $5)',
        [orderId, item.product_id, item.name, item.price, item.quantity]
      );
    }

    orderEvents.broadcast('new-order', {
      id: orderId,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    res.json({ message: 'Order placed successfully!', orderId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (admin)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT orders.*, customers.name, customers.phone, 
       customers.address, customers.landmark 
       FROM orders 
       JOIN customers ON orders.customer_id = customers.id 
       ORDER BY orders.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await pool.query(
      `SELECT orders.*, customers.name, customers.phone,
       customers.address, customers.landmark
       FROM orders
       JOIN customers ON orders.customer_id = customers.id
       WHERE orders.id = $1`,
      [id]
    );

    const items = await pool.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );

    res.json({ ...order.rows[0], items: items.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    orderEvents.broadcast('order-updated', {
      id: Number(id),
      status: result.rows[0].status,
    });

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
import React, { useState } from 'react';

function CheckoutPage({ cart, setCart }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    delivery_method: 'delivery',
  });
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [phoneError, setPhoneError] = useState('');

  // Calculate total
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );
  const deliveryFee = form.delivery_method === 'pickup' ? 0 : 50;
  const total = subtotal + deliveryFee;

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const onlyNumbers = value.replace(/\D/g, '');
      setForm((prev) => ({ ...prev, phone: onlyNumbers }));

      if (onlyNumbers && !/^09\d{9}$/.test(onlyNumbers)) {
        setPhoneError('Please enter a valid phone number');
      } else {
        setPhoneError('');
      }
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Validate phone number
    if (!/^09\d{9}$/.test(form.phone)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    setPhoneError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: cart.map(item => ({
            product_id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          delivery_fee: deliveryFee,
          delivery_method: form.delivery_method,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOrderPlaced(true);
        setOrderId(data.orderId);
        setCart([]);
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  // Show success message after order is placed
  if (orderPlaced) {
    return (
      <div className="order-success">
        <h2>🎉 Order Placed Successfully!</h2>
        <p>Your order ID is: <strong>#{orderId}</strong></p>
        <p>Please save your Order ID so you can track your order!</p>
        <p>You can track your order status by clicking <strong>Track Order</strong> in the menu and entering your Order ID.</p>
        <button onClick={() => window.location.href = '/'}>
          Order Again
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-content">

        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          {cart.map(item => (
            <div key={item.id} className="summary-item">
              <span>{item.name} x{item.quantity}</span>
              <span>₱{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Method</span>
              <span>{form.delivery_method === 'pickup' ? 'Pickup' : 'Delivery'}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>₱{deliveryFee}.00</span>
            </div>
            <div className="summary-row total">
              <strong>Total</strong>
              <strong>₱{total.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Delivery Form */}
        <div className="delivery-form">
          <h2>Delivery Details</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Juan Dela Cruz"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="09171234567"
                inputMode="numeric"
                maxLength={11}
                required
              />
              {phoneError && <p id="phone-error" className="error-message">{phoneError}</p>}
            </div>
            <div className="form-group">
              <label>Choose Order Type</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <input
                    type="radio"
                    name="delivery_method"
                    value="delivery"
                    checked={form.delivery_method === 'delivery'}
                    onChange={handleChange}
                  />
                  Deliver to me
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <input
                    type="radio"
                    name="delivery_method"
                    value="pickup"
                    checked={form.delivery_method === 'pickup'}
                    onChange={handleChange}
                  />
                  Pick up
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Delivery Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="123 Rizal St., Brgy. San Jose"
                required={form.delivery_method === 'delivery'}
              />
            </div>
            <div className="form-group">
              <label>Landmark (optional)</label>
              <input
                type="text"
                name="landmark"
                value={form.landmark}
                onChange={handleChange}
                placeholder="Near the church"
              />
            </div>
            <button
              type="submit"
              className="place-order-btn"
              disabled={loading}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default CheckoutPage;

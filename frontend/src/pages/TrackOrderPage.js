import React, { useState } from 'react';

function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCancelSuccess('');
    setOrder(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}`);
      const data = await response.json();

      if (response.ok && data) {
        setOrder(data);
      } else {
        setError('Order not found. Please check your Order ID.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;

    const confirmed = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (response.ok) {
        setCancelSuccess('Your order has been cancelled successfully.');
        setOrder((prev) => prev ? { ...prev, status: 'cancelled' } : prev);
      } else {
        setError('Unable to cancel this order right now.');
      }
    } catch (error) {
      setError('Something went wrong while cancelling the order.');
    }
  };

  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'preparing': return 2;
      case 'out for delivery': return 3;
      case 'delivered': return 4;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  const steps = [
    { label: 'Order Placed', icon: '📋' },
    { label: 'Preparing', icon: '👨‍🍳' },
    { label: 'Out for Delivery', icon: '🛵' },
    { label: 'Delivered', icon: '✅' },
  ];

  return (
    <div className="track-page">
      <div className="track-card">
        <h2>🔍 Track Your Order</h2>
        <p>Enter your Order ID to check your delivery status.</p>

        <form onSubmit={handleTrack}>
          <div className="form-group">
            <label>Order ID</label>
            <input
              type="number"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your Order ID (e.g. 1)"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button
            type="submit"
            className="place-order-btn"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {order && (
          <div className="track-result">
            <h3>Order #{order.id}</h3>
            <p className="track-customer">
              Hello, <strong>{order.name}</strong>! Here is your order status:
            </p>

            {cancelSuccess && <p className="success-message">{cancelSuccess}</p>}
            {error && <p className="error-message">{error}</p>}

            {order.status === 'cancelled' ? (
              <p className="error-message">This order has been cancelled.</p>
            ) : (
              <div className="status-steps">
                {steps.map((step, index) => {
                  const stepNumber = index + 1;
                  const currentStep = getStatusStep(order.status);
                  const isCompleted = stepNumber <= currentStep;
                  return (
                    <div
                      key={index}
                      className={`status-step ${isCompleted ? 'completed' : ''}`}
                    >
                      <div className="step-icon">{step.icon}</div>
                      <div className="step-label">{step.label}</div>
                      {index < steps.length - 1 && (
                        <div className={`step-line ${isCompleted && stepNumber < currentStep ? 'completed' : ''}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Order Items */}
            <div className="track-items">
              <h4>Items Ordered:</h4>
              {order.items && order.items.map((item, index) => (
                <div key={index} className="track-item">
                  <span>{item.name} x{item.quantity}</span>
                  <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="track-total">
                <span>Delivery Fee</span>
                <span>₱{order.delivery_fee}</span>
              </div>
              <div className="track-total total">
                <strong>Total</strong>
                <strong>₱{order.total_amount}</strong>
              </div>
            </div>

            {order.status !== 'cancelled' && (
              <button
                type="button"
                className="place-order-btn"
                onClick={handleCancelOrder}
                style={{ marginTop: '1rem', backgroundColor: '#e74c3c' }}
              >
                Cancel Order
              </button>
            )}

            {/* Delivery Address */}
            <div className="track-address">
              <h4>Order Type:</h4>
              <p>{order.delivery_method === 'pickup' ? 'Pickup' : 'Delivery'}</p>
              <h4>Delivery Address:</h4>
              <p>{order.address}</p>
              {order.landmark && <p>Landmark: {order.landmark}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackOrderPage;
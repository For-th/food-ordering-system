import React, { useState, useEffect } from 'react';

function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get all orders
  const fetchOrders = () => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update order status
  const updateStatus = async (orderId, newStatus) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert('Failed to update status.');
    }
  };

  // Get badge color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#e74c3c';
      case 'preparing': return '#f39c12';
      case 'out for delivery': return '#3498db';
      case 'delivered': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  if (loading) return <h2 style={{ padding: '2rem' }}>Loading orders...</h2>;

  return (
    <div className="admin-page">
      <h1>Admin Panel — Incoming Orders</h1>
      <button className="refresh-btn" onClick={fetchOrders}>
        🔄 Refresh Orders
      </button>

      {orders.length === 0 ? (
        <p className="no-orders">No orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </span>
              </div>

              <div className="order-customer">
                <p><strong>Name:</strong> {order.name}</p>
                <p><strong>Phone:</strong> {order.phone}</p>
                <p><strong>Address:</strong> {order.address}</p>
                {order.landmark && (
                  <p><strong>Landmark:</strong> {order.landmark}</p>
                )}
              </div>

              <div className="order-amounts">
                <p><strong>Delivery Fee:</strong> ₱{order.delivery_fee}</p>
                <p><strong>Total:</strong> ₱{order.total_amount}</p>
              </div>

              <div className="order-actions">
                <p><strong>Update Status:</strong></p>
                <div className="status-buttons">
                  <button
                    onClick={() => updateStatus(order.id, 'pending')}
                    style={{ backgroundColor: '#e74c3c' }}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, 'preparing')}
                    style={{ backgroundColor: '#f39c12' }}
                  >
                    Preparing
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, 'out for delivery')}
                    style={{ backgroundColor: '#3498db' }}
                  >
                    Out for Delivery
                  </button>
                  <button
                    onClick={() => updateStatus(order.id, 'delivered')}
                    style={{ backgroundColor: '#2ecc71' }}
                  >
                    Delivered
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminPage;
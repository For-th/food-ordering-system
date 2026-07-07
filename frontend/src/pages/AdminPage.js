import React, { useState, useEffect } from 'react';

function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  const fetchOrders = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/orders`)
      .then(res => res.json())
      .then(data => {
        setOrders(data.filter(o => o.status !== 'delivered'));
        setCompletedOrders(data.filter(o => o.status === 'delivered'));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();

    const eventSource = new EventSource(`${process.env.REACT_APP_API_URL}/api/orders/stream`);

    eventSource.addEventListener('new-order', () => {
      fetchOrders();
    });

    eventSource.onmessage = () => {
      fetchOrders();
    };

    eventSource.onerror = () => {
      console.error('Order stream disconnected');
    };

    const interval = setInterval(fetchOrders, 30000);

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/orders/${orderId}/status`, {
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
      <h1>Orders</h1>

      {/* Tabs */}
      <div className="orders-tabs">
        <button
          className={`orders-tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Orders
          {orders.length > 0 && (
            <span className="tab-badge">{orders.length}</span>
          )}
        </button>
        <button
          className={`orders-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
          {completedOrders.length > 0 && (
            <span className="tab-badge completed">{completedOrders.length}</span>
          )}
        </button>
      </div>

      {/* Active Orders */}
      {activeTab === 'active' && (
        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="empty-orders">
              <p>🎉 No active orders right now!</p>
              <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '0.5rem' }}>
                New orders will appear here automatically.
              </p>
            </div>
          ) : (
            orders.map(order => (
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
                  <p>Update Status:</p>
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
                      Delivered ✓
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Completed Orders */}
      {activeTab === 'completed' && (
        <div className="orders-list">
          {completedOrders.length === 0 ? (
            <div className="empty-orders">
              <p>No completed orders yet.</p>
            </div>
          ) : (
            <>
              <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {completedOrders.length} order{completedOrders.length > 1 ? 's' : ''} completed
              </p>
              {completedOrders.map(order => (
                <div key={order.id} className="order-card completed-card">
                  <div className="order-header">
                    <div>
                      <h3>Order #{order.id}</h3>
                      <p className="order-date">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: '#2ecc71' }}
                    >
                      Delivered ✓
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
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPage;
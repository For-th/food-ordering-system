import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import TrackOrderPage from './pages/TrackOrderPage';
import ProductManagePage from './pages/ProductManagePage';
import Cart from './components/Cart';
import ProtectedRoute from './components/ProtectedRoute';

function MainLayout() {
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState('menu');

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="App">
      <header className="header">
        <h1>Lutóm</h1>
        <nav>
          <button onClick={() => setPage('menu')}>Menu</button>
          <button onClick={() => setPage('checkout')}>
            Checkout {cartCount > 0 && `(${cartCount})`}
          </button>
          <button onClick={() => setPage('track')}>Track Order</button>
        </nav>
      </header>

      {page === 'menu' && (
        <>
          <div className="hero">
            <div className="hero-label">Fresh & Hot</div>
            <div className="hero-title">Real food. Real flavors.<br />Right at your door.</div>
            <div className="hero-sub">Order now • Delivered to your door</div>
          </div>
          <div className="main-content">
            <MenuPage cart={cart} setCart={setCart} />
            <Cart cart={cart} setCart={setCart} onCheckout={() => setPage('checkout')} />
          </div>
          {cartCount > 0 && (
            <div className="cart-float-bar">
              <div className="cart-float-left">
                <div className="cart-float-count">{cartCount} item{cartCount > 1 ? 's' : ''}</div>
                <div className="cart-float-amount">₱{cartTotal.toFixed(2)}</div>
              </div>
              <button className="cart-float-btn" onClick={() => setPage('checkout')}>
                View Cart →
              </button>
            </div>
          )}
        </>
      )}

      {page === 'checkout' && (
        <CheckoutPage cart={cart} setCart={setCart} />
      )}

      {page === 'track' && (
        <TrackOrderPage />
      )}
    </div>
  );
}

function AdminLayout() {
  const navigate = useNavigate();
  const [adminPage, setAdminPage] = useState('orders');

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Lutóm Admin</h1>
        <nav>
          <button onClick={() => setAdminPage('orders')}>Orders</button>
          <button onClick={() => setAdminPage('products')}>Menu</button>
          <button onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      {adminPage === 'orders' && <AdminPage />}
      {adminPage === 'products' && <ProductManagePage />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/track" element={<TrackOrderPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
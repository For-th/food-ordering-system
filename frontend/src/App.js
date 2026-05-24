import ProductManagePage from './pages/ProductManagePage';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import TrackOrderPage from './pages/TrackOrderPage';
import Cart from './components/Cart';
import ProtectedRoute from './components/ProtectedRoute';

function MainLayout() {
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState('menu');

  return (
    <div className="App">
      <header className="header">
        <h1>🍽️ Our Restaurant</h1>
        <nav>
          <button onClick={() => setPage('menu')}>Menu</button>
          <button onClick={() => setPage('checkout')}>
            Checkout {cart.length > 0 && `(${cart.length})`}
          </button>
          <button onClick={() => setPage('track')}>Track Order</button>
        </nav>
      </header>

      {page === 'menu' && (
        <div className="main-content">
          <MenuPage cart={cart} setCart={setCart} />
          <Cart cart={cart} setCart={setCart} />
        </div>
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
        <h1>🍽️ Restaurant Admin</h1>
        <nav>
          <button onClick={() => setAdminPage('orders')}>Orders</button>
          <button onClick={() => setAdminPage('products')}>Menu Management</button>
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
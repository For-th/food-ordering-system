import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Admin password — change this to your own password!
    if (password === 'admin123') {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>🔒 Admin Login</h2>
        <p>Enter your password to access the admin panel.</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="place-order-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
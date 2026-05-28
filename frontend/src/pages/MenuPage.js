import React, { useState, useEffect } from 'react';

function MenuPage({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Get unique categories
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter products by category
  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  if (loading) return (
    <div className="menu-page">
      <p style={{ color: '#888', fontSize: '0.9rem' }}>Loading menu...</p>
    </div>
  );

  return (
    <div className="menu-page">
      {/* Category Filter */}
      <div className="categories" style={{ padding: '0 0 1rem 0', marginBottom: '1rem' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="section-title">
        {activeCategory === 'All' ? 'All Items' : activeCategory}
      </p>

      {filtered.length === 0 ? (
        <p style={{ color: '#888' }}>No items available.</p>
      ) : (
        <div className="products-grid">
          {filtered.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.image_url} alt={product.name} />
              <div className="product-card-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-footer">
                  <span>₱{product.price}</span>
                  <button onClick={() => addToCart(product)}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MenuPage;
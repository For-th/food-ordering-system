import React from 'react';

function Cart({ cart, setCart, onCheckout }) {
  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const increaseQty = (id) => {
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const decreaseQty = (id) => {
    setCart(cart.map(item =>
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );
  const deliveryFee = 50;
  const total = subtotal + deliveryFee;

  if (cart.length === 0) return (
    <div className="cart">
      <h2>Your Cart</h2>
      <p style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '1rem' }}>
        Your cart is empty. Add items from the menu!
      </p>
    </div>
  );

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      {cart.map(item => (
        <div key={item.id} className="cart-item">
          <span style={{ flex: 1, fontWeight: 600, fontSize: '0.85rem' }}>{item.name}</span>
          <div className="cart-item-controls">
            <button onClick={() => decreaseQty(item.id)}>−</button>
            <span style={{ minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
            <button onClick={() => increaseQty(item.id)}>+</button>
          </div>
          <span style={{ minWidth: '55px', textAlign: 'right', fontWeight: 600 }}>
            ₱{(item.price * item.quantity).toFixed(2)}
          </span>
          <button onClick={() => removeItem(item.id)}>remove</button>
        </div>
      ))}
      <div className="cart-total">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal</span>
          <span>₱{subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Delivery Fee</span>
          <span>₱{deliveryFee}.00</span>
        </div>
        <hr className="cart-divider" />
        <div className="cart-grand-total">
          <span>Total</span>
          <span>₱{total.toFixed(2)}</span>
        </div>
      </div>
      <button className="cart-checkout-btn" onClick={onCheckout}>
        Proceed to Checkout →
      </button>
    </div>
  );
}

export default Cart;
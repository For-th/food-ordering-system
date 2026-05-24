import React, { useState, useEffect } from 'react';

function ProductManagePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // Get all products
  const fetchProducts = () => {
    fetch('/api/products/all')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Open form for adding new product
  const handleAddNew = () => {
    setEditProduct(null);
    setForm({ name: '', description: '', price: '', category: '' });
    setImage(null);
    setImagePreview(null);
    setShowForm(true);
  };

  // Open form for editing existing product
  const handleEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
    });
    setImage(null);
    setImagePreview(product.image_url);
    setShowForm(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('category', form.category);
    if (image) formData.append('image', image);

    try {
      const url = editProduct
        ? `/api/products/${editProduct.id}`
        : '/api/products';
      const method = editProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        fetchProducts();
        setShowForm(false);
        alert(editProduct
          ? 'Product updated successfully!'
          : 'Product added successfully!'
        );
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    }

    setSaving(false);
  };

  // Toggle availability
  const handleToggle = async (product) => {
    try {
      await fetch(`/api/products/${product.id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !product.available }),
      });
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
      alert('Product deleted successfully!');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <h2 style={{ padding: '2rem' }}>Loading products...</h2>;

  return (
    <div className="manage-page">
      <div className="manage-header">
        <h2>Menu Management</h2>
        <button className="add-btn" onClick={handleAddNew}>
          + Add New Item
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="product-form-card">
          <h3>{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Chicken Adobo"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Main Course"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. Classic Filipino chicken adobo with rice"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price (₱)</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="e.g. 120"
                  required
                />
              </div>
              <div className="form-group">
                <label>Food Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}

            <div className="form-buttons">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="place-order-btn"
                disabled={saving}
              >
                {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="manage-products">
        {products.length === 0 ? (
          <p>No products yet. Click "Add New Item" to get started!</p>
        ) : (
          products.map(product => (
            <div
              key={product.id}
              className={`manage-product-card ${!product.available ? 'unavailable' : ''}`}
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="manage-product-img"
              />
              <div className="manage-product-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p className="manage-product-price">₱{product.price}</p>
                <span className="manage-product-category">
                  {product.category}
                </span>
              </div>
              <div className="manage-product-actions">
                <button
                  className="toggle-btn"
                  onClick={() => handleToggle(product)}
                  style={{
                    backgroundColor: product.available ? '#2ecc71' : '#95a5a6'
                  }}
                >
                  {product.available ? 'Available' : 'Hidden'}
                </button>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(product.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductManagePage;
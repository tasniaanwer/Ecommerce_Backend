import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Checkbox, Radio } from "antd";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import toast from "react-hot-toast";
import "../styles/Homepage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useCart();
  const [auth] = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  //get all cat
  const getAllCategory = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data?.success) {
        setCategories(data?.category);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllCategory();
    getTotal();
  }, []);
  //get products
  const getAllProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      setLoading(false);
      setProducts(data.products);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  //getTOtal COunt
  const getTotal = async () => {
    try {
      const { data } = await axios.get("/api/v1/product/product-count");
      setTotal(data?.total);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (page === 1) return;
    loadMore();
  }, [page]);
  //load more
  const loadMore = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
      setLoading(false);
      setProducts([...products, ...data?.products]);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // filter by cat
  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((c) => c !== id);
    }
    setChecked(all);
  };
  useEffect(() => {
    if (!checked.length || !radio.length) getAllProducts();
  }, [checked.length, radio.length]);

  useEffect(() => {
    if (checked.length || radio.length) filterProduct();
  }, [checked, radio]);

  // Add to cart function with authentication check
  const handleAddToCart = (product) => {
    if (!auth?.token) {
      // Redirect to login with return URL
      navigate("/login", {
        state: { from: window.location.pathname }
      });
      toast.error("Please login to add items to cart", {
        duration: 3000,
        position: "top-center"
      });
      return;
    }

    // Add to cart if authenticated
    setCart([...cart, product]);
    toast.success("⚡ Item added to cart!");
  };

  //get filterd product
  const filterProduct = async () => {
    try {
      const { data } = await axios.post("/api/v1/product/product-filters", {
        checked,
        radio,
      });
      setProducts(data?.products);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Layout title={"📱 TechHub - Discover Latest Gadgets"}>
      {/* Original Hero Section - Temporarily Disabled Creative Hero */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">📱 Welcome to TechHub</h1>
          <p className="hero-subtitle">Discover the latest gadgets and electronics from top brands at unbeatable prices</p>
          <div className="hero-buttons">
            <button className="btn-modern" onClick={() => navigate('/categories')}>
              🛍️ Browse Products
            </button>
          </div>
        </div>
      </div>

      <div className="home-page">
        {/* Filters Section */}
        <div className="filters-section">
          <h3 className="filters-title">🔍 Refine Your Search</h3>
          <div className="filters-grid">
            {/* Category Filter */}
            <div className="filter-group">
              <div className="filter-label">📱 Categories</div>
              {categories?.map((c) => (
                <div key={c._id} className="filter-option">
                  <Checkbox
                    onChange={(e) => handleFilter(e.target.checked, c._id)}
                  >
                    ⚡ {c.name}
                  </Checkbox>
                </div>
              ))}
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <div className="filter-label">💰 Price Range</div>
              <Radio.Group onChange={(e) => setRadio(e.target.value)}>
                {Prices?.map((p) => (
                  <div key={p._id} className="filter-option">
                    <Radio value={p.array}>{p.name}</Radio>
                  </div>
                ))}
              </Radio.Group>
            </div>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              className="btn-modern btn-outline"
              onClick={() => window.location.reload()}
            >
              🔄 Reset Filters
            </button>
          </div>
        </div>

        {/* Products Section */}
        <div className="section-header">
          <h2 className="section-title">🔥 Featured Gadgets</h2>
          <p className="section-subtitle">Latest tech and electronics just for you</p>
        </div>

        {/* Products Grid */}
        {products?.length > 0 ? (
          <>
            <div className="products-grid">
              {products?.map((p) => (
                <div className="product-card" key={p._id}>
                  <div className="product-image-container">
                    <img
                      src={`/api/v1/product/product-photo/${p._id}`}
                      className="product-image"
                      alt={p.name}
                    />
                    {p.quantity > 0 ? (
                      <span className="product-badge">✨ In Stock</span>
                    ) : (
                      <span className="product-badge" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                        ❌ Out of Stock
                      </span>
                    )}
                  </div>
                  <div className="product-content">
                    <div className="product-category">📱 {p.category?.name}</div>
                    <h3 className="product-title">{p.name}</h3>
                    <p className="product-description">
                      {p.description?.substring(0, 100)}...
                    </p>
                    <div className="product-footer">
                      <div className="product-price">{p.price}</div>
                      <div className="btn-group">
                        <button
                          className="btn-modern"
                          onClick={() => navigate(`/product/${p.slug}`)}
                        >
                          🔍 View
                        </button>
                        <button
                          className="btn-modern"
                          onClick={() => handleAddToCart(p)}
                          disabled={p.quantity === 0}
                          style={{
                            opacity: p.quantity === 0 ? 0.5 : 1,
                            cursor: p.quantity === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          🛒 {p.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="loadmore-container">
              {products && products.length < total && (
                <button
                  className="loadmore-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(page + 1);
                  }}
                  disabled={loading}
                >
                  {loading ? "⏳ Loading..." : "⚡ Load More Gadgets"}
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📱</div>
            <h3 className="empty-state-title">No Gadgets Found</h3>
            <p className="empty-state-message">
              Try adjusting your filters or search for something different
            </p>
            <button
              className="btn-modern"
              onClick={() => window.location.reload()}
            >
              🔄 Reset & Start Over
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;

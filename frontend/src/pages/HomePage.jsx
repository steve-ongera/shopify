import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productAPI, categoryAPI } from '../services/api'
import ProductCard from '../components/ProductCard'

const ICONS = {
  'Electronics': 'bi-phone',
  'Fashion': 'bi-bag',
  'Home & Kitchen': 'bi-house',
  'Beauty & Health': 'bi-heart-pulse',
  'Sports & Outdoors': 'bi-trophy',
  'Books': 'bi-book',
  'Toys & Kids': 'bi-balloon',
  'Groceries': 'bi-basket',
}

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      productAPI.list('?featured=true&page_size=8'),
      productAPI.list('?ordering=-created_at&page_size=8'),
      categoryAPI.list(),
    ]).then(([feat, newArr, cats]) => {
      setFeatured(feat.results || feat || [])
      setNewArrivals(newArr.results || newArr || [])
      setCategories(cats.results || cats || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-tag">Kenya's Trusted Online Store</div>
          <h1 className="hero-title">
            Shop Smart,<br />
            <span className="hero-highlight">Pick Up Near You</span>
          </h1>
          <p className="hero-subtitle">
            Thousands of products across Kenya. Order online and pick up at a station in your county — Mombasa, Nairobi, Kisumu and more.
          </p>
          <div className="hero-ctas">
            <Link to="/store" className="btn-primary">
              <i className="bi bi-grid-3x3-gap" /> Shop All Products
            </Link>
            <Link to="/register" className="btn-secondary">
              <i className="bi bi-person-plus" /> Create Account
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">10K+</span><span className="stat-label">Products</span></div>
            <div className="stat"><span className="stat-num">50+</span><span className="stat-label">Stations</span></div>
            <div className="stat"><span className="stat-num">99%</span><span className="stat-label">Satisfied</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card hero-card-1">
            <i className="bi bi-phone" />
            <span>Electronics</span>
          </div>
          <div className="hero-card hero-card-2">
            <i className="bi bi-bag" />
            <span>Fashion</span>
          </div>
          <div className="hero-card hero-card-3">
            <i className="bi bi-house" />
            <span>Home</span>
          </div>
          <div className="hero-circle" />
        </div>
      </section>

      {/* Value Props */}
      <section className="value-props">
        <div className="value-props-inner">
          <div className="value-prop">
            <i className="bi bi-geo-alt-fill" />
            <div>
              <h4>Pickup Stations</h4>
              <p>Across Kenya</p>
            </div>
          </div>
          <div className="value-prop">
            <i className="bi bi-shield-check-fill" />
            <div>
              <h4>Secure Payments</h4>
              <p>M-Pesa STK Push</p>
            </div>
          </div>
          <div className="value-prop">
            <i className="bi bi-arrow-counterclockwise" />
            <div>
              <h4>Easy Returns</h4>
              <p>7 Day Returns</p>
            </div>
          </div>
          <div className="value-prop">
            <i className="bi bi-headset" />
            <div>
              <h4>24/7 Support</h4>
              <p>Always Here</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Shop By Category</h2>
          <Link to="/store" className="section-link">View All <i className="bi bi-arrow-right" /></Link>
        </div>
        <div className="categories-grid">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="category-card skeleton" />
            ))
          ) : categories.map(cat => (
            <Link key={cat.slug} to={`/category/${cat.slug}`} className="category-card">
              <div className="category-icon">
                <i className={`bi ${ICONS[cat.name] || 'bi-tag'}`} />
              </div>
              <h3 className="category-name">{cat.name}</h3>
              <span className="category-count">{cat.product_count} items</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section section-alt">
        <div className="section-header">
          <h2 className="section-title"><i className="bi bi-star-fill text-warning" /> Featured Products</h2>
          <Link to="/store?featured=true" className="section-link">See All <i className="bi bi-arrow-right" /></Link>
        </div>
        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="product-card skeleton" />)}
          </div>
        ) : featured.length > 0 ? (
          <div className="products-grid">
            {featured.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="empty-state">No featured products yet.</div>
        )}
      </section>

      {/* Pickup stations banner */}
      <section className="pickup-banner">
        <div className="pickup-banner-inner">
          <div className="pickup-banner-text">
            <h2><i className="bi bi-geo-alt-fill" /> Pickup Stations Across Kenya</h2>
            <p>Order online and pick up from a station near you. Affordable delivery fees for every county.</p>
          </div>
          <div className="pickup-locations">
            {[
              { name: 'Shanzu TTC', county: 'Mombasa', fee: 150 },
              { name: 'Bamburi', county: 'Mombasa', fee: 120 },
              { name: 'Nairobi CBD', county: 'Nairobi', fee: 100 },
              { name: 'Westlands', county: 'Nairobi', fee: 150 },
              { name: 'Kisumu CBD', county: 'Kisumu', fee: 200 },
            ].map(s => (
              <div key={s.name} className="pickup-station-chip">
                <i className="bi bi-pin-map-fill" />
                <div>
                  <span className="pickup-name">{s.name}</span>
                  <span className="pickup-county">{s.county} · KSh {s.fee}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title"><i className="bi bi-lightning-charge-fill text-primary" /> New Arrivals</h2>
          <Link to="/store?ordering=-created_at" className="section-link">See All <i className="bi bi-arrow-right" /></Link>
        </div>
        {loading ? (
          <div className="products-grid">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="product-card skeleton" />)}
          </div>
        ) : (
          <div className="products-grid">
            {newArrivals.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-banner-inner">
          <div className="cta-text">
            <h2>Ready to Start Shopping?</h2>
            <p>Join thousands of happy customers across Kenya.</p>
          </div>
          <div className="cta-actions">
            <Link to="/register" className="btn-primary btn-lg">
              <i className="bi bi-person-plus" /> Create Free Account
            </Link>
            <Link to="/store" className="btn-outline btn-lg">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { productAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useFlash } from '../context/FlashContext'
import ProductCard, { getImageUrl, formatPrice, StarRating } from '../components/ProductCard'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(null)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [activeTab, setActiveTab] = useState('description')

  const { addToCart, loading: cartLoading } = useCart()
  const { isAuthenticated } = useAuth()
  const { showFlash } = useFlash()
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    setProduct(null)
    window.scrollTo(0, 0)
    Promise.all([
      productAPI.detail(slug),
      productAPI.related(slug),
    ]).then(([prod, rel]) => {
      setProduct(prod)
      setActiveImage(prod.image)
      setRelated(rel || [])
    }).catch(() => {
      showFlash('Product not found.', 'error')
      navigate('/store')
    }).finally(() => setLoading(false))
  }, [slug])

  const handleAddToCart = () => {
    if (!isAuthenticated) { showFlash('Please login to add items to cart.', 'error'); navigate('/login'); return }
    addToCart(product.id, qty)
  }

  const handleBuyNow = () => {
    if (!isAuthenticated) { showFlash('Please login to continue.', 'error'); navigate('/login'); return }
    addToCart(product.id, qty)
    navigate('/cart')
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { showFlash('Login to leave a review.', 'error'); return }
    setSubmittingReview(true)
    try {
      await productAPI.review(slug, { rating: reviewRating, comment: reviewText })
      showFlash('Review submitted successfully!', 'success')
      const updated = await productAPI.detail(slug)
      setProduct(updated)
      setReviewText('')
    } catch (err) {
      showFlash(err.error || 'Failed to submit review.', 'error')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) return (
    <div className="product-detail-page">
      <div className="product-detail-skeleton">
        <div className="skeleton product-detail-img-skeleton" />
        <div className="product-detail-info-skeleton">
          <div className="skeleton" style={{ height: 32, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 20, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 20, marginBottom: 24, width: '60%' }} />
          <div className="skeleton" style={{ height: 48, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 48 }} />
        </div>
      </div>
    </div>
  )

  if (!product) return null

  const allImages = [product.image, ...(product.images || []).map(i => i.image)].filter(Boolean)

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb-nav">
        <Link to="/">Home</Link>
        <i className="bi bi-chevron-right" />
        <Link to="/store">Store</Link>
        <i className="bi bi-chevron-right" />
        {product.category && (
          <>
            <Link to={`/category/${product.category.slug}`}>{product.category.name}</Link>
            <i className="bi bi-chevron-right" />
          </>
        )}
        <span>{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="product-detail-grid">
        {/* Images */}
        <div className="product-images">
          <div className="product-main-image-wrap">
            <img
              src={getImageUrl(activeImage)}
              alt={product.name}
              className="product-main-image"
              onError={e => { e.target.src = '/placeholder.jpg' }}
            />
            {product.discount_percentage > 0 && (
              <span className="product-badge badge-discount badge-lg">-{product.discount_percentage}%</span>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="product-thumbnails">
              {allImages.map((img, i) => (
                <button key={i} className={`thumb-btn ${activeImage === img ? 'active' : ''}`} onClick={() => setActiveImage(img)}>
                  <img src={getImageUrl(img)} alt={`${product.name} ${i + 1}`} onError={e => { e.target.src = '/placeholder.jpg' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-info">
          {product.category && (
            <Link to={`/category/${product.category.slug}`} className="product-detail-category">
              <i className="bi bi-tag" /> {product.category.name}
            </Link>
          )}
          <h1 className="product-detail-title">{product.name}</h1>

          <div className="product-detail-meta">
            <StarRating rating={product.average_rating} count={product.review_count} />
            <span className="product-sku">SKU: {product.sku}</span>
          </div>

          <div className="product-detail-pricing">
            <span className="product-detail-price">{formatPrice(product.price)}</span>
            {product.compare_price && (
              <span className="product-detail-compare">{formatPrice(product.compare_price)}</span>
            )}
            {product.discount_percentage > 0 && (
              <span className="product-detail-saving">You save {formatPrice(product.compare_price - product.price)}</span>
            )}
          </div>

          <div className={`stock-status ${product.in_stock ? 'in-stock' : 'out-stock'}`}>
            <i className={`bi ${product.in_stock ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} />
            {product.in_stock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </div>

          {product.short_description && (
            <p className="product-detail-short-desc">{product.short_description}</p>
          )}

          {product.in_stock && (
            <div className="product-actions">
              <div className="qty-selector">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}><i className="bi bi-dash" /></button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}><i className="bi bi-plus" /></button>
              </div>
              <button className="btn-primary btn-add-cart" onClick={handleAddToCart} disabled={cartLoading}>
                <i className="bi bi-cart-plus" /> Add to Cart
              </button>
              <button className="btn-buy-now" onClick={handleBuyNow}>
                <i className="bi bi-lightning-charge-fill" /> Buy Now
              </button>
            </div>
          )}

          <div className="product-features">
            <div className="feature"><i className="bi bi-geo-alt-fill" /> Pickup across Kenya</div>
            <div className="feature"><i className="bi bi-shield-check-fill" /> Secure M-Pesa payment</div>
            <div className="feature"><i className="bi bi-arrow-counterclockwise" /> 7-day returns</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="product-tabs">
        <div className="tab-nav">
          {['description', 'reviews'].map(tab => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'description' ? 'Description' : `Reviews (${product.review_count})`}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="tab-content">
            <div className="product-description">{product.description}</div>
            {product.weight && (
              <div className="product-spec"><strong>Weight:</strong> {product.weight} kg</div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="tab-content">
            {product.reviews?.length > 0 ? (
              <div className="reviews-list">
                {product.reviews.map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <span className="review-author"><i className="bi bi-person-circle" /> {review.user_name}</span>
                      <div className="review-stars">
                        {[1,2,3,4,5].map(s => (
                          <i key={s} className={`bi ${s <= review.rating ? 'bi-star-fill' : 'bi-star'}`} />
                        ))}
                      </div>
                      <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state"><p>No reviews yet. Be the first!</p></div>
            )}

            {isAuthenticated && (
              <form className="review-form" onSubmit={handleReview}>
                <h4>Write a Review</h4>
                <div className="rating-select">
                  {[1,2,3,4,5].map(s => (
                    <button type="button" key={s} onClick={() => setReviewRating(s)}
                      className={`star-btn ${s <= reviewRating ? 'active' : ''}`}>
                      <i className="bi bi-star-fill" />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product..."
                  required
                  rows={4}
                  className="review-textarea"
                />
                <button type="submit" className="btn-primary" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Related Products</h2>
          </div>
          <div className="products-grid">
            {related.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
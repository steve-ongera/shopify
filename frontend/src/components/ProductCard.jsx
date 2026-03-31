import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useFlash } from '../context/FlashContext'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'

export function getImageUrl(path) {
  if (!path) return '/placeholder.jpg'
  if (path.startsWith('http')) return path
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

export function StarRating({ rating, count }) {
  if (!rating) return <span className="no-rating">No reviews yet</span>
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <i key={star} className={`bi ${star <= Math.round(rating) ? 'bi-star-fill' : star - 0.5 <= rating ? 'bi-star-half' : 'bi-star'}`} />
      ))}
      <span className="rating-count">({count || 0})</span>
    </div>
  )
}

export function formatPrice(amount) {
  return `KSh ${Number(amount).toLocaleString('en-KE')}`
}

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart()
  const { isAuthenticated } = useAuth()
  const { showFlash } = useFlash()
  const navigate = useNavigate()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      showFlash('Please login to add items to cart.', 'error')
      navigate('/login')
      return
    }
    addToCart(product.id)
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product.slug}`} className="product-card-link">
        <div className="product-card-image-wrap">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="product-card-image"
            onError={e => { e.target.src = '/placeholder.jpg' }}
            loading="lazy"
          />
          {product.discount_percentage > 0 && (
            <span className="product-badge badge-discount">-{product.discount_percentage}%</span>
          )}
          {!product.in_stock && (
            <span className="product-badge badge-out">Out of Stock</span>
          )}
          {product.is_featured && product.in_stock && (
            <span className="product-badge badge-featured">Featured</span>
          )}
          <div className="product-card-overlay">
            <button
              className="quick-add-btn"
              onClick={handleAddToCart}
              disabled={loading || !product.in_stock}
            >
              <i className="bi bi-cart-plus" />
              {product.in_stock ? ' Add to Cart' : ' Out of Stock'}
            </button>
          </div>
        </div>
        <div className="product-card-body">
          <span className="product-card-category">{product.category_name}</span>
          <h3 className="product-card-title">{product.name}</h3>
          <StarRating rating={product.average_rating} count={0} />
          <div className="product-card-pricing">
            <span className="product-price">{formatPrice(product.price)}</span>
            {product.compare_price && (
              <span className="product-compare-price">{formatPrice(product.compare_price)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
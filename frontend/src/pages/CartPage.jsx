import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getImageUrl, formatPrice } from '../components/ProductCard'

export default function CartPage() {
  const { cart, updateItem, removeItem, clearCart, loading } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated) return (
    <div className="cart-page">
      <div className="empty-state large">
        <i className="bi bi-cart-x" />
        <h2>Your Cart is Empty</h2>
        <p>Please login to view your cart and start shopping.</p>
        <div className="empty-state-actions">
          <Link to="/login" className="btn-primary">Login</Link>
          <Link to="/store" className="btn-secondary">Browse Products</Link>
        </div>
      </div>
    </div>
  )

  if (!cart.items || cart.items.length === 0) return (
    <div className="cart-page">
      <div className="empty-state large">
        <i className="bi bi-cart-x" />
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/store" className="btn-primary"><i className="bi bi-bag" /> Start Shopping</Link>
      </div>
    </div>
  )

  return (
    <div className="cart-page">
      <div className="page-header">
        <h1 className="page-title"><i className="bi bi-cart2" /> Shopping Cart</h1>
        <span className="products-count">{cart.total_items} item{cart.total_items !== 1 ? 's' : ''}</span>
      </div>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          <div className="cart-items-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>

          {cart.items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-product">
                <Link to={`/products/${item.product.slug}`}>
                  <img
                    src={getImageUrl(item.product.image)}
                    alt={item.product.name}
                    className="cart-item-img"
                    onError={e => { e.target.src = '/placeholder.jpg' }}
                  />
                </Link>
                <div className="cart-item-details">
                  <Link to={`/products/${item.product.slug}`} className="cart-item-name">
                    {item.product.name}
                  </Link>
                  <span className="cart-item-category">{item.product.category_name}</span>
                  {!item.product.in_stock && (
                    <span className="out-of-stock-warn"><i className="bi bi-exclamation-triangle" /> Out of stock</span>
                  )}
                </div>
              </div>

              <div className="cart-item-price" data-label="Price">
                {formatPrice(item.product.price)}
              </div>

              <div className="cart-item-qty" data-label="Qty">
                <div className="qty-selector qty-sm">
                  <button onClick={() => updateItem(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                    <i className="bi bi-dash" />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateItem(item.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>
                    <i className="bi bi-plus" />
                  </button>
                </div>
              </div>

              <div className="cart-item-total" data-label="Total">
                <strong>{formatPrice(item.total_price)}</strong>
              </div>

              <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
                <i className="bi bi-trash3" />
              </button>
            </div>
          ))}

          <div className="cart-footer-actions">
            <button className="btn-secondary" onClick={clearCart}>
              <i className="bi bi-trash" /> Clear Cart
            </button>
            <Link to="/store" className="btn-secondary">
              <i className="bi bi-arrow-left" /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3 className="summary-title">Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({cart.total_items} items)</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span className="text-muted">Calculated at checkout</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-row summary-total">
            <span>Estimated Total</span>
            <span>{formatPrice(cart.subtotal)}</span>
          </div>
          <button
            className="btn-primary btn-block"
            onClick={() => navigate('/order')}
            disabled={loading}
          >
            <i className="bi bi-credit-card" /> Proceed to Checkout
          </button>
          <div className="summary-security">
            <i className="bi bi-shield-lock-fill" /> Secure M-Pesa checkout
          </div>
          <div className="summary-methods">
            <span><i className="bi bi-phone" /> M-Pesa</span>
            <span><i className="bi bi-cash" /> Cash on Pickup</span>
          </div>
        </div>
      </div>
    </div>
  )
}
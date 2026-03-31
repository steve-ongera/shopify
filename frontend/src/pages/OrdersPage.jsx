import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { orderAPI } from '../services/api'
import { formatPrice } from '../components/ProductCard'

const STATUS_COLORS = {
  pending: 'status-pending', confirmed: 'status-confirmed', processing: 'status-processing',
  shipped: 'status-shipped', ready_for_pickup: 'status-ready', delivered: 'status-delivered',
  cancelled: 'status-cancelled', refunded: 'status-refunded',
}
const STATUS_ICONS = {
  pending: 'bi-clock', confirmed: 'bi-check-circle', processing: 'bi-gear',
  shipped: 'bi-truck', ready_for_pickup: 'bi-geo-alt', delivered: 'bi-bag-check',
  cancelled: 'bi-x-circle', refunded: 'bi-arrow-counterclockwise',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderAPI.list().then(data => {
      setOrders(data.results || data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1 className="page-title"><i className="bi bi-box-seam" /> My Orders</h1>
      </div>

      <div className="account-layout">
        <aside className="account-sidebar">
          <nav className="account-nav">
            <Link to="/account" className="account-nav-link"><i className="bi bi-person" /> Profile</Link>
            <Link to="/account/orders" className="account-nav-link active"><i className="bi bi-box-seam" /> My Orders</Link>
          </nav>
        </aside>

        <div className="account-main">
          {loading ? (
            <div className="orders-loading">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton order-skeleton" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-bag-x" />
              <h3>No Orders Yet</h3>
              <p>Start shopping to see your orders here.</p>
              <Link to="/store" className="btn-primary"><i className="bi bi-bag" /> Browse Products</Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <Link key={order.id} to={`/account/orders/${order.id}`} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <span className="order-number">{order.order_number}</span>
                      <span className="order-date">{new Date(order.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <span className={`order-status-badge ${STATUS_COLORS[order.status] || ''}`}>
                      <i className={`bi ${STATUS_ICONS[order.status] || 'bi-circle'}`} />
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="order-card-body">
                    <div className="order-items-preview">
                      {order.items?.slice(0, 3).map(item => (
                        <div key={item.id} className="order-item-chip">
                          <span className="order-item-name">{item.product_name}</span>
                          <span className="order-item-qty">×{item.quantity}</span>
                        </div>
                      ))}
                      {order.items?.length > 3 && <span className="order-more">+{order.items.length - 3} more</span>}
                    </div>
                    <div className="order-card-footer">
                      <div className="order-pickup">
                        <i className="bi bi-geo-alt" /> {order.pickup_station?.name || '—'}
                      </div>
                      <div className="order-total-wrap">
                        <span className={`payment-badge ${order.payment_status === 'paid' ? 'paid' : 'unpaid'}`}>
                          <i className={`bi ${order.payment_status === 'paid' ? 'bi-check-circle-fill' : 'bi-clock'}`} />
                          {order.payment_status}
                        </span>
                        <span className="order-total">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
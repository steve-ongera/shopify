import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productAPI, categoryAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import Pagination from '../components/Pagination'

export function CategoryPage() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [ordering, setOrdering] = useState('-created_at')

  useEffect(() => {
    setLoading(true)
    setPage(1)
    categoryAPI.detail(slug).then(setCategory).catch(() => {})
  }, [slug])

  useEffect(() => {
    setLoading(true)
    productAPI.list(`?category=${slug}&page=${page}&ordering=${ordering}`)
      .then(data => {
        setProducts(data.results || data || [])
        setCount(data.count || (data.results || data || []).length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug, page, ordering])

  return (
    <div className="category-page">
      <nav className="breadcrumb-nav">
        <Link to="/">Home</Link>
        <i className="bi bi-chevron-right" />
        <Link to="/store">Store</Link>
        <i className="bi bi-chevron-right" />
        <span>{category?.name || slug}</span>
      </nav>

      <div className="store-header">
        <div className="store-header-left">
          <h1 className="page-title">{category?.name || 'Category'}</h1>
          {category?.description && <p className="category-desc">{category.description}</p>}
          <span className="products-count">{count} products</span>
        </div>
        <div className="store-header-right">
          <select className="sort-select" value={ordering} onChange={e => setOrdering(e.target.value)}>
            <option value="-created_at">Newest</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="products-grid">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="product-card skeleton" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-inbox" />
          <h3>No products in this category</h3>
          <Link to="/store" className="btn-primary">Browse All</Link>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <Pagination page={page} count={count} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}

export function SearchPage() {
  const [params] = useState(() => new URLSearchParams(window.location.search))
  const q = params.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    productAPI.search(q).then(data => {
      setResults(Array.isArray(data) ? data : data.results || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [q])

  return (
    <div className="search-page">
      <div className="page-header">
        <h1 className="page-title">
          <i className="bi bi-search" /> Search Results
        </h1>
        {q && <p className="search-query-label">Showing results for "<strong>{q}</strong>"</p>}
      </div>

      {!q ? (
        <div className="empty-state">
          <i className="bi bi-search" />
          <h3>Enter a search term to get started</h3>
        </div>
      ) : loading ? (
        <div className="products-grid">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="product-card skeleton" />)}
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-emoji-frown" />
          <h3>No results for "{q}"</h3>
          <p>Try different keywords or browse our categories.</p>
          <Link to="/store" className="btn-primary">Browse All Products</Link>
        </div>
      ) : (
        <>
          <p className="search-results-count">{results.length} results found</p>
          <div className="products-grid">
            {results.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </div>
  )
}

export default CategoryPage
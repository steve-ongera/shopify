import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productAPI, categoryAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import Pagination from '../components/Pagination'

export default function StorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)

  const page = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category') || ''
  const ordering = searchParams.get('ordering') || '-created_at'
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const featured = searchParams.get('featured') || ''

  useEffect(() => {
    categoryAPI.list().then(d => setCategories(d.results || d || [])).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    let params = `?page=${page}&ordering=${ordering}`
    if (category) params += `&category=${category}`
    if (minPrice) params += `&min_price=${minPrice}`
    if (maxPrice) params += `&max_price=${maxPrice}`
    if (featured) params += `&featured=${featured}`
    productAPI.list(params)
      .then(data => {
        setProducts(data.results || data || [])
        setCount(data.count || (data.results || data || []).length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, category, ordering, minPrice, maxPrice, featured])

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value)
    else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const clearFilters = () => setSearchParams({})

  const hasFilters = category || minPrice || maxPrice || featured

  return (
    <div className="store-page">
      <div className="store-header">
        <div className="store-header-left">
          <h1 className="page-title">
            {category
              ? categories.find(c => c.slug === category)?.name || 'Products'
              : 'All Products'}
          </h1>
          <span className="products-count">{count} products</span>
        </div>
        <div className="store-header-right">
          <button className="filter-toggle-btn" onClick={() => setFilterOpen(!filterOpen)}>
            <i className="bi bi-funnel" /> Filters
            {hasFilters && <span className="filter-dot" />}
          </button>
          <select
            className="sort-select"
            value={ordering}
            onChange={e => setParam('ordering', e.target.value)}
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      <div className="store-layout">
        {/* Sidebar Filters */}
        <aside className={`store-filters ${filterOpen ? 'open' : ''}`}>
          <div className="filter-header">
            <h3>Filters</h3>
            {hasFilters && <button className="clear-filters" onClick={clearFilters}>Clear All</button>}
          </div>

          <div className="filter-group">
            <h4 className="filter-label">Category</h4>
            <div className="filter-options">
              <label className={`filter-option ${!category ? 'active' : ''}`}>
                <input type="radio" name="category" checked={!category} onChange={() => setParam('category', '')} />
                All Categories
              </label>
              {categories.map(cat => (
                <label key={cat.slug} className={`filter-option ${category === cat.slug ? 'active' : ''}`}>
                  <input type="radio" name="category" checked={category === cat.slug} onChange={() => setParam('category', cat.slug)} />
                  {cat.name} <span className="filter-count">({cat.product_count})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-label">Price Range (KSh)</h4>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={e => setParam('min_price', e.target.value)}
                className="price-input"
              />
              <span>—</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={e => setParam('max_price', e.target.value)}
                className="price-input"
              />
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-label">Featured</h4>
            <label className={`filter-option ${featured === 'true' ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={featured === 'true'}
                onChange={e => setParam('featured', e.target.checked ? 'true' : '')}
              />
              Featured Only
            </label>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="store-products">
          {loading ? (
            <div className="products-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="product-card skeleton" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-search" />
              <h3>No products found</h3>
              <p>Try adjusting your filters or browse all categories.</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination page={page} count={count} onPageChange={p => setParam('page', p)} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
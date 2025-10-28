import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageCarousel from '../../components/ImageCarousel'
import { listMyProducts, deleteProduct } from '../../../api/products'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../components/Modal'
import ProductModal from '../../components/ProductModal'
import { createAuction } from '../../../api/auctions'
import { truncateDescription, truncateProductName } from '../../../lib/textUtils'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [auctionModalOpen, setAuctionModalOpen] = useState(false)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [durationTypeId, setDurationTypeId] = useState(1)
  const [startingPrice, setStartingPrice] = useState('')
  const [creating, setCreating] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const items = await listMyProducts()
        if (mounted) setProducts(items)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const hasProducts = useMemo(() => (products?.length || 0) > 0, [products])



  const handleDeleteClick = (product) => {
    setProductToDelete(product)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return
    try {
      const { message } = await deleteProduct(productToDelete.id)
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id))
      success(message || 'Ürün başarıyla silindi')
      setShowDeleteModal(false)
      setProductToDelete(null)
    } catch (err) {
      error(err?.message || 'Ürün silinirken bir hata oluştu')
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setProductToDelete(null)
  }

  const openProductModal = (product = null) => {
    setEditingProduct(product)
    setProductModalOpen(true)
  }

  const closeProductModal = () => {
    setProductModalOpen(false)
    setEditingProduct(null)
  }

  const handleProductSuccess = () => {
    listMyProducts().then(setProducts)
  }

  const openAuctionModal = (product) => {
    setSelectedProduct(product)
    setDurationTypeId(1)
    setStartingPrice(product?.price || '')
    setAuctionModalOpen(true)
  }

  const closeAuctionModal = () => {
    setAuctionModalOpen(false)
    setSelectedProduct(null)
  }

  const handleCreateAuction = async () => {
    if (!selectedProduct) return
    const priceNum = Number(startingPrice)
    if (!priceNum || priceNum <= 0) {
      error('Geçerli başlangıç fiyatı giriniz')
      return
    }
    setCreating(true)
    try {
      const { message } = await createAuction({ product_id: selectedProduct.id, startingPrice: priceNum, durationTypeId })
      if (message) success(message)
      closeAuctionModal()
      navigate('/auctions/my')
    } catch (err) {
      error(err?.message || 'İşlem başarısız')
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div>Yükleniyor...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: 'var(--color-accent)', margin: 0 }}>Ürünlerim</h2>
        <button 
          onClick={() => openProductModal()}
          className="btn btn-primary"
          style={{ padding: '12px 20px' }}
        >
          Yeni Ürün
        </button>
      </div>

      {!hasProducts && <p style={{ color: 'var(--color-text-secondary)' }}>Henüz ürün yok.</p>}
      {hasProducts && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 16 }}>
          {products.map((p) => (
            <li
              key={p.id}
              className="auction-item"
              style={{
                padding: 16,
                display: 'grid',
                gridTemplateColumns: '240px 1fr',
                gap: 16,
                alignItems: 'center',
              }}
            >
              <div style={{ width: 240, alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>
                <ImageCarousel images={p.images} width={240} height={160} alt={p.name} />
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: 'var(--color-text)', fontSize: '1.1em' }}>{truncateProductName(p.name)}</strong>
                  <div style={{ color: 'var(--color-text-secondary)', marginTop: '4px', fontSize: '0.9em' }}>Ürün ID: #{p.id}</div>
                  <div style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                    {truncateDescription(p.description)}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <span className="price-label">Fiyat: </span>
                    <span className="price">₺{Number(p.price).toLocaleString('tr-TR')}</span>
                  </div>
                </div>
                 <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                  <button onClick={() => openProductModal(p)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                    Düzenle
                  </button>
                   <button onClick={() => openAuctionModal(p)} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                    Açık artırmaya aç
                  </button>
                  <button onClick={() => handleDeleteClick(p)} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '12px' }}>
                    Sil
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={showDeleteModal}
        title="Ürünü Sil"
        onClose={handleDeleteCancel}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text)', marginBottom: '24px', fontSize: '1.1em' }}>
            <strong>#{productToDelete?.id}</strong> numaralı ürünü silmek istediğinizden emin misiniz?
          </p>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '1em' }}>
            Ürün: <strong>{productToDelete?.name}</strong>
          </p>
          <p style={{ color: 'var(--color-warning)', marginBottom: '32px', fontSize: '0.9em' }}>
            Bu işlem geri alınamaz ve ürün kalıcı olarak silinecektir.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button 
              onClick={handleDeleteCancel}
              className="btn btn-secondary"
              style={{ padding: '12px 24px' }}
            >
              İptal
            </button>
            <button 
              onClick={handleDeleteConfirm}
              className="btn btn-danger"
              style={{ padding: '12px 24px' }}
            >
              Evet, Sil
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={auctionModalOpen} title="Açık Artırma Oluştur" onClose={closeAuctionModal}>
        {selectedProduct && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ color: 'var(--color-text-secondary)' }}>Ürün: <strong style={{ color: 'var(--color-text)' }}>{selectedProduct.name}</strong></div>
            <div style={{ display: 'grid', gap: 8 }}>
              <label style={{ color: 'var(--color-accent)', fontWeight: '600' }}>Başlangıç Fiyatı</label>
              <input 
                type="number" 
                step="0.01" 
                value={startingPrice} 
                onChange={(e) => setStartingPrice(e.target.value)}
                style={{ 
                  background: 'var(--color-secondary)', 
                  border: '1px solid var(--color-border)', 
                  color: 'var(--color-text)',
                  padding: '10px 12px',
                  borderRadius: 8
                }}
              />
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <label style={{ color: 'var(--color-accent)', fontWeight: '600' }}>Süre</label>
              <select 
                value={durationTypeId} 
                onChange={(e) => setDurationTypeId(Number(e.target.value))}
                style={{ 
                  background: 'var(--color-secondary)', 
                  border: '1px solid var(--color-border)', 
                  color: 'var(--color-text)',
                  padding: '10px 12px',
                  borderRadius: 8
                }}
              >
                <option value={1}>30 dk</option>
                <option value={2}>24 saat</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: '24px' }}>
              <button onClick={closeAuctionModal} disabled={creating} className="btn btn-secondary" style={{ padding: '12px 24px' }}>
                İptal
              </button>
              <button onClick={handleCreateAuction} disabled={creating} className="btn btn-primary" style={{ padding: '12px 24px' }}>
                {creating ? 'Oluşturuluyor...' : 'Oluştur'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ProductModal
        open={productModalOpen}
        product={editingProduct}
        onClose={closeProductModal}
        onSuccess={handleProductSuccess}
      />
    </div>
  )
}



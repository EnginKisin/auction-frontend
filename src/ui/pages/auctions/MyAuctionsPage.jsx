import { useEffect, useMemo, useState } from 'react'
import { listMyAuctions, closeAuction } from '../../../api/auctions'
import { Link } from 'react-router-dom'
import { useToast } from '../../../context/ToastContext'
import CountdownTimer from '../../components/CountdownTimer'
import ImageCarousel from '../../components/ImageCarousel'
import Modal from '../../components/Modal'
import { truncateDescription, truncateProductName } from '../../../lib/textUtils'

export default function MyAuctionsPage() {
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [selectedAuction, setSelectedAuction] = useState(null)
  const { success, error } = useToast()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await listMyAuctions()
        if (mounted) setAuctions(data)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const hasItems = useMemo(() => (auctions?.length || 0) > 0, [auctions])

  const handleCloseClick = (auction) => {
    setSelectedAuction(auction)
    setShowCloseModal(true)
  }

  const handleCloseConfirm = async () => {
    if (!selectedAuction) return
    
    try {
      const { message } = await closeAuction(selectedAuction.id)
      setAuctions((prev) => prev.map((a) => (a.id === selectedAuction.id ? { ...a, isActive: false } : a)))
      success(message || 'Açık artırma başarıyla kapatıldı')
      setShowCloseModal(false)
      setSelectedAuction(null)
    } catch (err) {
      error(err?.message || 'Açık artırma kapatılırken bir hata oluştu')
    }
  }

  const handleCloseCancel = () => {
    setShowCloseModal(false)
    setSelectedAuction(null)
  }

  if (loading) return <div>Yükleniyor...</div>

  return (
    <div>
      <h2 style={{ color: 'var(--color-accent)', marginBottom: '24px' }}>İhalelerim</h2>
      {!hasItems && <p style={{ color: 'var(--color-text-secondary)' }}>Henüz açık artırma oluşturmadınız.</p>}
      {hasItems && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 16 }}>
          {auctions.map((a) => (
            <li
              key={a.id}
              className="auction-item"
              style={{
                padding: 16,
                display: 'grid',
                gridTemplateColumns: '240px 1fr',
                gap: 16,
                alignItems: 'center',
              }}
            >
              <div style={{ width: 240 }}>
                <ImageCarousel images={a?.product?.images || []} width={240} height={160} alt={a?.product?.name || 'Ürün'} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div>
                    <strong style={{ color: 'var(--color-text)', fontSize: '1.1em' }}>{truncateProductName(a?.product?.name || `Açık Artırma #${a.id}`)}</strong>
                    <div style={{ color: 'var(--color-text-secondary)', marginTop: '4px', fontSize: '0.9em' }}>Açık Artırma ID: #{a.id}</div>
                    {a?.product?.description && (
                      <div style={{ color: 'var(--color-text-secondary)', marginTop: '8px', fontSize: '0.9em' }}>
                        {truncateDescription(a.product.description)}
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <span className="price-label">Başlangıç: </span>
                    <span className="price">₺{Number(a.startingPrice).toLocaleString('tr-TR')}</span>
                  </div>
                  <div>
                    <span className="price-label">En Yüksek Teklif: </span>
                    <span className="price">₺{Number(a.highestBid || 0).toLocaleString('tr-TR')}</span>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <CountdownTimer endTime={a.endTime} startTime={a.startTime} isActive={a.isActive} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                  <Link to={`/auctions/${a.id}`} className="btn btn-secondary" style={{ textAlign: 'center', padding: '8px 16px' }}>
                    Detay
                  </Link>
                  {a.isActive && (
                    <button 
                      onClick={() => handleCloseClick(a)} 
                      className="btn btn-danger"
                      style={{ padding: '8px 16px' }}
                    >
                      Kapat
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={showCloseModal}
        title="Açık Artırmayı Kapat"
        onClose={handleCloseCancel}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text)', marginBottom: '24px', fontSize: '1.1em' }}>
            <strong>#{selectedAuction?.id}</strong> numaralı açık artırmayı kapatmak istediğinizden emin misiniz?
          </p>
          {selectedAuction?.product?.name && (
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              Ürün: {selectedAuction.product.name}
            </p>
          )}
          <p style={{ color: 'var(--color-warning)', marginBottom: '32px', fontSize: '0.9em' }}>
            Bu işlem geri alınamaz ve açık artırma kalıcı olarak kapanacaktır.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button 
              onClick={handleCloseCancel}
              className="btn btn-secondary"
              style={{ padding: '12px 24px' }}
            >
              İptal
            </button>
            <button 
              onClick={handleCloseConfirm}
              className="btn btn-danger"
              style={{ padding: '12px 24px' }}
            >
              Evet, Kapat
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}



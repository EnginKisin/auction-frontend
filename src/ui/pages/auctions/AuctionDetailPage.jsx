import { useEffect, useMemo, useState } from 'react'
import { getAuctionById, getAuctionByIdPublic, placeBid } from '../../../api/auctions'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import ImageCarousel from '../../components/ImageCarousel'
import { useToast } from '../../../context/ToastContext'
import CountdownTimer from '../../components/CountdownTimer'
import TimeDisplay from '../../components/TimeDisplay'

export default function AuctionDetailPage() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const [auction, setAuction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [placing, setPlacing] = useState(false)
  const { success, error } = useToast()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await (isAuthenticated ? getAuctionById(id) : getAuctionByIdPublic(id))
        if (mounted) setAuction(data)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id])

  const highest = useMemo(() => Number(auction?.highestBid || 0), [auction])
  const minNextBid = useMemo(() => {
    const base = highest > 0 ? highest : Number(auction?.startingPrice || 0)
    return base + 1
  }, [highest, auction])

  const onPlaceBid = async () => {
    const value = Number(amount)
    if (!value || value < minNextBid) return
    setPlacing(true)
    try {
      const { message } = await placeBid(id, value)
      setAuction((prev) => ({ ...prev, highestBid: value }))
      setAmount('')
      if (message) success(message)
    } catch (err) {
      error(err?.message || 'İşlem başarısız')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return <div>Yükleniyor...</div>
  if (!auction) return <div>Kayıt bulunamadı</div>

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h3 style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        fontSize: '2rem',
        color: 'var(--color-accent)'
      }}>Açık Artırma #{auction.id}</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '20px' }}>
        <div style={{ display: 'grid', gap: '20px', alignContent: 'start' }}>
          <div style={{ marginBottom: '0px' }}>
            <ImageCarousel images={auction?.product?.images || []} width="100%" height={450} alt={auction?.product?.name || 'Ürün'} />
          </div>
          
          <div style={{ 
            padding: '24px', 
            background: 'var(--color-secondary)', 
            borderRadius: '12px', 
            border: '1px solid var(--color-border)',
            lineHeight: '1.5'
          }}>
            <div style={{ 
              fontWeight: '600', 
              color: 'var(--color-accent)', 
              marginBottom: '0px',
              fontSize: '16px'
            }}>
              Açık Arttırma Durumu:
            </div>
            <div style={{ 
              color: 'var(--color-text)',
              fontSize: '15px',
              display: 'grid',
              gap: '12px'
            }}>
              <div style={{ marginTop: 12 }}>
                <CountdownTimer endTime={auction.endTime} startTime={auction.startTime} isActive={auction.isActive} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
                <TimeDisplay time={auction.startTime} label="Başlangıç Zamanı" />
                <TimeDisplay time={auction.endTime} label="Bitiş Zamanı" isEndTime={true} />
              </div>
            </div>
          </div>

          {auction.isActive && isAuthenticated && (
            <div style={{ 
              marginTop: 0, 
              display: 'flex', 
              gap: 12, 
              alignItems: 'center',
              padding: '24px',
              background: 'var(--color-secondary)',
              borderRadius: '12px',
              border: '1px solid var(--color-border)'
            }}>
              <input
                type="number"
                value={amount}
                min={minNextBid}
                step="0.01"
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`En az ₺${minNextBid}`}
                style={{ flex: 1, padding: '12px 16px', fontSize: '16px' }}
              />
              <button onClick={onPlaceBid} disabled={placing || Number(amount) < minNextBid} style={{ padding: '12px 24px', fontSize: '16px' }}>
                {placing ? 'Teklif veriliyor...' : 'Teklif Ver'}
              </button>
            </div>
          )}
          {auction.isActive && !isAuthenticated && (
            <div style={{ 
              marginTop: 0, 
              color: '#6b7280',
              padding: '24px',
              background: 'var(--color-secondary)',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              textAlign: 'center'
            }}>
              Teklif vermek için giriş yapmalısınız.
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gap: '20px', alignContent: 'start' }}>
          <div style={{ 
            padding: '24px', 
            background: 'var(--color-secondary)', 
            borderRadius: '12px', 
            border: '1px solid var(--color-border)',
            lineHeight: '1.5'
          }}>
            <div style={{ 
              fontWeight: '600', 
              color: 'var(--color-accent)', 
              marginBottom: '0px',
              fontSize: '16px'
            }}>
              Ürün Bilgileri:
            </div>
            <div style={{ 
              color: 'var(--color-text)',
              fontSize: '15px',
              display: 'grid',
              gap: '12px'
            }}>
              <div><strong>Ürün Adı:</strong> {auction?.product?.name || `#${auction.productId}`}</div>
              <div><strong>Başlangıç Fiyatı:</strong> ₺{Number(auction.startingPrice).toLocaleString('tr-TR')}</div>
              <div><strong>En Yüksek Teklif:</strong> ₺{Number(auction.highestBid || 0).toLocaleString('tr-TR')}</div>
            </div>
          </div>

          {auction?.product?.description ? (
            <div style={{ 
              padding: '24px', 
              background: 'var(--color-secondary)', 
              borderRadius: '12px', 
              border: '1px solid var(--color-border)',
              lineHeight: '1.5'
            }}>
              <div style={{ 
                fontWeight: '600', 
                color: 'var(--color-accent)', 
                marginBottom: '12px',
                fontSize: '16px'
              }}>
                Ürün Açıklaması:
              </div>
              <div style={{ 
                color: 'var(--color-text)',
                whiteSpace: 'pre-wrap',
                fontSize: '15px',
                wordBreak: 'break-word'
              }}>
                {auction.product.description}
              </div>
            </div>
          ) : (
            <div style={{ 
              padding: '24px', 
              background: 'var(--color-secondary)', 
              borderRadius: '12px', 
              border: '1px solid var(--color-border)',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              fontStyle: 'italic'
            }}>
              Bu ürün için açıklama bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



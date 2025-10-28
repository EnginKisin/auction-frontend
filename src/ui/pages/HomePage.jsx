import { useEffect, useMemo, useState } from 'react'
import { listActiveAuctionsPublic } from '../../api/auctions'
import { Link } from 'react-router-dom'
import ImageCarousel from '../components/ImageCarousel'
import CountdownTimer from '../components/CountdownTimer'
import { truncateDescription, truncateProductName } from '../../lib/textUtils'

export default function HomePage() {
  const [auctions, setAuctions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await listActiveAuctionsPublic()
        if (mounted) setAuctions(data)
      } catch {
        if (mounted) setAuctions([])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const hasItems = useMemo(() => (auctions?.length || 0) > 0, [auctions])

  return (
    <div>
      <h2 style={{ marginTop: 24, color: 'var(--color-accent)', marginBottom: '20px' }}>Aktif Açık Artırmalar</h2>
      {loading && <div className="loading">Yükleniyor...</div>}
      {!loading && !hasItems && <p style={{ color: 'var(--color-text-secondary)' }}>Şu anda aktif açık artırma yok.</p>}
      {!loading && hasItems && (
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
                <div style={{ display: 'flex', gap: 12 }}>
                  <Link to={`/auctions/${a.id}`} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                    Detay
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}



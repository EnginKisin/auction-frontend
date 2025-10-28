import { useEffect, useMemo, useRef, useState } from 'react'

export default function ImageCarousel({ images = [], width = 240, height = 160, alt = 'image' }) {
  const hasImages = (images?.length || 0) > 0
  const containerRef = useRef(null)
  const [index, setIndex] = useState(0)

  const sources = useMemo(
    () =>
      (images || []).map((img) => `data:${img.contentType};base64,${img.base64Data}`),
    [images]
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth)
      setIndex(i)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToIndex = (i) => {
    const el = containerRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(i, sources.length - 1))
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' })
  }

  const handlePrev = () => scrollToIndex(index - 1)
  const handleNext = () => scrollToIndex(index + 1)

  if (!hasImages) {
    return (
      <div
        style={{
          width,
          height,
          borderRadius: 8,
          overflow: 'hidden',
          background: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          fontSize: 12,
        }}
      >
        Görsel yok
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width, height }}>
      <div
        ref={containerRef}
        style={{
          width,
          height,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          borderRadius: 8,
        }}
      >
        <div style={{ display: 'flex', height: '100%' }}>
          {sources.map((src, i) => (
            <div
              key={i}
              style={{ flex: '0 0 100%', width, height, scrollSnapAlign: 'start' }}
            >
              <img
                src={src}
                alt={`${alt} ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handlePrev}
        disabled={index <= 0}
        aria-label="Önceki görsel"
        style={{
          position: 'absolute',
          left: 6,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(17,24,39,0.6)',
          color: 'white',
          border: 'none',
          borderRadius: 999,
          padding: '6px 10px',
          cursor: 'pointer',
        }}
      >
        ‹
      </button>
      <button
        type="button"
        onClick={handleNext}
        disabled={index >= sources.length - 1}
        aria-label="Sonraki görsel"
        style={{
          position: 'absolute',
          right: 6,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(17,24,39,0.6)',
          color: 'white',
          border: 'none',
          borderRadius: 999,
          padding: '6px 10px',
          cursor: 'pointer',
        }}
      >
        ›
      </button>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 6,
          display: 'flex',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {sources.map((_, i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: i === index ? 'white' : 'rgba(255,255,255,0.6)',
              boxShadow: '0 0 1px rgba(0,0,0,0.4)',
            }}
          />
        ))}
      </div>
    </div>
  )
}



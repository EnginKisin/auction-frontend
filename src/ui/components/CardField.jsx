import { CardElement, useElements } from '@stripe/react-stripe-js'
import { useRef, useEffect, useState } from 'react'

export default function CardField() {
  const elements = useElements()
  const cardElementRef = useRef(null)
  const containerRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (elements) {
      const cardElement = elements.getElement('card')
      if (cardElement) {
        cardElementRef.current = cardElement
        
        cardElement.on('focus', () => setIsFocused(true))
        cardElement.on('blur', () => setIsFocused(false))
      }
    }
  }, [elements])

  const handleContainerClick = (e) => {
    
    if (cardElementRef.current) {
      setTimeout(() => {
        try {
          cardElementRef.current.focus()
        } catch (err) {
          const iframe = containerRef.current?.querySelector('iframe')
          if (iframe && iframe.contentWindow) {
            try {
              iframe.contentWindow.focus()
            } catch (iframeErr) {
              //
            }
          }
        }
      }, 10)
    }
  }

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && cardElementRef.current) {
      e.preventDefault()
      try {
        cardElementRef.current.focus()
      } catch (err) {
        const iframe = containerRef.current?.querySelector('iframe')
        if (iframe) {
          iframe.focus()
        }
      }
    }
  }

  const borderColor = isFocused 
    ? '#3b82f6'
    : isHovered 
    ? '#60a5fa'
    : '#d1d5db'

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      style={{
        padding: 12,
        border: `2px solid ${borderColor}`,
        borderRadius: 8,
        cursor: 'text',
        position: 'relative',
        outline: 'none',
        transition: 'border-color 0.2s ease',
        backgroundColor: isFocused ? '#f8fafc' : 'transparent',
      }}
    >
      <CardElement
        options={{
          style: {
            base: { fontSize: '16px', color: '#1f2937', '::placeholder': { color: '#9ca3af' } },
            invalid: { color: '#ef4444' },
          },
        }}
        onReady={(element) => {
          cardElementRef.current = element
          element.on('focus', () => setIsFocused(true))
          element.on('blur', () => setIsFocused(false))
        }}
      />
    </div>
  )
}



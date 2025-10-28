import { CardElement } from '@stripe/react-stripe-js'

export default function CardField() {
  return (
    <div style={{ padding: 12, border: '1px solid #d1d5db', borderRadius: 8 }}>
      <CardElement
        options={{
          style: {
            base: { fontSize: '16px', color: '#1f2937', '::placeholder': { color: '#9ca3af' } },
            invalid: { color: '#ef4444' },
          },
        }}
      />
    </div>
  )
}



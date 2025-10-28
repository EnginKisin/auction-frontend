import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '../../../lib/apiClient'
import { useToast } from '../../../context/ToastContext'
import { useNavigate, Link } from 'react-router-dom'
import { Elements, useElements, useStripe, CardElement } from '@stripe/react-stripe-js'
import { stripePromise } from '../../../lib/stripe'
import CardField from '../../components/CardField'

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'En az 6 karakter'),
})

function RegisterForm() {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values) => {
    if (!stripe || !elements) return
    const cardElement = elements.getElement(CardElement)
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    })
    if (error) throw error
    const payload = { email: values.email, password: values.password }
    try {
      const res = await api.post('/auth/register', payload, { params: { paymentMethodId: paymentMethod.id } })
      const message = res?._message
      if (message) success(message)
      navigate('/login', { replace: true })
    } catch (err) {
      error(err?.message || 'Kayıt başarısız')
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h2>Kayıt Ol</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          <label>E-posta</label>
          <input type="email" {...register('email')} placeholder="email@ornek.com" />
          {errors.email && <small style={{ color: 'tomato' }}>{errors.email.message}</small>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          <label>Şifre</label>
          <input type="password" {...register('password')} placeholder="••••••••" />
          {errors.password && <small style={{ color: 'tomato' }}>{errors.password.message}</small>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          <label>Kart Bilgisi</label>
          <CardField />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        Zaten hesabın var mı? <Link to="/login">Giriş yap</Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Elements stripe={stripePromise}>
      <RegisterForm />
    </Elements>
  )
}



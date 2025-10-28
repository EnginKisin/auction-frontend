import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { useSecurityMiddleware } from '../../../hooks/useSecurityMiddleware'

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'En az 6 karakter'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { success, error } = useToast()

  const { sanitizeInput } = useSecurityMiddleware()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })

  const onSubmit = async (values) => {
    try {
      const sanitizedEmail = sanitizeInput(values.email, 'email');
      const sanitizedPassword = sanitizeInput(values.password, 'text');
      
      await login(sanitizedEmail, sanitizedPassword)
      success('Giriş başarılı')
      const to = location.state?.from?.pathname || '/'
      navigate(to, { replace: true })
    } catch (err) {
      error(err?.message || 'Giriş başarısız')
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Giriş Yap</h2>
      
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
        <button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        Hesabın yok mu? <Link to="/register">Kayıt ol</Link>
      </p>
    </div>
  )
}



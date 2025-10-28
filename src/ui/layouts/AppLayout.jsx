import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ToastContainer from '../components/ToastContainer'

export default function AppLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  
  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: 24 }}>
      <header style={{ display: 'flex', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/">Anasayfa</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/products">Ürünlerim</Link>
          <Link to="/auctions/my">İhalelerim</Link>
        </nav>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <span>{user?.email}</span>
              <button onClick={logout}>Çıkış</button>
            </>
          ) : (
            <>
              <Link to="/login">Giriş</Link>
              <Link to="/register">Kayıt</Link>
            </>
          )}
        </div>
      </header>
      <main style={{ marginTop: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}

export function AppLayoutWithToasts() {
  return (
    <>
      <AppLayout />
      <ToastContainer />
    </>
  )
}



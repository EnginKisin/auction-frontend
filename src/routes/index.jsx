import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout, { AppLayoutWithToasts } from '../ui/layouts/AppLayout'
import LoginPage from '../ui/pages/auth/LoginPage'
import RegisterPage from '../ui/pages/auth/RegisterPage'
import HomePage from '../ui/pages/HomePage'
import { ProtectedRoute } from './protected'
import ProductsPage from '../ui/pages/products/ProductsPage'
import MyAuctionsPage from '../ui/pages/auctions/MyAuctionsPage'
import AuctionDetailPage from '../ui/pages/auctions/AuctionDetailPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayoutWithToasts />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'auctions/my',
        element: (
          <ProtectedRoute>
            <MyAuctionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'auctions/:id',
        element: <AuctionDetailPage />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <div style={{ padding: 24 }}>Dashboard (protected)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'products',
        element: (
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        ),
      },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default router



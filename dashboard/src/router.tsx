import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from './auth/LoginPage'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { Layout } from './components/Layout'
import { DashboardHome } from './pages/DashboardHome'
import { DogsListPage } from './pages/DogsListPage'
import { DogFormPage } from './pages/DogFormPage'
import { DogDetailPage } from './pages/DogDetailPage'
import { LittersListPage } from './pages/LittersListPage'
import { LitterFormPage } from './pages/LitterFormPage'
import { BuyersListPage } from './pages/BuyersListPage'
import { BuyerFormPage } from './pages/BuyerFormPage'
import { SalesListPage } from './pages/SalesListPage'
import { SaleFormPage } from './pages/SaleFormPage'
import { TrashPage } from './pages/TrashPage'
import { PostsListPage } from './pages/PostsListPage'
import { PostFormPage } from './pages/PostFormPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardHome /> },
      { path: 'hunde', element: <DogsListPage /> },
      { path: 'hunde/neu', element: <DogFormPage /> },
      { path: 'hunde/:id', element: <DogDetailPage /> },
      { path: 'hunde/:id/bearbeiten', element: <DogFormPage /> },
      { path: 'wuerfe', element: <LittersListPage /> },
      { path: 'wuerfe/neu', element: <LitterFormPage /> },
      { path: 'wuerfe/:id/bearbeiten', element: <LitterFormPage /> },
      { path: 'wuerfe/:wurfId/verkaeufe', element: <SalesListPage /> },
      { path: 'kaeufer', element: <BuyersListPage /> },
      { path: 'kaeufer/neu', element: <BuyerFormPage /> },
      { path: 'kaeufer/:id/bearbeiten', element: <BuyerFormPage /> },
      { path: 'verkaeufe/neu', element: <SaleFormPage /> },
      { path: 'verkaeufe/:id/bearbeiten', element: <SaleFormPage /> },
      { path: 'beitraege', element: <PostsListPage /> },
      { path: 'beitraege/neu', element: <PostFormPage /> },
      { path: 'beitraege/:id/bearbeiten', element: <PostFormPage /> },
      { path: 'papierkorb', element: <TrashPage /> },
    ],
  },
])

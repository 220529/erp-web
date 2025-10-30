import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/components'
import AuthGuard from '@/components/AuthGuard'
import Dashboard from '@/features/dashboard'
import { CodeFlowList } from '@/features/codeflow'
import SystemIndex from '@/features/system'
import { Login } from '@/features/auth'

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        {
          index: true,
          element: <Dashboard />,
        },
        {
          path: 'data/codeflow',
          element: <CodeFlowList />,
        },
        {
          path: 'system',
          element: <SystemIndex />,
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
)


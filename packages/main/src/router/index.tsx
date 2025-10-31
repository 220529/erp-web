import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '@/components'
import AuthGuard from '@/components/AuthGuard'
import Dashboard from '@/features/dashboard'
import { CodeFlowList } from '@/features/codeflow'
import SystemIndex from '@/features/system'
import ProfileIndex from '@/features/profile'
import { CustomerList } from '@/features/customer'
import { OrderList, OrderDetail } from '@/features/order'
import { MaterialList } from '@/features/material'
import { ProductList } from '@/features/product'
import ProductMaterialsManagement from '@/features/product/MaterialsManagement'
import { FinanceList } from '@/features/finance'
import { DictList } from '@/features/dict'
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
          path: 'customer',
          element: <CustomerList />,
        },
        {
          path: 'order',
          element: <OrderList />,
        },
        {
          path: 'order/:id',
          element: <OrderDetail />,
        },
        {
          path: 'product',
          element: <ProductList />,
        },
        {
          path: 'product/:id/materials',
          element: <ProductMaterialsManagement />,
        },
        {
          path: 'material',
          element: <MaterialList />,
        },
        {
          path: 'finance',
          element: <FinanceList />,
        },
        {
          path: 'data/dict',
          element: <DictList />,
        },
        {
          path: 'data/codeflow',
          element: <CodeFlowList />,
        },
        {
          path: 'system',
          element: <SystemIndex />,
        },
        {
          path: 'profile',
          element: <ProfileIndex />,
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


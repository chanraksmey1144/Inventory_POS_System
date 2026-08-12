import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { RequireAuth, GuestOnly, RequirePermission } from './guards'
import MainLayout from '@/components/layout/MainLayout'
import ErrorPage from '@/features/errors/ErrorPage'
import { PageLoader } from '@/components/ui/Spinner'
import { can } from '@/lib/permissions'

function lazyPage(loader) {
  const Component = lazy(loader)
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

function permissionGate(permission, element) {
  if (permission && !can(permission)) {
    return <ErrorPage code={403} />
  }
  return element
}

const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/features/auth/ResetPasswordPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))

const ProductListPage = lazy(() => import('@/features/products/ProductListPage'))
const ProductFormPage = lazy(() => import('@/features/products/ProductFormPage'))
const ProductDetailPage = lazy(() => import('@/features/products/ProductDetailPage'))
const CatalogManagementPage = lazy(() => import('@/features/products/CatalogManagementPage'))
const VariantsPage = lazy(() => import('@/features/products/VariantsPage'))
const BarcodesPage = lazy(() => import('@/features/products/BarcodesPage'))

const InventoryPage = lazy(() => import('@/features/inventory/InventoryPage'))
const MovementsPage = lazy(() => import('@/features/inventory/MovementsPage'))
const AdjustmentsPage = lazy(() => import('@/features/inventory/AdjustmentsPage'))
const TransfersPage = lazy(() => import('@/features/inventory/TransfersPage'))
const LowStockPage = lazy(() => import('@/features/inventory/LowStockPage'))
const ValuationPage = lazy(() => import('@/features/inventory/ValuationPage'))

const PurchaseListPage = lazy(() => import('@/features/purchases/PurchaseListPage'))
const PurchaseFormPage = lazy(() => import('@/features/purchases/PurchaseFormPage'))
const PurchaseDetailPage = lazy(() => import('@/features/purchases/PurchaseDetailPage'))
const SupplierListPage = lazy(() => import('@/features/purchases/SupplierListPage'))
const SupplierFormPage = lazy(() => import('@/features/purchases/SupplierFormPage'))
const SupplierDetailPage = lazy(() => import('@/features/purchases/SupplierDetailPage'))

const SalesListPage = lazy(() => import('@/features/sales/SalesListPage'))
const SaleDetailPage = lazy(() => import('@/features/sales/SaleDetailPage'))
const ReturnsPage = lazy(() => import('@/features/sales/ReturnsPage'))

const CustomerListPage = lazy(() => import('@/features/customers/CustomerListPage'))
const CustomerFormPage = lazy(() => import('@/features/customers/CustomerFormPage'))
const CustomerDetailPage = lazy(() => import('@/features/customers/CustomerDetailPage'))

const CashRegisterPage = lazy(() => import('@/features/cashRegister/CashRegisterPage'))
const ExpenseListPage = lazy(() => import('@/features/expenses/ExpenseListPage'))
const ExpenseFormPage = lazy(() => import('@/features/expenses/ExpenseFormPage'))

const ReportPage = lazy(() => import('@/features/reports/ReportPage'))

const UserListPage = lazy(() => import('@/features/users/UserListPage'))
const UserFormPage = lazy(() => import('@/features/users/UserFormPage'))
const RolesPage = lazy(() => import('@/features/users/RolesPage'))
const BranchListPage = lazy(() => import('@/features/users/BranchListPage'))
const WarehouseListPage = lazy(() => import('@/features/users/WarehouseListPage'))
const RegisterListPage = lazy(() => import('@/features/users/RegisterListPage'))

const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage'))
const AuditLogsPage = lazy(() => import('@/features/notifications/AuditLogsPage'))

const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'))
const ProfilePage = lazy(() => import('@/features/auth/ProfilePage'))

const Page404 = () => <ErrorPage code={404} />
const Page403 = () => <ErrorPage code={403} />
const Page500 = () => <ErrorPage code={500} />
const PageNetwork = () => <ErrorPage code="network" />

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestOnly>
        <Suspense fallback={<PageLoader />}>
          <LoginPage />
        </Suspense>
      </GuestOnly>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <GuestOnly>
        <Suspense fallback={<PageLoader />}>
          <ForgotPasswordPage />
        </Suspense>
      </GuestOnly>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <GuestOnly>
        <Suspense fallback={<PageLoader />}>
          <ResetPasswordPage />
        </Suspense>
      </GuestOnly>
    ),
  },
  {
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: lazyPage(() => import('@/features/dashboard/DashboardPage')) },
      { path: '/pos', element: lazyPage(() => import('@/features/pos/POSPage')) },

      { path: '/products', element: lazyPage(() => import('@/features/products/ProductListPage')) },
      { path: '/products/create', element: permissionGate('products.create', lazyPage(() => import('@/features/products/ProductFormPage'))) },
      { path: '/products/:id', element: lazyPage(() => import('@/features/products/ProductDetailPage')) },
      { path: '/products/:id/edit', element: permissionGate('products.update', lazyPage(() => import('@/features/products/ProductFormPage'))) },

      { path: '/categories', element: lazyPage(() => import('@/features/products/CatalogManagementPage')) },
      { path: '/brands', element: lazyPage(() => import('@/features/products/CatalogManagementPage')) },
      { path: '/units', element: lazyPage(() => import('@/features/products/CatalogManagementPage')) },
      { path: '/variants', element: lazyPage(() => import('@/features/products/VariantsPage')) },
      { path: '/barcodes', element: lazyPage(() => import('@/features/products/BarcodesPage')) },

      { path: '/inventory', element: lazyPage(() => import('@/features/inventory/InventoryPage')) },
      { path: '/inventory/movements', element: lazyPage(() => import('@/features/inventory/MovementsPage')) },
      { path: '/inventory/adjustments', element: lazyPage(() => import('@/features/inventory/AdjustmentsPage')) },
      { path: '/inventory/transfers', element: lazyPage(() => import('@/features/inventory/TransfersPage')) },
      { path: '/inventory/low-stock', element: lazyPage(() => import('@/features/inventory/LowStockPage')) },
      { path: '/inventory/valuation', element: lazyPage(() => import('@/features/inventory/ValuationPage')) },

      { path: '/purchases', element: lazyPage(() => import('@/features/purchases/PurchaseListPage')) },
      { path: '/purchases/create', element: permissionGate('purchases.create', lazyPage(() => import('@/features/purchases/PurchaseFormPage'))) },
      { path: '/purchases/:id', element: lazyPage(() => import('@/features/purchases/PurchaseDetailPage')) },

      { path: '/suppliers', element: lazyPage(() => import('@/features/purchases/SupplierListPage')) },
      { path: '/suppliers/create', element: permissionGate('suppliers.create', lazyPage(() => import('@/features/purchases/SupplierFormPage'))) },
      { path: '/suppliers/:id', element: lazyPage(() => import('@/features/purchases/SupplierDetailPage')) },
      { path: '/suppliers/:id/edit', element: permissionGate('suppliers.update', lazyPage(() => import('@/features/purchases/SupplierFormPage'))) },

      { path: '/sales', element: lazyPage(() => import('@/features/sales/SalesListPage')) },
      { path: '/sales/:id', element: lazyPage(() => import('@/features/sales/SaleDetailPage')) },
      { path: '/sales/returns', element: permissionGate('sales.return', lazyPage(() => import('@/features/sales/ReturnsPage'))) },

      { path: '/customers', element: lazyPage(() => import('@/features/customers/CustomerListPage')) },
      { path: '/customers/create', element: permissionGate('customers.create', lazyPage(() => import('@/features/customers/CustomerFormPage'))) },
      { path: '/customers/:id', element: lazyPage(() => import('@/features/customers/CustomerDetailPage')) },
      { path: '/customers/:id/edit', element: permissionGate('customers.update', lazyPage(() => import('@/features/customers/CustomerFormPage'))) },

      { path: '/cash-register', element: permissionGate('cash_register.open', lazyPage(() => import('@/features/cashRegister/CashRegisterPage'))) },
      { path: '/expenses', element: lazyPage(() => import('@/features/expenses/ExpenseListPage')) },
      { path: '/expenses/create', element: permissionGate('expenses.create', lazyPage(() => import('@/features/expenses/ExpenseFormPage'))) },

      { path: '/reports/sales', element: permissionGate('reports.view', lazyPage(() => import('@/features/reports/ReportPage'))) },
      { path: '/reports/purchases', element: permissionGate('reports.view', lazyPage(() => import('@/features/reports/ReportPage'))) },
      { path: '/reports/inventory', element: permissionGate('reports.view', lazyPage(() => import('@/features/reports/ReportPage'))) },
      { path: '/reports/profit', element: permissionGate('reports.view', lazyPage(() => import('@/features/reports/ReportPage'))) },
      { path: '/reports/financial', element: permissionGate('reports.view', lazyPage(() => import('@/features/reports/ReportPage'))) },

      { path: '/users', element: lazyPage(() => import('@/features/users/UserListPage')) },
      { path: '/users/create', element: permissionGate('users.create', lazyPage(() => import('@/features/users/UserFormPage'))) },
      { path: '/users/:id/edit', element: permissionGate('users.update', lazyPage(() => import('@/features/users/UserFormPage'))) },
      { path: '/roles', element: permissionGate('roles.view', lazyPage(() => import('@/features/users/RolesPage'))) },
      { path: '/branches', element: lazyPage(() => import('@/features/users/BranchListPage')) },
      { path: '/warehouses', element: lazyPage(() => import('@/features/users/WarehouseListPage')) },
      { path: '/registers', element: lazyPage(() => import('@/features/users/RegisterListPage')) },

      { path: '/notifications', element: lazyPage(() => import('@/features/notifications/NotificationsPage')) },
      { path: '/audit-logs', element: lazyPage(() => import('@/features/notifications/AuditLogsPage')) },

      { path: '/settings', element: lazyPage(() => import('@/features/settings/SettingsPage')) },
      { path: '/profile', element: lazyPage(() => import('@/features/auth/ProfilePage')) },

      { path: '/403', element: <Page403 /> },
      { path: '/500', element: <Page500 /> },
      { path: '/network-error', element: <PageNetwork /> },
    ],
  },
  { path: '*', element: <Page404 /> },
])

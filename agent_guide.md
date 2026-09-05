# AGENTS.md — Frontend Inventory & POS System

Administrator : demo@storemaster.com
Cashier : dara@storemaster.com/sreyleap@storemaster.com
Store Manager : bopha@storemaster.com
Accountant : ronan@storemaster.com
View : kosal@storemaster.com

Guide for AI agents and developers working on this codebase. Read this before making changes.

## Project Overview

A full Inventory Management + Point-of-Sale (POS) web application. **Frontend-only prototype** — all data comes from an in-memory mock "backend" (`src/services/api.js`) with simulated latency. No real API calls are made.

Target deployment is a Laravel backend (see `src/lib/permissions.js` comment); the frontend is built to be swapped to real HTTP calls later.

## Tech Stack

- **React 19** + **Vite 8** (JavaScript, NOT TypeScript)
- **React Router v7** (`createBrowserRouter` data router in `src/app/router/routes.jsx`)
- **TanStack Query v5** for server-state (hooks in `src/hooks/`)
- **Zustand v5** for client-state (stores in `src/app/store/`)
- **React Hook Form + Zod v4** for forms (see `src/features/products/ProductFormPage.jsx` as reference)
- **Tailwind CSS v4** (CSS-first config via `@tailwindcss/vite`; dark mode via `dark:` classes)
- **i18next / react-i18next** with EN + KM locales
- **recharts** for report charts
- **lucide-react** for icons, **prop-types** for props validation
- **oxlint** for linting (`npm run lint`)

## Commands

```bash
npm run dev       # start Vite dev server (HMR)
npm run build     # production build (also the main "does it compile" check)
npm run lint      # oxlint over src/
npm run preview   # serve the built dist/
```

Validation workflow after any change: `npm run lint` (no errors) + `npm run build` (must pass). Fixing build errors is prioritized over lint warnings; pre-existing warnings are acceptable.

## Path Aliases

- `@/` → `src/` (configured in both `vite.config.js` and `jsconfig.json`). Always import with `@/`.

## Directory Structure

```
src/
├── App.jsx                # <RouterProvider router={router} /> only
├── main.jsx               # root render: QueryClientProvider + App + ToastViewport; theme init, language init
├── index.css              # Tailwind entry + global styles
├── app/
│   ├── providers/         # i18n.js (i18next setup), QueryProvider.jsx
│   ├── router/            # routes.jsx (all routes), guards.jsx (RequireAuth, RequirePermission, GuestOnly)
│   └── store/             # Zustand stores (auth, cart, notification, sidebar, theme, toast)
├── components/
│   ├── layout/            # MainLayout, Sidebar, Topbar, GlobalSearch, Breadcrumb, PageHeader, UserMenu, etc.
│   └── ui/                # reusable UI primitives (Button, Input, Modal, DataTable, Badge, Combobox, ...)
├── constants/             # index.js (enums/statuses), navigation.js, permissions.js (permission groups + ROLE_PERMISSIONS)
├── features/              # one folder per domain (see Feature Map below)
├── hooks/                 # data-fetching hooks wrapping services (useProducts, useSales, useAdmin, useReports, ...)
├── lib/                   # utils.js (format/helpers), cart.js (cart math), permissions.js (can()), errors.js, api.js
├── locales/en|km/common.json  # i18n translations (BOTH files must stay in sync)
├── mocks/                 # seed data + mock helpers (see Data Layer)
└── services/              # api.js (mock REST engine) + domain service objects
```

## Data Layer (IMPORTANT)

Everything funnels through `src/services/api.js` — a mock in-memory database:

- `db` object holds arrays: `products, categories, brands, units, customers, customerGroups, branches, warehouses, registers, suppliers, purchases, sales, expenses, users, roles, notifications, auditLogs, movements, transfers, returns`.
- `db.returns` starts empty; POST `/returns` (used by `salesService.processReturn`) appends to it.
- **`api.get(resource, query)`** supports generic query params:
  - `search` + `searchFields` (case-insensitive substring search)
  - `filters` (object; string values do case-insensitive includes, arrays match membership, other types strict equality)
  - `sortBy` / `sortDir`, `page` / `perPage` (returns `{ items, total }`)
  - `detail` + `params` (fetch single record by field)
- **`api.post`** auto-generates `id` via `uid('rec')` and `createdAt`/`updatedAt`, unshifts into collection.
- **`api.put/patch`** updates by `id`; **`api.delete`** removes by `params.id`. Mutations return cloned records.
- Service objects (`src/services/*.js`) are thin wrappers that translate domain params into these query params. **Add/change logic in services, not in api.js.**

Mock latency helpers: `mockResolve`, `mockReject` in `src/mocks/helpers.js`. `uid`, `clone`, `formatCurrency`, etc. live in `src/lib/utils.js`.

## Hooks Pattern

- `src/hooks/use*.js` wrap each service call in TanStack Query.
- **Naming convention**: `use<Resource>` for queries (e.g. `useProducts`, `useUsers`, `useSales`), `useCreate<X>` / `useUpdate<X>` / `useDelete<X>` for mutations.
- Mutations invalidate related query keys in `onSuccess` (e.g. mutations invalidate `['products']` and `['dashboard']`).
- Hook exports:
  - `useProducts.js`: products, categories, brands, units CRUD
  - `useSales.js`: sales, customers, expenses (+ returns, customer groups)
  - `usePurchases.js`: purchases + suppliers
  - `useInventory.js`: stock movements, transfers, adjustments
  - `useAdmin.js`: users, roles, branches, warehouses, registers, notifications, audit logs
  - `useReports.js`: report queries + settings (`useSettings`, `useUpdateSettings`)
- IMPORTANT: calling `useX()` inside a component subscribes it to the query. Use `mutateAsync` for actions that must complete before continuing (e.g. POS checkout).

## Client State (Zustand)

- `useAuthStore` — user, role, permissions, `isAuthenticated`, login/logout.
- `useCartStore` — POS cart: `items, customer, discount, tax, payment, heldSales` + actions (`addItem`, `setQuantity`, `holdSale`, `resumeSale`, `clearCart`, getters `getSubtotal/getDiscountAmount/getTaxAmount/getTotal/getItemCount`). Default tax is `DEFAULT_TAX = 10`.
- `useToastStore` — toast messages (`toast.success/info/error`).
- `useThemeStore` — light/dark/system theme (`init()` called in main.jsx).
- `useSidebarStore`, `useNotificationStore` — UI state.
- Select only what you need: `useCartStore((s) => s.items)`. Calling `useCartStore()` without a selector subscribes to the entire store (re-renders on any change).

## Routing & Guards

- `src/app/router/routes.jsx` defines all routes via `createBrowserRouter`. All authenticated pages are children of `RequireAuth` + `MainLayout`.
- **`/pos` has NO permission gate** (any authenticated user).
- Routes are lazy-loaded with `lazyPage()` (Suspense + PageLoader). Always register new pages there.
- `permissionGate(permission, element)` renders `<ErrorPage code={403} />` when `can(permission)` is false.
- Guards in `guards.jsx`: `RequireAuth` (redirects to `/login`), `GuestOnly` (redirects authed users to `/dashboard`), `RequirePermission` (renders `ForbiddenPage`).
- **There is NO ErrorBoundary anywhere.** Any render-time crash unmounts the entire app → blank/dark screen. Guard against null/undefined props (see "Gotchas").

## Permissions

- `src/lib/permissions.js` — `can(permission)` checks localStorage `auth_permissions` (falls back to `auth_role` + `ROLE_PERMISSIONS`). `hasAny(perms)`.
- `src/constants/permissions.js` — `PERMISSION_GROUPS` (checkbox groups on RolesPage) and `ROLE_PERMISSIONS` (role → array of keys, `'*'` = all). This is the source of truth for the admin role.
- Frontend checks are UX-only; real enforcement is expected on the backend.

## i18n

- `src/locales/en/common.json` and `src/locales/km/common.json` MUST both be updated together and remain JSON-valid. Missing keys fall back to EN.
- Translations accessed via `useTranslation()` → `t('key')`. Keys are namespaced by feature (`pos.*`, `sales.*`, `users.*`, ...).
- Language is persisted in `localStorage.language`; `setLanguage()` from `@/app/providers/i18n` toggles a `lang-km` class on `<html>`.
- NEVER hardcode user-facing strings.

## UI Conventions & Gotchas

- All UI primitives in `src/components/ui/`. Check the actual component file before using — do NOT assume props exist.
- `CardHeader` has **no `icon` prop** (props: `title`, `subtitle`, `actions`, `className`).
- `Button` has **no `color` prop** — variants only (`primary`, `outline`, `ghost`, `danger`, `warning-outline`, etc.), plus `size`, `loading`, `icon`, `iconRight`.
- `Badge` colors: `success | warning | danger | info | neutral | violet | emerald`.
- `DataTable` `rowKey` prop is a **string** field name, not a function.
- `StatusBadge` reads `billing.*` / `sales.*` / `inventory.*` status keys (see `StatusBadge.jsx`); unknown statuses fall back to `label || status`.
- `ConfirmDialog` props: `open, onClose, onConfirm, title, message, confirmLabel, variant, loading`.
- `Modal` takes `open, onClose, title, description, size, className`.
- `formatCurrency(value)` always formats as USD with 2 decimals; use `settings.currency` where a currency symbol matters.
- `cn()` is the classname combiner (`src/lib/utils.js`).

## Feature Map

| Feature folder | Purpose |
|---|---|
| `auth/` | Login, forgot/reset password, Profile page |
| `dashboard/` | Overview dashboard |
| `pos/` | POS terminal (`POSPage` + ProductCard, CategoryFilter, CartPanel, CartItemRow, PaymentModal, ReceiptModal, HeldSalesModal, VariantPicker) |
| `products/` | Products list/form/detail, catalog (categories/brands/units), variants, barcodes |
| `inventory/` | Stock list, movements, adjustments, transfers, low stock, valuation |
| `purchases/` | Purchase orders + suppliers |
| `sales/` | Sales list/detail, returns |
| `customers/` | Customer CRUD + detail |
| `cashRegister/` | Cash register sessions |
| `expenses/` | Expense list/form |
| `reports/` | `ReportPage` — 5 variants dispatched by pathname (`/reports/sales\|purchases\|inventory\|profit\|financial`) |
| `users/` | User CRUD, roles/permissions, branches, warehouses, registers |
| `notifications/` | Notifications + audit logs |
| `settings/` | `SettingsPage` — 7 tabs (business, currency, invoice, receipt, payments, notifications, appearance) |
| `errors/` | `ErrorPage` (404/403/500/network), `ForbiddenPage` |

## Known Quirks / Legacy Behavior

- `salesService.list` searches `['invoiceNumber', 'customerName']` but sales mocks only store `customerId`. Reports/sales/customer pages fetch `perPage: 1000` and join `customerName` client-side.
- `payments` constants duplicated as `PAYMENT_LABEL_KEYS` in sales/expenses/settings pages — a canonical single source does NOT exist yet.
- Permissions gaps (by design): no `expenses.delete` (expense delete is unguarded), no `purchases.cancel` (status-guarded only), `sales.return` gates `/sales/returns`, `cash_register.open/close`.
- Navigation config (`src/constants/navigation.js`) drives the Sidebar — add new pages there too.
- `PurchasesPage` statuses: `purchases.cancelled` / `purchases.received` are toast-message keys, not status labels.
- POS keyboard shortcuts: F2 (search), F4 (held sales), F6 (hold), F8 (pay), Delete/Backspace (remove active item), arrow keys (navigate cart).

## Coding Rules

1. **No comments unless asked.** Follow existing style exactly.
2. **Never hardcode strings** — add i18n keys (EN + KM) in `locales/`.
3. Always validate with `npm run lint` and `npm run build` after changes.
4. When a component receives data that may be null/undefined at mount (e.g. modal for a not-yet-selected record), guard with an early `if (!x) return null` — there is no ErrorBoundary, so an unguarded access crashes the whole app (see `VariantPicker.jsx` fix pattern; `ReceiptModal.jsx` is the reference example).
5. When adding a new domain: mocks → service → hooks → routes (`routes.jsx` + `navigation.js`) → feature pages → locale keys.
6. Never introduce real HTTP calls; keep everything through the mock `api.js`.
7. Do not commit unless explicitly asked.

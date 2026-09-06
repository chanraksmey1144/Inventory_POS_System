# agent_guide.md — how AI agents should work on this project

Orientation guide for AI agents and new developers. This project is split into two folders. **This guide focuses on the frontend** (what it is, how it works, and how to make safe changes).

> Deep-dive docs that already exist and are authoritative:
> - `Frontend-POS/AGENTS.md` — detailed frontend guide (data layer, hooks, stores, routing, conventions, gotchas). **Read before editing frontend code.**
> - `Frontend-POS/business_workflow.md` — end-to-end business rules for every workflow (POS, returns, purchases, inventory, cash register, reports, auth, settings). This is the spec the future backend must implement.
> - `Backend-POS/README.md` — future Laravel backend.

---

## 1. Project layout

```
Inventory_POS_System/
├── Frontend-POS/   # React SPA (this guide) — fully functional prototype
└── Backend-POS/    # Laravel skeleton — target deployment, not yet wired to the frontend
```

The frontend talks ONLY to an in-memory mock API (`src/services/api.js`). There are no real HTTP calls. `VITE_API_URL` in `Frontend-POS/.env.example` is reserved for the future real backend.

## 2. Frontend at a glance

- **React 19 + Vite 8**, plain JavaScript (no TypeScript).
- React Router v7 (`createBrowserRouter`) — all routes in `src/app/router/routes.jsx`.
- TanStack Query v5 for server-state (hooks in `src/hooks/`), Zustand v5 for client state (`src/app/store/`).
- Tailwind CSS v4 (CSS-first, `@tailwindcss/vite` plugin), dark mode via `dark:` classes.
- React Hook Form + Zod v4 for forms, recharts for charts, lucide-react icons.
- i18next with English (`en`) + Khmer (`km`) locales — **both must be updated together**.
- Linting: oxlint (`npm run lint`).

### Commands (run inside `Frontend-POS/`)

```bash
npm install
npm run dev      # Vite dev server with HMR
npm run lint     # oxlint over src/
npm run build    # production build — the main "does it compile" check
npm run preview  # serve the built dist/
```

**Validation before finishing any change:** `npm run lint` (no errors) + `npm run build` (must pass). Fix build errors first; pre-existing lint warnings are acceptable.

## 3. How data flows (important)

```
Page component
  → src/hooks/use*.js        (TanStack Query: useProducts, useSales, useCreateSale, ...)
  → src/services/*.js        (thin domain wrappers: salesService, productService, ...)
  → src/services/api.js      (mock REST engine over the in-memory `db` object)
  → src/mocks/*.js           (seed data)
```

- `api.get(resource, query)` supports `search`+`searchFields`, `filters`, `sortBy`/`sortDir`, `page`/`perPage`, `detail`+`params`, and `lowStock`. Returns `{ items, total }` for lists, a cloned record for details.
- `api.post/put/patch/delete` auto-generate `id`, `createdAt`, `updatedAt` and mutate `db` in place.
- **Business logic lives in services**, never in `api.js`. `db.returns` starts empty and is filled at runtime by returns.
- Derived money math (subtotal → discount → tax → total) is centralized in `src/lib/cart.js`. Never hand-roll totals in a page.
- Mutations invalidate related query keys in `onSuccess` (e.g. `['products']`, `['dashboard']`) so lists/reports refresh automatically.

### Adding a new feature/domain (follow this order)

`mocks/` → `services/` → `hooks/` → routes (`routes.jsx` + `navigation.js`) → feature pages → locale keys (EN + KM).

## 4. Key directories

| Path | Contents |
|---|---|
| `src/app/router/` | `routes.jsx` (all routes), `guards.jsx` (RequireAuth, GuestOnly, RequirePermission) |
| `src/app/store/` | Zustand stores: auth, cart, notification, sidebar, theme, toast |
| `src/components/ui/` | Reusable primitives — check the actual file before using, don't assume props |
| `src/components/layout/` | MainLayout, Sidebar, Topbar, GlobalSearch, Breadcrumb, ... |
| `src/constants/` | Enums/statuses (`index.js`), sidebar nav (`navigation.js`), permissions |
| `src/features/` | One folder per domain: `pos`, `products`, `inventory`, `purchases`, `sales`, `customers`, `cashRegister`, `expenses`, `reports`, `users`, `notifications`, `settings`, `auth`, `dashboard`, `errors` |
| `src/hooks/` | TanStack Query hooks wrapping services |
| `src/lib/` | `utils.js` (format/helpers), `cart.js`, `permissions.js` (`can()`), `errors.js` |
| `src/locales/en`, `src/locales/km` | i18n JSON (keep in sync) |
| `src/mocks/` | Seed data + `helpers.js` (`mockResolve`, `mockReject`, `daysAgo`, ...) |
| `src/services/` | `api.js` (mock REST engine) + domain service objects |

## 5. Routing & guards

- All authed pages are children of `RequireAuth` + `MainLayout`. Guest pages (`/login`, `/forgot-password`, `/reset-password`) are outside it.
- **`/pos` has no permission gate** — any authenticated user can take a sale.
- Register new pages in `routes.jsx` via `lazyPage()` (lazy + Suspense). Gate create/edit routes with `permissionGate('perm', element)` → renders 403 when denied.
- **There is NO ErrorBoundary.** Any render-time crash blanks the whole app. Guard null/undefined data with early returns (`if (!x) return null`) — see `ReceiptModal.jsx` as the pattern.
- Sidebar is driven by `src/constants/navigation.js` — add new pages there too.

## 6. Permissions (UX only)

- `can(permission)` / `hasAny(...)` in `src/lib/permissions.js` read `localStorage.auth_permissions`, falling back to `auth_role` + `ROLE_PERMISSIONS`.
- `src/constants/permissions.js` holds `PERMISSION_GROUPS` (role edit screen) and `ROLE_PERMISSIONS` (`admin` = `['*']`, plus manager/cashier/accountant/viewer).
- Frontend checks are UX-only; the Laravel backend must enforce for real.

## 7. State

- **Server state** (TanStack Query): data from services. Use `mutateAsync` for actions that must finish before continuing (e.g. POS checkout).
- **Client state** (Zustand): `useAuthStore` (session + permissions), `useCartStore` (POS cart, held sales, payment), `useToastStore`, `useThemeStore`, `useSidebarStore`, `useNotificationStore`.
- Select narrowly: `useCartStore((s) => s.items)`. An unselectorized call re-renders on any change.

## 8. Conventions & gotchas to respect

1. **No comments unless asked.** Match existing style exactly.
2. **Never hardcode user-facing strings** — add i18n keys to BOTH `en` and `km` locale files.
3. UI primitives do not always look the way you'd guess: `Button` has variants not a `color` prop; `CardHeader` has no `icon` prop; `DataTable` `rowKey` is a **string**, not a function. Check the file.
4. `formatCurrency()` always formats USD; use `settings.currency` only where the symbol matters.
5. `salesService.list` searches `customerName` but mocks only store `customerId` — pages fetch `perPage: 1000` and join names client-side. Don't "fix" this casually; it's documented legacy behavior.
6. Payments constants are duplicated (`PAYMENT_LABEL_KEYS`) across sales/expenses/settings — a single source doesn't exist yet.
7. By-design permission gaps: no `expenses.delete`, no `purchases.cancel`, credit/return/cash-register gating is partial.
8. Demo logins (password = `password`): admin `demo@storemaster.com`, cashier `dara@`/`sreyleap@`, manager `bopha@`, accountant `ronan@`, viewer `kosal@` (all @storemaster.com).
9. POS keyboard shortcuts: F2 search, F4 held sales, F6 hold, F8 pay, Del/Backspace remove, arrows navigate cart.
10. Never introduce real HTTP calls — everything stays on mock `api.js`.
11. Do not commit unless explicitly asked.

## 9. When reading/fixing code

1. Start at the route in `src/app/router/routes.jsx`, then the page in `src/features/<domain>/`.
2. Find its hooks in `src/hooks/` to see which service + query keys are involved.
3. Read the service in `src/services/` to see the data shape and any business rules.
4. Check `src/lib/cart.js` and `src/constants/` for shared math/statuses.
5. Make the smallest change, then run `npm run lint` and `npm run build`.
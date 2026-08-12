# business_workflow.md — Business Workflows

How the Inventory & POS System operates from a business standpoint. This document explains each core business process end-to-end, the business rules enforced in code, and how data moves through the system.

> This is a **frontend-only prototype**. Every "service" below is a mock in-memory implementation (`src/services/api.js`). The workflows and business rules documented here are the source of truth the future Laravel backend must implement.

---

## 1. Core Domains at a Glance

| Domain | Data source | Entry points |
|---|---|---|
| Sales / POS | `src/mocks/sales.js`, `salesService` | `/pos`, `/sales`, `/reports/sales` |
| Returns | `db.returns` (starts empty) | `/sales/returns` |
| Purchases | `src/mocks/purchases.js`, `purchaseService` | `/purchases`, `/reports/purchases` |
| Products & Catalog | `src/mocks/products.js`, `src/mocks/catalog.js` | `/products`, `/categories`, `/brands`, `/units`, `/inventory` |
| Inventory | `src/mocks/inventory.js`, `inventoryService` | `/inventory/*` |
| Cash Register | `localStorage` session | `/cash-register` |
| Customers | `src/mocks/customers.js`, `customerService` | `/customers` |
| Expenses | `src/mocks/expenses.js`, `expenseService` | `/expenses` |
| Users & Permissions | `src/mocks/users.js`, `userService`, `src/constants/permissions.js` | `/users`, `/roles`, `/branches`, `/warehouses`, `/registers` |
| Notifications & Audit | `src/mocks/notifications.js`, `userService` | `/notifications`, `/audit-logs` |
| Reports & Settings | `reportService`, `settingsService` | `/reports/*`, `/settings` |

---

## 2. POS / Sales Workflow

The point-of-sale terminal (`/pos`) is the heart of daily store operation. It has **no permission gate** — any authenticated user can take a sale.

### Steps

1. **Scan or search a product.** Cashier types a search term (F2 focuses search) or scans a barcode. Search matches `name`, `sku`, or `barcode` on the product list (max 100 active products fetched).
2. **Add to cart.**
   - Simple product → added immediately with quantity 1 (stock-limited; adding beyond available stock is capped at `product.stock`).
   - Product **with variants** → a `VariantPicker` opens to choose the variant (each variant has its own `price`, `sku`, `stock`). Variants with `stock === 0` are disabled.
   - Products with `stock === 0` cannot be added.
3. **Pick a customer (optional).** A walk-in customer (`pos.walkInCustomer`) is assumed by default. Selecting a customer is required only for **credit sales**.
4. **Apply order-level discount & tax.**
   - Cart items each carry a per-item `tax` rate (default `DEFAULT_TAX = 10`%).
   - Order-level `discount` is a percent (0–100) applied to the subtotal; `tax` is a percent applied **after** discount.
   - Math lives in `src/lib/cart.js`: `cartSubtotal → orderDiscountAmount → orderTaxAmount → orderTotal`.
5. **Payment (F8 opens payment modal).**
   - Payment methods: `cash`, `card`, `qr`, `bank_transfer`, `mobile_payment`, `credit`.
   - Cash method: cashier enters tendered amount; quick-amount buttons and "exact amount" helper provided. **Cashier cannot submit until `tendered >= total`** (tolerance 0.001).
   - Credit method: **requires a selected customer**; sale is created as `pending` + `unpaid` and no tendered amount is needed.
   - Other methods: tendered is pre-filled with the total.
6. **Create the sale.** `POSPage.handleComplete → useCreateSale.mutateAsync → salesService.create → api.post('/sales')`.
   - On success the cart is cleared, the payment modal closes, and a **receipt** opens (`ReceiptModal`).
   - Receipt shows store info (from Settings), invoice number, line items, discount, tax, totals, paid/change, and a thank-you note; supports browser printing.
   - Credit sales show an amber note that the payment is outstanding.
7. **Completed sale flags:** `status` = `completed` (or `pending` for credit), `paymentStatus` = `paid` / `partial` / `unpaid`, `invoiceNumber` like `INV-YYYYMMDD-XXXX`.

### Hold / Resume / Clear

- **Hold (F6):** stores the current cart (`items`, `customer`, `discount`, `tax`, `total`) into `heldSales` and clears the cart. Held sales persist only in the Zustand store (in-memory, lost on refresh).
- **Resume (F4):** `HeldSalesModal` lists held sales; selecting one restores the cart and removes it from the held list.
- **Clear:** empties the cart (keeps default tax/discount).

### Keyboard shortcuts

`F2` search · `F4` held sales · `F6` hold · `F8` pay · `Delete`/`Backspace` remove active item · `↑`/`↓` navigate cart items.

---

## 3. Returns Workflow

Route: `/sales/returns` (gated by `sales.return` permission).

- Triggered from the sales module; a return records `{ saleId, items, createdAt }` and POSTs to `/returns` (`salesService.processReturn`).
- `db.returns` starts empty, so this is a pure runtime-logged flow in the prototype.
- Returns feed into the **Cash Register** reconciliation (cash refunds reduce expected cash) and into stock movements as incoming `return` movements.

---

## 4. Purchasing Workflow

Route: `/purchases` (create gated by `purchases.create`).

### Steps

1. **Create a purchase order** against a **supplier**; items carry `cost`, `quantity`, `receivedQuantity`.
2. **Status lifecycle:** `draft → ordered → partially_received → received` (or `cancelled`).
   - `purchaseService.receive` sets `status: 'received'` and stamps `receivedAt`.
   - `purchaseService.cancel` sets `status: 'cancelled'` (guarded by status, not permission — there is **no `purchases.cancel` permission key** by design).
3. Received stock is expected to generate inbound `purchase` stock movements (see Inventory).
4. Purchase totals are `subtotal + tax` (mock uses 5% tax, no discount).

### Suppliers

CRUD under `/suppliers` (create/update gated by `suppliers.*`). A supplier may be a company with contact details; supplier list/search by `name`, `company`, `email`, `phone`.

---

## 5. Inventory Workflow

Routes: `/inventory` (stock list), `/inventory/movements`, `/inventory/adjustments`, `/inventory/transfers`, `/inventory/low-stock`, `/inventory/valuation`.

### Stock state

- Every product has `stock`, `minStock`, `cost`, `price`, `trackInventory`, `status`.
- Stock status is derived: `in_stock` / `low_stock` (0 < stock ≤ minStock) / `out_of_stock` (stock = 0) / `inactive`.

### Stock movements (`/movements`)

Every stock change is a signed movement record:

| Type | Sign | Typical trigger |
|---|---|---|
| `purchase` | + | goods received from supplier |
| `sale` | − | POS checkout |
| `return` | + | sales return |
| `damage` | − | goods damaged in transit |
| `adjustment` | +/− | stock count correction (`inventoryService.adjustStock`) |
| `transfer` | ∓ | warehouse transfer (out − / in +) |

Each movement stores `before`, `after`, `quantity` (signed), `warehouseId`, `reference`, `user`, `note`.

### Adjustments

`inventoryService.adjustStock({ productId, type: 'add'|'remove', quantity, reason, note })` POSTs a movement with negative quantity for removals. Typical reason: "Stock count discrepancy resolved".

### Transfers (`/transfers`)

Stock moved between warehouses; status lifecycle `requested → approved → in_transit → received` (or `cancelled`). A transfer records source/destination warehouse, item count, and notes.

### Low stock & valuation

- `/inventory/low-stock` uses the API `lowStock` filter: `trackInventory && stock <= minStock`.
- Valuation: cost value = `Σ(cost × stock)`, retail value = `Σ(price × stock)`.

---

## 6. Cash Register Workflow

Route: `/cash-register` (gated by `cash_register.open` / `cash_register.close` permissions).

Session state lives in `localStorage['cash_register_session']` (one open register at a time).

### Opening

1. Select a register (`useRegisters`) and enter **opening cash**.
2. Session stored: `{ registerId, openingCash, openedAt }`.

### During the session

Expected cash is computed live from:

```
expected = openingCash
         + today's cash sales          (completed sales, paymentMethod = cash)
         + cash-in (cash inflows entered manually)
         − today's cash refunds        (returns created today)
         − cash-out (cash outflows)
         − today's cash expenses       (expenses, paymentMethod = cash)
```

### Closing

1. Cashier counts and enters **actual cash** in the drawer.
2. **Difference = actual − expected**; a non-zero difference flags a cash-over/short.
3. Closing removes the session from localStorage and confirms via `ConfirmDialog`.

---

## 7. Customers Workflow

Routes: `/customers` (create/update gated by `customers.*`), `/customers/:id` detail.

- Customer records: `name`, `email`, `phone`, `groupId`, `status`, and (relevant to credit business) `outstanding`.
- `Σ(customer.outstanding)` appears on the dashboard as **outstanding payments**.
- Customers belong to **customer groups** (`customerService.groups`); a group may carry default discounts/pricing tiers in the real backend.
- Customers are joined client-side into sales/receipts/report rows by `customerId` (sales mocks only store the id — see Known Quirks in `AGENTS.md`).

---

## 8. Expenses Workflow

Routes: `/expenses` (create gated by `expenses.create`).

- Expenses are categorized (`Rent`, `Utilities`, `Salaries`, `Supplies`, `Transportation`, `Maintenance`, `Marketing`, `Taxes`, `Other`), with `paymentMethod`, `amount`, `date`.
- **There is no `expenses.delete` permission** — expense deletion is unguarded (by design).
- Cash expenses feed into the Cash Register expected-cash calculation and into the **Profit report** (`netProfit = revenue − cogs − expenses`).

---

## 9. Reporting Workflows

Route: `/reports/<variant>` (all gated by `reports.view`). One `ReportPage` renders 5 variants by pathname. Default date range = last 30 days (`daysAgoISO(30)`).

| Variant | Summary metrics | Detail |
|---|---|---|
| `/reports/sales` | revenue, orders, avg order, discount, tax, gross profit | daily revenue chart + payment-method breakdown (PieChart) + recent sales table |
| `/reports/purchases` | total spend, PO count, item count | recent purchase table |
| `/reports/inventory` | total items, total units, cost value, retail value, low/out-of-stock counts | product rows |
| `/reports/profit` | revenue, COGS, gross profit, expenses, net profit | — |
| `/reports/financial` | placeholder (currency + period) | — |

Key formulas (from `reportService`):

- **COGS (sales report / profit)** = `Σ over sold items of (item.cost × item.quantity)`.
- **Gross profit** = `revenue − cogs`.
- **Profit report** = `netProfit = revenue − cogs − expenses` (expenses summed across all time — a prototype simplification).

### Dashboard

`getDashboardData()` aggregates: today's revenue/orders/gross profit/avg order value, total products, low-stock & out-of-stock counts, outstanding payments, a 30-day sales/profit/orders trend, sales by category, top 5 products, payment breakdown, 30-day purchase trend, and recent sales/purchases/movements.

---

## 10. Auth, Users, Roles & Permissions Workflow

### Login (demo)

- Demo account: `demo@storemaster.com` / `password` → logs in as the first user (admin role).
- Any mock user whose password is `password` can log in; any other credential throws "Invalid email or password".
- Login returns `{ user, token, permissions }` (permissions from `ROLE_PERMISSIONS[role]`).

### Session & permissions

- `useAuthStore` holds `user`, `role`, `permissions`, `isAuthenticated`.
- `can(permission)` (in `src/lib/permissions.js`) reads `localStorage['auth_permissions']`; falls back to `localStorage['auth_role']` + `ROLE_PERMISSIONS`. `'*'` = all permissions.
- Route guards: `RequireAuth` (redirects unauthenticated → `/login`), `GuestOnly` (authed → `/dashboard`), `RequirePermission` / `permissionGate` (renders 403).
- **Frontend permission checks are UX-only; the Laravel backend must enforce.**

### User admin

- `/users` CRUD with role assignment (`userService`), status active/inactive, branch association, and password reset.
- `/roles` shows each role's permission set from `PERMISSION_GROUPS`; the admin role is locked (`['*']`). Role updates POST through `roleService.updatePermissions`.
- `/branches`, `/warehouses`, `/registers` manage org structure; registers are consumed by the POS and Cash Register.

### Audit & notifications

- Login/logout, create/update/delete/archive/receive/return/adjust/transfer/payment/cancel/export actions are recorded as **audit logs** (`/audit-logs`).
- Notifications cover `low_stock`, `out_of_stock`, `purchase`, `sales`, `return`, `payment`, `system`; mark-read/delete operations update them.

---

## 11. Settings Workflow

Route: `/settings` — 7 tabs, backed by `settingsService` (`useSettings` / `useUpdateSettings`).

- **Business:** store name/address/phone/email.
- **Currency:** one of USD / KHR / EUR / THB / VND (display symbol; `formatCurrency` still formats USD — currency symbol only matters where `settings.currency` is consumed).
- **Invoice:** prefix (default `INV`) and default tax rate (default 10%).
- **Receipt:** footer text + show-logo toggle (used by `ReceiptModal`).
- **Payments:** enabled payment methods (the POS payment-method grid is built from `PAYMENT_METHODS` constant).
- **Notifications:** low-stock alert threshold + email toggle.
- **Appearance:** theme (light/dark/system) and language (EN/KM).

Settings are stored in-memory (mock) — they reset on reload in the prototype.

---

## 12. Cross-Cutting Business Rules

1. **Money math** is centralized in `src/lib/cart.js`; order tax is computed on the post-discount amount. Keep all totals derived — never hand-roll totals in a page.
2. **Stock is the constraint.** Cart additions and variant picking are capped by available stock; out-of-stock products are disabled at the POS.
3. **Credit sales require a customer.** A pending/unpaid sale is created and appears in outstanding-payments figures.
4. **Cash reconciliation** ties together: opening cash + cash sales + cash-in − refunds − cash-out − cash expenses = expected cash; actual vs expected is the register difference.
5. **Statuses drive UI.** Sales: `completed/pending/cancelled/refunded/hold`; purchases: `draft/ordered/partially_received/received/cancelled`; transfers: `requested/approved/in_transit/received/cancelled`; payment: `paid/partial/unpaid/refunded`.
6. **Reports derive from one source** (`sales`, `purchases`, `expenses`, `products` mocks) — a new sale/purchase/expense will move dashboard and report numbers because both read the same arrays.

---

## 13. Data Flow Summary (per transaction type)

**Sale**
```
POS cart (Zustand) → PaymentModal.buildSale() → salesService.create → api.post('/sales')
→ sale record (status/paymentStatus/paid/change) → invalidate ['sales'] + ['dashboard']
→ ReceiptModal (print) → (real backend) also: −stock movement, +notification
```

**Return**
```
ReturnsPage → salesService.processReturn(saleId, items) → api.post('/returns')
→ db.returns[] → feeds Cash Register refunds + (real backend) +stock movement
```

**Purchase**
```
PurchaseFormPage → purchaseService.create → api.post('/purchases') → status draft/ordered
→ purchaseService.receive → status received + receivedAt → (real backend) +stock purchase movement
```

**Register session**
```
Open (localStorage) → live expected-cash calculation from sales/returns/expenses
→ Close → difference check → clear session
```

---

## 14. What the Laravel Backend Must Eventually Implement

1. Real HTTP endpoints mirroring `api.get/post/put/patch/delete` for every resource, with server-side auth + permission enforcement (frontend `can()` is UX only).
2. Server-side stock decrement on sale creation and increment on purchase receive / return — the prototype only records movements, it does not mutate `product.stock`.
3. Atomic sale + stock movement + audit-log transactions.
4. Server-side calculation of COGS, gross/net profit, cash-register expected cash.
5. Real email notifications, persistent settings, currency-aware money formatting.
6. An ErrorBoundary on the client (currently none — a render crash blanks the whole app; see `AGENTS.md`).

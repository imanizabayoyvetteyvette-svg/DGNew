# D&G E-Shop — Technical Documentation

This document describes the application as implemented in the current repository. It distinguishes working code paths from simulated or missing integrations.

## 1. Application overview

D&G E-Shop is a mobile shopping and store-management app. The frontend is an Expo / React Native application, and the backend is a FastAPI service with SQLAlchemy persistence. The client communicates with the backend over JSON HTTP requests.

## 2. Architecture and repository layout

```text
Frontend/
  src/app/          Expo Router layouts and screens (auth, tabs, checkout, products)
  src/components/   Shared UI components
  src/context/      Authentication, cart, and language contexts
  src/screens/      Customer and administrator tab screens
  src/services/     API, device authentication, image upload, and payment services
Backend/
  main.py           FastAPI app, router registration, database initialization
  routers/          Authentication, users, products, carts, and orders endpoints
  schemas/          Pydantic request and response models
  models/           SQLAlchemy database models
  crud/             Database operations
  core/             JWT authentication dependencies and token utilities
schema.sql           PostgreSQL schema/bootstrap script
```

The API routers are mounted under `/api`: `/auth`, `/users`, `/products`, `/carts`, and `/orders`. The backend also exposes `/` and `/api/health`.

## 3. Technology and runtime

### Frontend

* Expo SDK `~58.0.17`, Expo Router `~58.0.25`
* React `19.3.0`, React Native `0.88.0`
* TypeScript `~6.0.3`
* Axios for API requests
* AsyncStorage for session/cart-related client state; Expo SecureStore for the device token
* Expo Local Authentication for the native device authentication prompt

### Backend

* FastAPI, Pydantic 2, SQLAlchemy 2, and Uvicorn
* SQLite by default, or PostgreSQL when configured with `DATABASE_URL`
* JWT tokens signed with HS256 using `SECRET_KEY`
* `ACCESS_TOKEN_EXPIRE_MINUTES` defaults to `1440` (24 hours)

## 4. Frontend behavior

### Navigation and state

The Expo Router root layout provides language, authentication, and cart contexts. It shows a brief splash screen and routes unauthenticated users to the login stack. Authenticated users enter the tab navigator.

The five main tabs are role-aware:

| Tab | Customer | Admin |
|---|---|---|
| `tab1` | Shop | Dashboard |
| `tab2` | Explore/search | Product management |
| `tab3` | Cart | Deliveries |
| `tab4` | Purchases/orders | Reports |
| `profile` | Account/profile | Account/profile |

The app has English, Kinyarwanda, and French translations in `src/constants/i18n.ts`; currency formatting is provided by `formatRWF`.

### Device authentication and sessions

The client prompts for the operating system's device authentication before login, registration, device rebind, and account deletion. It generates a device token, stores it with SecureStore (falling back to AsyncStorage), and sends that token to the backend.

The backend authenticates by looking up the submitted device token and returns a JWT. The client stores the JWT in AsyncStorage and attaches it as a Bearer token to API requests. The client also caches a token and user profile for an offline session fallback. The OS prompt is client-side; the backend receives a device-token string and does not attest that a native lock prompt occurred.

### Product images and payments

Product images are uploaded directly from the client to Cloudinary using the configured upload preset; the returned HTTPS URLs are stored with product data.

The payment service currently simulates success after a short delay. MTN MoMo, Airtel Money, and bank transfer are method labels and placeholder hooks, not live gateway integrations. The app then submits the order to the backend.

## 5. Backend and data model

`Backend/main.py` creates tables from SQLAlchemy metadata, runs a PostgreSQL ID-type migration helper, and seeds products when the product table is empty. The default local database URL is `sqlite:///./dg.db`.

| Table | Current fields and purpose |
|---|---|
| `users` | Integer ID, unique email and device token, `is_admin`, creation/update timestamps |
| `products` | String ID, name, category, decimal price, quantity, JSON `info` and `images` |
| `carts` | String ID, user ID, JSON items, total price |
| `orders` | String ID, user ID, JSON items, total price, `paid`, `delivered`, creation time |

Orders store item data as JSON. Checkout also stores delivery/payment metadata as a special item marked `is_customer_info`.

## 6. API behavior and access

The endpoint reference, request shapes, and responses are documented in [AllEndPoints.md](./AllEndPoints.md).

Important current behavior:

* Authentication uses a device token, not an email/password pair. JWT identity is derived from the user's email.
* Cart and order routes require a Bearer token. User profile and deletion routes also require authentication.
* Product read and write routes currently have no backend authentication dependency. Frontend role-based navigation does not secure these routes.
* Registration accepts the optional `is_admin` value in its request body.
* `/orders/all` returns all orders to admins, but returns only the caller's orders to non-admins.
* `DELETE /users/{user_id}` intends to permit owner or admin deletion, but its owner check compares an integer database ID with a string path parameter; non-admin users should use `DELETE /users/me`.
* The frontend calls `/auth/forgot-password`, but the backend does not currently implement that endpoint.
* Creating an order marks it paid and decrements product quantities on the backend. Checkout also makes a second inventory adjustment from the client after order creation, so the current flow can decrement stock twice. Payment is not verified by the backend.

These notes describe current implementation details, not recommendations or guarantees.

## 7. Configuration and local development

### Frontend

The API URL defaults in `Frontend/src/services/api.ts` to `https://dgnew.onrender.com/api`. Set `EXPO_PUBLIC_API_URL` to override it; the client adds `/api` if the configured URL does not already end with that path.

```powershell
cd Frontend
npm install
npx expo start
```

Run the TypeScript compiler directly when needed:

```powershell
npx tsc --noEmit
```

The package also defines `npm run lint` (`expo lint`).

### Backend

```powershell
cd Backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend settings can be supplied through environment variables or `Backend/.env`:

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./dg.db` | SQLAlchemy database connection |
| `SECRET_KEY` | `super_secret_key_change_me` | JWT signing secret |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT lifetime in minutes |

Use a private, strong `SECRET_KEY` and a production database URL in deployed environments. The frontend's `EXPO_PUBLIC_` variables are embedded in the client and must not contain secrets.

## 8. Database script caution

The root `schema.sql` starts by dropping the `orders`, `carts`, `products`, and `users` tables before recreating them and inserting sample rows. Running it against an existing database is destructive; do not use it as a routine migration.

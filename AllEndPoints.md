# D&G E-Shop API Endpoints

This reference reflects the FastAPI routers and Pydantic schemas currently in `Backend/`.

## Base URL

The frontend defaults to `https://dgnew.onrender.com/api`. Set `EXPO_PUBLIC_API_URL` to use another backend; it may be a host URL or a URL ending in `/api`. For local development, the API is typically `http://localhost:8000/api`.

The examples below use `https://dgnew.onrender.com/api` as the base URL. Confirm the deployed URL for your environment before using it.

## Authentication

Authenticated routes require:

```http
Authorization: Bearer <access_token>
```

Registration and login use a `device_token`; there is no password field in the backend authentication schemas. The app prompts for the device's screen lock locally before sending the device token to the API.

### `POST /auth/register`

Register a user. Returns **201 Created**.

Request:

```json
{
  "email": "customer@example.com",
  "device_token": "device-token-value",
  "is_admin": false
}
```

`email` and `device_token` are required; `is_admin` is optional and defaults to `false`.

### `POST /auth/login`

Log in with a previously registered device token. Returns **200 OK**.

```json
{
  "device_token": "device-token-value"
}
```

### `POST /auth/rebind-device`

Bind a new device token to the account identified by email. Returns **200 OK**.

```json
{
  "email": "customer@example.com",
  "new_device_token": "new-device-token-value"
}
```

### Authentication response

Register, login, and rebind return an `AuthResponse`:

```json
{
  "success": true,
  "token": "<jwt>",
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user": {
    "id": "1",
    "email": "customer@example.com",
    "is_admin": false
  },
  "message": "Login successful"
}
```

The `message` varies by operation. Error responses use FastAPI's `detail` field.

## Users

### `GET /users/me`

Return the authenticated user's `id`, `email`, and `is_admin`.

### `DELETE /users/me`

Delete the authenticated user's account. The backend deletes the user's orders and cart before deleting the user. Returns:

```json
{
  "message": "Account, orders, cart, and all user info deleted successfully"
}
```

### `DELETE /users/{user_id}`

Delete the specified user. Admins may delete any user. The route intends to allow a user to delete their own account, but currently compares the integer database ID to the string path parameter, so a non-admin's self-delete request through this route is denied. Use `DELETE /users/me` to delete the current account.

## Products

Product routes currently have no authentication dependency in the backend. The admin-only presentation in the app does not restrict direct API calls.

### `GET /products/`

List products. Optional query parameters:

* `category` — case-insensitive partial match against the category.
* `search` — case-insensitive partial match against the product name.

Example: `GET /products/?category=Shoes&search=Nike`

### `GET /products/{product_id}`

Return one product, or **404** when it does not exist.

### `POST /products/`

Create a product. Returns **201 Created**. `name`, `category`, and `price` are required; `id` is optional and otherwise generated. `quantity` defaults to `0`, `info` to `{}`, and `images` to `[]`.

```json
{
  "name": "Everyday Bag",
  "category": "Bags",
  "price": 85,
  "quantity": 10,
  "info": {
    "color": "Brown"
  },
  "images": [
    "https://example.com/bag.jpg"
  ]
}
```

### `PUT /products/{product_id}`

Update a product. Any supplied fields from the product schema (`name`, `category`, `price`, `quantity`, `info`, `images`) are updated; omitted fields are left unchanged. Returns **404** when the product does not exist.

### `DELETE /products/{product_id}`

Delete a product. Returns **404** when it does not exist; otherwise:

```json
{
  "message": "Product deleted successfully"
}
```

## Shopping carts

All cart routes require authentication. The cart is associated with the current user.

### `GET /carts/`

Return the user's cart. If none exists, the backend creates an empty cart first.

### `PUT /carts/`

Replace the cart contents. `items` is a list of arbitrary JSON values and `total_price` is a number.

```json
{
  "items": [
    {
      "product_id": "product-1",
      "name": "Everyday Bag",
      "price": 85,
      "quantity": 1,
      "subtotal": 85
    }
  ],
  "total_price": 85
}
```

### `DELETE /carts/`

Empty the user's cart and return the updated cart.

## Orders

All order routes require authentication.

### `POST /orders/`

Create an order. `items` is a list of arbitrary JSON values, `total_price` is required, and `id` is optional (otherwise generated). The backend marks the order `paid: true`, sets `delivered: false`, adjusts inventory for product items, and clears the user's cart.

The app adds delivery and payment details as an item with `is_customer_info: true`. Such entries are excluded from the backend inventory adjustment.

**Payment note:** There is no payment endpoint. The app's payment service currently simulates a successful payment before calling this route; the backend does not verify a payment transaction.

### `GET /orders/`

Return the authenticated user's orders, newest first.

### `GET /orders/all`

Return all orders for an admin. For a non-admin user, the backend returns only that user's orders rather than rejecting the request.

### `PATCH /orders/{order_id}/deliver`

Mark an order as delivered. Admins may update any order; other authenticated users may update only their own. Returns **404** if the order is missing or the user is not authorized.

## Utility routes

These routes are mounted directly on the backend, outside the `/api` prefix:

| Method | Path | Response |
|---|---|---|
| `GET` | `/` | Backend status message |
| `GET` | `/api/health` | `{"status":"ok"}` |

## Implementation notes

* FastAPI validation and application errors use JSON responses with a `detail` field.
* `POST /auth/forgot-password` is called by a frontend screen, but no matching backend route is currently registered.
* Product create, update, and delete routes are currently unprotected on the backend. Registration also accepts the optional `is_admin` field from its request body. Do not rely on the app's role-based UI as API authorization.

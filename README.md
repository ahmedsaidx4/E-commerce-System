# E-commerce Backend API

A modular REST API for an e-commerce application, built with Node.js, Express, MongoDB, and Mongoose.

This repository currently represents **V1 / MVP** and is still under development. It focuses on the core backend flow: user accounts, catalog management, shopping carts, checkout, and order retrieval.

## Features

### Authentication and accounts

- User registration with optional JPG, JPEG, PNG, or WEBP avatar upload.
- Password hashing with bcrypt.
- Email verification through Nodemailer/Gmail.
- Login with a short-lived JWT access token.
- Rotating refresh-token sessions stored as hashed tokens in MongoDB.
- HTTP-only refresh-token cookie.
- Logout, logout from all devices, and refresh-token reuse detection.
- Forgot-password, reset-password, and authenticated password-change flows.
- Current-user profile retrieval and profile updates.
- Account deactivation.

### Products and categories

- Public product listing and single-product lookup.
- Product search by name or description.
- Category filtering, price-range filtering, field selection, sorting, and pagination for products.
- Public listing of active categories with pagination.
- Admin-only product and category creation, updates, and deletion.
- Slug generation for products and categories.
- Category deactivation also deactivates products in that category.

### Cart

- Authenticated users can view their cart.
- Add products to a cart and increase the quantity of an existing item.
- Update or remove cart items.
- Active-product and available-stock checks when modifying a cart.

### Checkout and orders

- Authenticated checkout from the current cart using a shipping address.
- Order snapshots containing product name, price, quantity, and item subtotal.
- Subtotal, shipping fee, tax, discount, total, payment status, and order status fields.
- Stock is decremented when an order is created.
- The cart is cleared after successful order creation.
- Authenticated users can list their orders and retrieve an individual order.

### Administration and authorization

- JWT-protected routes through bearer-token authentication.
- Role checks for `Admin`, `Instructor`, and `User` roles.
- Admin operations for listing administrators and users, retrieving a user, deleting users, changing account status, and promoting or removing an administrator role.

## Tech Stack

- Node.js and Express 5
- MongoDB and Mongoose
- JWT (`jsonwebtoken`) and HTTP-only cookies
- bcrypt for password hashing
- Joi for request validation
- Multer for avatar uploads
- Nodemailer for email verification and password-reset messages
- Swagger UI and OpenAPI 3.0.3 for API documentation
- Helmet, CORS, Morgan, and `express-rate-limit` for common HTTP middleware
- Jest and Supertest are included as development dependencies

## Project Structure

```text
E-commerce-System/
└── backend/
    ├── package.json
    └── src/
        ├── app.js                 # Express app and mounted routes
        ├── server.js              # Environment loading, DB connection, server startup
        ├── swagger.js             # OpenAPI definition
        ├── config/                # MongoDB connection and local environment file
        ├── Middleware/            # JWT, role, validation, and async error middleware
        ├── Modules/
        │   ├── Admin/
        │   ├── Auth/
        │   ├── Cart/
        │   ├── Category/
        │   ├── Orders/
        │   ├── Products/
        │   ├── RefreshSession/
        │   └── User/
        ├── uploads/avatars/        # Locally stored avatar uploads
        └── utils/                  # Tokens, cookies, user sanitization, and helpers
```

## API Documentation

When the backend is running locally, open:

- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI JSON: `http://localhost:3000/api-docs.json`

The API uses the `/api/v1` prefix. Swagger UI can be used to inspect request schemas, responses, authorization requirements, and try requests against the local server.

## API Overview

| Resource | Base path | Purpose |
| --- | --- | --- |
| Health | `/api/v1/health` | Check whether the API is running |
| Authentication | `/api/v1/auth` | Registration, login, sessions, verification, and password flows |
| Users | `/api/v1/users` | Current-user profile and account status |
| Admins | `/api/v1/admins` | User administration and role management |
| Categories | `/api/v1/categories` | Category browsing and admin management |
| Products | `/api/v1/products` | Product browsing and admin management |
| Cart | `/api/v1/cart` | User cart operations |
| Orders | `/api/v1/orders` | Checkout and user order history |

## Authentication

1. Register an account through `POST /api/v1/auth/register`.
2. Verify the email using the message sent by the configured mail account.
3. Log in through `POST /api/v1/auth/login`.
4. Send the returned access token on protected requests:

   ```http
   Authorization: Bearer <access-token>
   ```

5. The login response also sets an HTTP-only `refreshToken` cookie. Call `POST /api/v1/auth/refreshToken` when the access token expires. Refresh-token rotation replaces the cookie and revokes the previous refresh session.

Protected routes reject missing or invalid access tokens, and inactive accounts cannot authenticate through the normal protected flow.

## Getting Started

### Prerequisites

- Node.js with npm
- A reachable MongoDB database
- A Gmail-compatible mail account if using email verification or password-reset flows

### Installation

```bash
git clone <repository-url>
cd E-commerce-System/backend
npm install
```

The repository does not define a public clone URL in the project files. Replace `<repository-url>` with the URL of your fork or checkout.

### Environment variables

The server loads environment values from `backend/src/config/.env`. Create that file locally and never commit real credentials or tokens:

```dotenv
PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
USER_MAIL=your_mailbox@example.com
USER_PASS=your_mail_provider_app_password
```

The following variables are also supported by the implementation:

```dotenv
NODE_ENV=development
CLIENT_URL=http://localhost:3000
COOKIE_SAMESITE=lax
COOKIE_SECURE=false
COOKIE_DOMAIN=
```

`USER_MAIL` and `USER_PASS` are needed for email verification and password-reset messages. `COOKIE_SAMESITE`, `COOKIE_SECURE`, and `COOKIE_DOMAIN` control refresh-cookie behavior. `CLIENT_URL` is used when building email links.

### Run the project

From the `backend` directory:

```bash
npm run run:dev
```

Other scripts defined by the project are:

```bash
npm start       # Starts through nodemon
npm run run:pro # Starts with Node.js
npm test        # Runs Jest in-band
```

The server connects to MongoDB before listening on the configured port.

## Example Requests

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"your-password"}'
```

The successful response contains `data.token` and a sanitized `data.user`. The refresh token is set as an HTTP-only cookie.

### List products

```bash
curl "http://localhost:3000/api/v1/products?search=shirt&minPrice=100&maxPrice=500&sort=-price&page=1&limit=3"
```

Supported product query parameters implemented by the controller include `search`, `category`, `minPrice`, `maxPrice`, `sort`, `fields`, `page`, and `limit`.

### Add an item to the cart

```bash
curl -X POST http://localhost:3000/api/v1/cart/items \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{"product":"<product-id>","quantity":1}'
```

### Checkout

```bash
curl -X POST http://localhost:3000/api/v1/orders/checkout \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{"shippingAddress":"123 Example Street, Cairo, Egypt"}'
```

Swagger is the detailed reference for all request and response schemas.

## Order Flow

```text
Product catalog → Cart → Checkout → Order
```

At checkout, the API reads the current cart, validates that each product is active and has sufficient stock, calculates the order totals, creates an order with `paymentStatus: "pending"`, decrements stock, and removes the user’s cart.

There is currently no payment-provider integration or payment webhook flow. The payment fields are stored on the order model for the current MVP flow.

## Current Status

**V1 / MVP — Under Development**

The current implementation covers the core account, catalog, cart, checkout, and order-read flows. It is intended as a practical backend project and is not presented as production-ready.

## Known Limitations and Planned Improvements

- Payment-provider integration and payment webhooks are not implemented yet.
- Checkout does not currently use a database transaction across order creation, stock updates, and cart deletion.
- Advanced idempotency and concurrency handling for checkout and stock updates are planned.
- Order-management operations beyond user order retrieval are not currently exposed.
- The automated test suite is configured in `package.json`, but no test files are currently present in the repository.

## Roadmap

### V1 / MVP

- Authentication and account management
- Role-based administration
- Products and categories
- Cart operations
- Checkout and order creation
- Swagger/OpenAPI documentation

### Future versions

- Payment provider integration and webhooks
- Transactional checkout and stronger inventory concurrency controls
- Idempotent checkout requests
- Broader order-management workflows
- Expanded automated test coverage

## Learning and Project Goals

This project is being developed as a practical backend engineering project to apply REST API design, authentication and authorization, MongoDB data modeling, validation, business logic, checkout workflows, and modular Node.js architecture.

## Contributing

This is currently a portfolio/MVP project. For changes, please open an issue or pull request describing the proposed behavior and include relevant tests when adding them.

## License

No license file has been added to the repository yet.

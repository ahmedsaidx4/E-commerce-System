const id = {
  type: "string",
  example: "64f1c2a9e8b7c6d5e4f3a2b1",
};

const userProperties = {
  id,
  _id: id,
  first_name: { type: "string", example: "Ahmed" },
  last_name: { type: "string", example: "Said" },
  email: { type: "string", format: "email", example: "ahmed@example.com" },
  role: { type: "string", enum: ["Admin", "Instructor", "User"] },
  accountStatus: { type: "string", enum: ["Active", "inActive"] },
  emailVerificationStatus: { type: "boolean", example: true },
  image: {
    type: "string",
    nullable: true,
    example: "/uploads/avatars/avatar.png",
  },
  last_login: { type: "string", nullable: true, format: "date-time" },
  register_Date: { type: "string", nullable: true, format: "date-time" },
  createdAt: { type: "string", nullable: true, format: "date-time" },
  updatedAt: { type: "string", nullable: true, format: "date-time" },
};

const response = (description, example) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ApiResponse" },
      ...(example ? { example } : {}),
    },
  },
});

const protectedOperation = (operation) => ({
  ...operation,
  security: [{ bearerAuth: [] }],
});

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "E-commerce API",
    version: "1.0.0",
    description: "V1 / MVP REST API for the e-commerce backend.",
  },
  servers: [{ url: "/api/v1", description: "API v1" }],
  tags: [
    { name: "Health" },
    { name: "Authentication" },
    { name: "Users" },
    { name: "Admins" },
    { name: "Categories" },
    { name: "Products" },
    { name: "Cart" },
    { name: "Orders" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Access token returned by the login or refresh endpoint.",
      },
    },
    schemas: {
      User: { type: "object", properties: userProperties },
      Product: {
        type: "object",
        properties: {
          _id: id,
          name: { type: "string", example: "Classic T-shirt" },
          slug: { type: "string", example: "classic-t-shirt" },
          description: {
            type: "string",
            example: "Cotton short-sleeve T-shirt",
          },
          price: { type: "number", example: 299.99 },
          compareAtPrice: { type: "string", nullable: true, example: "349.99" },
          category: id,
          images: { type: "string", nullable: true },
          stock: { type: "integer", example: 25 },
          sku: { type: "integer", nullable: true },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Category: {
        type: "object",
        properties: {
          _id: id,
          name: { type: "string", example: "Clothing" },
          slug: { type: "string", example: "clothing" },
          description: { type: "string", example: "Clothing and accessories" },
          isActive: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CartItem: {
        type: "object",
        required: ["product", "quantity", "price"],
        properties: {
          product: id,
          quantity: { type: "integer", minimum: 1, example: 2 },
          price: { type: "number", minimum: 0, example: 299.99 },
        },
      },
      Cart: {
        type: "object",
        properties: {
          _id: id,
          user: id,
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/CartItem" },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      OrderItem: {
        type: "object",
        properties: {
          product: id,
          name: { type: "string", example: "Classic T-shirt" },
          price: { type: "number", example: 299.99 },
          quantity: { type: "integer", example: 2 },
          subtotal: { type: "number", example: 599.98 },
        },
      },
      Order: {
        type: "object",
        properties: {
          _id: id,
          user: id,
          shippingAddress: { type: "string", example: "Menoufia, Egypt" },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderItem" },
          },
          subtotal: { type: "number", example: 599.98 },
          discount: { type: "number", example: 0 },
          shippingFee: { type: "number", example: 59.998 },
          tax: { type: "number", example: 20 },
          total: { type: "number", example: 679.978 },
          paymentStatus: {
            type: "string",
            enum: ["pending", "paid", "failed", "refunded"],
          },
          orderStatus: {
            type: "string",
            enum: [
              "pending",
              "confirmed",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
            ],
          },
          paymentReference: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      ApiResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          message: {
            type: "string",
            example: "Request completed successfully.",
          },
          count: { type: "integer", example: 1 },
          data: { type: "object", additionalProperties: true },
          Code: { type: "integer", example: 400 },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            properties: {
              token: { type: "string" },
              user: { $ref: "#/components/schemas/User" },
            },
          },
        },
      },
      Error: {
        type: "object",
        required: ["status", "message"],
        properties: {
          status: { type: "string", example: "FAIL" },
          message: { type: "string", example: "Product not found" },
          Code: { type: "integer", example: 404 },
        },
      },
    },
    responses: {
      BadRequest: response("Invalid request", {
        status: "fail",
        message: "Invalid request",
      }),
      Unauthorized: response("Authentication is required or invalid", {
        status: "ERROR",
        message: "Invalid Token.",
        Code: 401,
      }),
      Forbidden: response("Authenticated user is not allowed", {
        status: "FAIL",
        message: "This Role Not Allowed",
        Code: 401,
      }),
      NotFound: response("Resource not found", {
        status: "FAIL",
        message: "Resource not found",
        Code: 404,
      }),
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        responses: { 200: response("API is running") },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a user",
        description:
          "Creates an account and sends an email verification message.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["first_name", "last_name", "email", "password"],
                properties: {
                  first_name: { type: "string", minLength: 3, maxLength: 32 },
                  last_name: { type: "string", minLength: 3, maxLength: 32 },
                  email: { type: "string", format: "email" },
                  password: {
                    type: "string",
                    format: "password",
                    minLength: 6,
                    maxLength: 32,
                  },
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: response("Account created"),
          400: { $ref: "#/components/responses/BadRequest" },
          409: response("Email already exists"),
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Log in",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: {
                    type: "string",
                    format: "password",
                    minLength: 6,
                    maxLength: 32,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Authenticated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Log out",
        responses: { 200: response("Logged out") },
      },
    },
    "/auth/logout-all": {
      post: protectedOperation({
        tags: ["Authentication"],
        summary: "Log out from all devices",
        responses: {
          200: response("Logged out from all devices"),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      }),
    },
    "/auth/emailVerify/{userId}/{tokenVerify}": {
      post: {
        tags: ["Authentication"],
        summary: "Verify email",
        parameters: [
          { $ref: "#/components/parameters/userId" },
          {
            name: "tokenVerify",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: response("Email verified"),
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/auth/refreshToken": {
      post: {
        tags: ["Authentication"],
        summary: "Refresh access token",
        description: "Uses the refreshToken HTTP-only cookie set during login.",
        responses: {
          200: response("Token refreshed"),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Authentication"],
        summary: "Request password reset",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: { email: { type: "string", format: "email" } },
              },
            },
          },
        },
        responses: {
          200: response("Reset request accepted"),
          400: { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/auth/reset-password/{userId}/{token}": {
      post: {
        tags: ["Authentication"],
        summary: "Reset password",
        parameters: [
          { $ref: "#/components/parameters/userId" },
          {
            name: "token",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PasswordReset" },
            },
          },
        },
        responses: {
          200: response("Password updated"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/auth/change-password": {
      post: protectedOperation({
        tags: ["Authentication"],
        summary: "Change password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ChangePassword" },
            },
          },
        },
        responses: {
          200: response("Password changed"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      }),
    },
    "/users/me": {
      get: protectedOperation({
        tags: ["Users"],
        summary: "Get current user",
        responses: {
          200: response("User returned"),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      }),
      patch: protectedOperation({
        tags: ["Users"],
        summary: "Update current user profile",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProfileUpdate" },
            },
          },
        },
        responses: {
          200: response("Profile updated"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      }),
    },
    "/users/de-active": {
      post: protectedOperation({
        tags: ["Users"],
        summary: "Deactivate current account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["password"],
                properties: {
                  password: { type: "string", format: "password" },
                },
              },
            },
          },
        },
        responses: {
          200: response("Account deactivated"),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      }),
    },
    "/admins/getAllAdmin": {
      get: protectedOperation({
        tags: ["Admins"],
        summary: "List administrators",
        responses: {
          200: response("Administrators returned"),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      }),
    },
    "/admins/getAllUser": {
      get: protectedOperation({
        tags: ["Admins"],
        summary: "List users",
        responses: {
          200: response("Users returned"),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      }),
    },
    "/admins/getSingleUser/{userId}": {
      get: protectedOperation({
        tags: ["Admins"],
        summary: "Get a user",
        parameters: [{ $ref: "#/components/parameters/userId" }],
        responses: {
          200: response("User returned"),
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
    },
    "/admins/deleteUser/{userId}": {
      delete: protectedOperation({
        tags: ["Admins"],
        summary: "Delete a user",
        parameters: [{ $ref: "#/components/parameters/userId" }],
        responses: {
          200: response("User deleted"),
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
    },
    "/admins/addAdmin/{userId}": {
      post: protectedOperation({
        tags: ["Admins"],
        summary: "Promote a user to administrator",
        parameters: [{ $ref: "#/components/parameters/userId" }],
        responses: {
          200: response("User promoted"),
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
    },
    "/admins/deleteAdmin/{userId}": {
      post: protectedOperation({
        tags: ["Admins"],
        summary: "Remove administrator role",
        parameters: [{ $ref: "#/components/parameters/userId" }],
        responses: {
          200: response("Administrator role removed"),
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
    },
    "/admins/updateUserStatus/{userId}": {
      post: protectedOperation({
        tags: ["Admins"],
        summary: "Update user account status",
        parameters: [{ $ref: "#/components/parameters/userId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AccountStatusUpdate" },
            },
          },
        },
        responses: {
          200: response("Account status updated"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
    },
    "/admins/users/{userId}/status": {
      patch: protectedOperation({
        tags: ["Admins"],
        summary: "Update user account status",
        parameters: [{ $ref: "#/components/parameters/userId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AccountStatusUpdate" },
            },
          },
        },
        responses: {
          200: response("Account status updated"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List active categories",
        parameters: [
          { $ref: "#/components/parameters/page" },
          { $ref: "#/components/parameters/limit" },
        ],
        responses: { 200: response("Categories returned") },
      },
      post: protectedOperation({
        tags: ["Categories"],
        summary: "Create a category",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryInput" },
            },
          },
        },
        responses: {
          201: response("Category created"),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      }),
    },
    "/categories/{cid}": {
      get: {
        tags: ["Categories"],
        summary: "Get a category",
        parameters: [{ $ref: "#/components/parameters/cid" }],
        responses: {
          200: response("Category returned"),
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: protectedOperation({
        tags: ["Categories"],
        summary: "Update a category",
        parameters: [{ $ref: "#/components/parameters/cid" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryInput" },
            },
          },
        },
        responses: {
          200: response("Category updated"),
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
      delete: protectedOperation({
        tags: ["Categories"],
        summary: "Delete a category",
        parameters: [{ $ref: "#/components/parameters/cid" }],
        responses: {
          200: response("Category deleted"),
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
    },
    "/categories/deActive/{cid}": {
      post: protectedOperation({
        tags: ["Categories"],
        summary: "Deactivate a category",
        parameters: [{ $ref: "#/components/parameters/cid" }],
        responses: {
          200: response("Category deactivated"),
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
    },
    "/categories/{categoryId}/products": {
      get: {
        tags: ["Products"],
        summary: "List products in a category",
        parameters: [
          {
            name: "categoryId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          { $ref: "#/components/parameters/page" },
          { $ref: "#/components/parameters/limit" },
          { $ref: "#/components/parameters/search" },
          { $ref: "#/components/parameters/minPrice" },
          { $ref: "#/components/parameters/maxPrice" },
          { $ref: "#/components/parameters/sort" },
          { $ref: "#/components/parameters/fields" },
        ],
        responses: { 200: response("Products returned") },
      },
      post: protectedOperation({
        tags: ["Products"],
        summary: "Create a product in a category",
        parameters: [
          {
            name: "categoryId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductInput" },
            },
          },
        },
        responses: {
          201: response("Product created"),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      }),
    },
    "/categories/{categoryId}/products/{productId}": {
      get: {
        tags: ["Products"],
        summary: "Get a product in a category",
        parameters: [
          {
            name: "categoryId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: response("Product returned"),
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: protectedOperation({
        tags: ["Products"],
        summary: "Update a product in a category",
        parameters: [
          {
            name: "categoryId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductInput" },
            },
          },
        },
        responses: {
          200: response("Product updated"),
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
      delete: protectedOperation({
        tags: ["Products"],
        summary: "Delete a product in a category",
        parameters: [
          {
            name: "categoryId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "productId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: response("Product deleted"),
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
    },
    "/products": {
      get: {
        tags: ["Products"],
        summary: "List products",
        parameters: [
          { $ref: "#/components/parameters/page" },
          { $ref: "#/components/parameters/limit" },
          { $ref: "#/components/parameters/search" },
          { $ref: "#/components/parameters/category" },
          { $ref: "#/components/parameters/minPrice" },
          { $ref: "#/components/parameters/maxPrice" },
          { $ref: "#/components/parameters/sort" },
          { $ref: "#/components/parameters/fields" },
        ],
        responses: { 200: response("Products returned") },
      },
      post: protectedOperation({
        tags: ["Products"],
        summary: "Create a product",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductInput" },
            },
          },
        },
        responses: {
          201: response("Product created"),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      }),
    },
    "/products/{cid}": {
      get: {
        tags: ["Products"],
        summary: "Get a product",
        parameters: [{ $ref: "#/components/parameters/cid" }],
        responses: {
          200: response("Product returned"),
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      patch: protectedOperation({
        tags: ["Products"],
        summary: "Update a product",
        parameters: [{ $ref: "#/components/parameters/cid" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProductInput" },
            },
          },
        },
        responses: {
          200: response("Product updated"),
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
      delete: protectedOperation({
        tags: ["Products"],
        summary: "Delete a product",
        parameters: [{ $ref: "#/components/parameters/cid" }],
        responses: {
          200: response("Product deleted"),
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
    },
    "/cart": {
      get: protectedOperation({
        tags: ["Cart"],
        summary: "Get the current user's cart",
        responses: {
          200: response("Cart returned"),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      }),
    },
    "/cart/items": {
      post: protectedOperation({
        tags: ["Cart"],
        summary: "Add an item to the cart",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartItemInput" },
            },
          },
        },
        responses: {
          200: response("Item added"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
    },
    "/cart/items/{productId}": {
      patch: protectedOperation({
        tags: ["Cart"],
        summary: "Update a cart item quantity",
        parameters: [{ $ref: "#/components/parameters/productId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/QuantityInput" },
            },
          },
        },
        responses: {
          200: response("Cart item updated"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
      delete: protectedOperation({
        tags: ["Cart"],
        summary: "Remove an item from the cart",
        parameters: [{ $ref: "#/components/parameters/productId" }],
        responses: {
          200: response("Cart item removed"),
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
    },
    "/orders": {
      get: protectedOperation({
        tags: ["Orders"],
        summary: "List the current user's orders",
        responses: {
          200: response("Orders returned"),
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      }),
    },
    "/orders/{orderId}": {
      get: protectedOperation({
        tags: ["Orders"],
        summary: "Get one of the current user's orders",
        parameters: [{ $ref: "#/components/parameters/orderId" }],
        responses: {
          200: response("Order returned"),
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      }),
    },
    "/orders/checkout": {
      post: protectedOperation({
        tags: ["Orders"],
        summary: "Create an order from the current cart",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CheckoutInput" },
            },
          },
        },
        responses: {
          201: response("Order created"),
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
          409: response("Insufficient stock"),
        },
      }),
    },
  },
};

swaggerDefinition.components.parameters = {
  cid: {
    name: "cid",
    in: "path",
    required: true,
    schema: { type: "string" },
    description: "MongoDB document id",
  },
  userId: {
    name: "userId",
    in: "path",
    required: true,
    schema: { type: "string" },
  },
  productId: {
    name: "productId",
    in: "path",
    required: true,
    schema: { type: "string" },
  },
  orderId: {
    name: "orderId",
    in: "path",
    required: true,
    schema: { type: "string" },
  },
  page: {
    name: "page",
    in: "query",
    schema: { type: "integer", default: 1, minimum: 1 },
  },
  limit: {
    name: "limit",
    in: "query",
    schema: { type: "integer", default: 3, minimum: 1 },
  },
  search: { name: "search", in: "query", schema: { type: "string" } },
  category: { name: "category", in: "query", schema: { type: "string" } },
  minPrice: { name: "minPrice", in: "query", schema: { type: "number" } },
  maxPrice: { name: "maxPrice", in: "query", schema: { type: "number" } },
  sort: {
    name: "sort",
    in: "query",
    schema: { type: "string", example: "-createdAt,price" },
  },
  fields: {
    name: "fields",
    in: "query",
    schema: { type: "string", example: "name,price,stock" },
  },
};

Object.assign(swaggerDefinition.components.schemas, {
  PasswordReset: {
    type: "object",
    required: ["newPassword", "confirmPassword"],
    properties: {
      newPassword: {
        type: "string",
        format: "password",
        minLength: 6,
        maxLength: 32,
      },
      confirmPassword: {
        type: "string",
        format: "password",
        minLength: 6,
        maxLength: 32,
      },
    },
  },
  ChangePassword: {
    type: "object",
    required: ["currentPassword", "newPassword", "confirmPassword"],
    properties: {
      currentPassword: { type: "string", format: "password" },
      newPassword: {
        type: "string",
        format: "password",
        minLength: 6,
        maxLength: 32,
      },
      confirmPassword: { type: "string", format: "password" },
    },
  },
  ProfileUpdate: {
    type: "object",
    properties: {
      first_name: { type: "string", minLength: 3, maxLength: 32 },
      last_name: { type: "string", minLength: 3, maxLength: 32 },
    },
  },
  AccountStatusUpdate: {
    type: "object",
    required: ["accountStatus"],
    properties: {
      accountStatus: { type: "string", enum: ["Active", "inActive"] },
    },
  },
  CategoryInput: {
    type: "object",
    required: ["name", "description"],
    properties: {
      name: { type: "string", minLength: 3, maxLength: 32 },
      slug: { type: "string", minLength: 3, maxLength: 32 },
      description: { type: "string" },
      isActive: { type: "boolean" },
    },
  },
  ProductInput: {
    type: "object",
    required: ["name", "description", "price", "category", "stock"],
    properties: {
      name: { type: "string", minLength: 3, maxLength: 32 },
      description: { type: "string" },
      price: { type: "number" },
      category: { type: "string" },
      stock: { type: "integer" },
    },
  },
  CartItemInput: {
    type: "object",
    required: ["product", "quantity"],
    properties: {
      product: { type: "string" },
      quantity: { type: "integer", minimum: 1 },
    },
  },
  QuantityInput: {
    type: "object",
    required: ["quantity"],
    properties: { quantity: { type: "integer", minimum: 1 } },
  },
  CheckoutInput: {
    type: "object",
    required: ["shippingAddress"],
    properties: {
      shippingAddress: {
        type: "string",
        minLength: 10,
        maxLength: 300,
        example: "Menoufia, Egypt",
      },
    },
  },
});

module.exports = swaggerDefinition;

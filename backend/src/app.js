const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");
//--------------Middlewares----------------------------------

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("tiny"));
}
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  "/uploads/avatars",
  express.static(path.join(__dirname, "uploads/avatars")),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

//----------------Routers-------------------------------------
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "success",
    message: "API is running",
  });
});
app.use("/api/v1/auth", require("./Modules/Auth/auth.route"));
app.use("/api/v1/users", require("./Modules/User/user.route"));
app.use("/api/v1/admins", require("./Modules/Admin/admin.route"));
app.use("/api/v1/categories", require("./Modules/Category/category.route"));
app.use("/api/v1/products", require("./Modules/Products/product.route"));
app.use("/api/v1/cart", require("./Modules/Cart/cart.route"));
app.use("/api/v1/orders", require("./Modules/Orders/order.route"));

//--------------Error Handles----------------------------------

app.use((req, res, next) => {
  return res.status(404).json({
    status: "fail",
    message: "URL Not Found",
  });
});

app.use((error, req, res, next) => {
  return res.status(error.statusCode || 500).json({
    status: error.statusText || "ERROR",
    message: error.message,
    Code: error.statusCode,
  });
});

module.exports = app;

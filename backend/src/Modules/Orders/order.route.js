const express = require("express");
const router = express.Router();

const controller = require("./order.controller");
const verifyToken = require("../../Middleware/verifyToken");
const validate = require("../../Middleware/validate");
const checkoutSchema = require("./order.validate");

router.route("/").get(verifyToken, controller.getOrders);
router.route("/:orderId").get(verifyToken, controller.getSingleOrders);
router
  .route("/checkout")
  .post(verifyToken, validate(checkoutSchema), controller.checkout);
module.exports = router;

const express = require("express");
const router = express.Router();

const controller = require("./cart.controller");
const verifyToken = require("../../Middleware/verifyToken");
const validate = require("../../Middleware/validate");
const cartValidate = require("./cart.validate");
router.route("/").get(verifyToken, controller.getCart);

router
  .route("/items")
  .post(verifyToken, validate(cartValidate), controller.postItem);
router.route("/items/:productId").patch(verifyToken, controller.patchItem);
router.route("/items/:productId").delete(verifyToken, controller.deleteItem);

module.exports = router;

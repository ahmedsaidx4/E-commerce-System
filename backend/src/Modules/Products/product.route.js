const express = require("express");
const router = express.Router();

const controller = require("./product.controller");

const allowTo = require("../../Middleware/allowTo");
const roleState = require("../../utils/roleState");
const verifyToken = require("../../Middleware/verifyToken");

router
  .route("/")
  .get(controller.getProducts)
  .post(verifyToken, allowTo(roleState.Admin), controller.postProducts);

router.route("/search").get(controller.getProductsSearch);

router
  .route("/:cid")
  .get(controller.getSingleProduct)
  .patch(verifyToken, allowTo(roleState.Admin), controller.patchProduct)
  .delete(verifyToken, allowTo(roleState.Admin), controller.deleteProduct);

module.exports = router;

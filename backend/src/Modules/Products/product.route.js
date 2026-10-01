const express = require("express");
const router = express.Router({ mergeParams: true });

const controller = require("./product.controller");

const allowTo = require("../../Middleware/allowTo");
const roleState = require("../../utils/roleState");
const verifyToken = require("../../Middleware/verifyToken");
const { productValidation } = require("./product.validation");
const validate = require("../../Middleware/validate");
router.route("/").get(controller.getProducts).post(
  verifyToken,
  allowTo(roleState.Admin),

  validate(productValidation),
  controller.postProducts,
);

router
  .route("/:cid")
  .get(controller.getSingleProduct)
  .patch(verifyToken, allowTo(roleState.Admin), controller.patchProduct)
  .delete(verifyToken, allowTo(roleState.Admin), controller.deleteProduct);

module.exports = router;

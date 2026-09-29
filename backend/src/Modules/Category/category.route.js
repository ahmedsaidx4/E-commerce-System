const express = require("express");
const router = express.Router();
const controller = require("./category.controller");
const allowTo = require("../../Middleware/allowTo");
const roleState = require("../../utils/roleState");
const verifyToken = require("../../Middleware/verifyToken");

router
  .route("/")
  .get(controller.getCategories)
  .post(verifyToken, allowTo(roleState.Admin), controller.postCategories);

router
  .route("/:cid")
  .get(controller.getSingleCategory)
  .patch(verifyToken, allowTo(roleState.Admin), controller.patchCategory)
  .delete(verifyToken, allowTo(roleState.Admin), controller.deleteCategory);
module.exports = router;

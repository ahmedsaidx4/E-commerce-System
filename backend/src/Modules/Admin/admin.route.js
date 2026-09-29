const express = require("express");
const router = express.Router();
const controller = require("../Admin//admin.controller");
const verifyToken = require("../../Middleware/verifyToken");
const allowTo = require("../../Middleware/allowTo");
const roleState = require("../../utils/roleState");
const validate = require("../../Middleware/validate");
const { updateUserStatusSchema } = require("./admin.validation");

router
  .route("/getAllAdmin")
  .get(verifyToken, allowTo(roleState.Admin), controller.getAllAdmin);

router
  .route("/getAllUser")
  .get(
    verifyToken,
    allowTo(roleState.Admin, roleState.Instructor),
    controller.getAllUsers,
  );

router
  .route("/getSingleUser/:userId")
  .get(
    verifyToken,
    allowTo(roleState.Admin, roleState.Instructor),
    controller.getSingleUsers,
  );

router
  .route("/deleteUser/:userId")
  .delete(verifyToken, allowTo(roleState.Admin), controller.deleteUser);
router
  .route("/addAdmin/:userId")
  .post(verifyToken, allowTo(roleState.Admin), controller.addAdmin);
router
  .route("/deleteAdmin/:userId")
  .post(verifyToken, allowTo(roleState.Admin), controller.deleteAdmin);
router
  .route("/updateUserStatus/:userId")
  .post(verifyToken, allowTo(roleState.Admin), controller.updateUserStatus);
router
  .route("/users/:userId/status")
  .patch(
    verifyToken,
    allowTo(roleState.Admin),
    validate(updateUserStatusSchema),
    controller.updateUserStatus,
  );

module.exports = router;

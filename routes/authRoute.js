const express = require("express");
const controller = require("../controllers/authController");
const validator = require("../validators/authValidator");
const { userImageHandler, resizeUserImage, hashPassword } = require("../controllers/userController");

const router = express.Router();

router.post(
  "/signUp",
  userImageHandler,
  resizeUserImage,
  hashPassword,
  validator.signUp,
  controller.signUp
);

router.post(
  "/login",
  validator.login,
  controller.login
);

router.post(
  "/forgetPassword",
  validator.forgetPassword,
  controller.forgetPassword
);

router.post(
  "/resetCode",
  validator.resetCode,
  controller.resetCode
);

router.post(
  "/resetPassword",
  validator.resetPassword,
  controller.resetPassword
);

router.use(controller.protect, controller.permissions("user","admin"))

router.put(
  "/changePassword",
  validator.changePassword,
  controller.protect,
  controller.changePassword
);
module.exports = router;

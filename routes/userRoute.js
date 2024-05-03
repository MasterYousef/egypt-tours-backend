const express = require("express");
const controller = require("../controllers/userController");
const validator = require("../validators/userValidator");
const { protect, permissions } = require("../controllers/authController");

const router = express.Router();

router.get("/:id",protect,validator.checkUserId, controller.getUser)

router.use(protect, permissions("admin"));

router
  .route("/")
  .post(
    controller.userImageHandler,
    controller.resizeUserImage,
    controller.hashPassword,
    validator.createUser,
    controller.createUser
  )
  .get(controller.getUsers);
router
  .route("/:id")
  .put(
    controller.userImageHandler,
    controller.resizeUserImage,
    validator.updateUser,
    controller.updateUser
  )
  .delete(validator.checkUserId, controller.deleteUser);

module.exports = router;
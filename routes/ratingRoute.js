const express = require("express");
const { protect, permissions } = require("../controllers/authController");
const controller = require("../controllers/ratingController");
const validator = require("../validators/ratingValidator");

const router = express.Router({mergeParams:true});

router.get("/", controller.getratings);

router.use(protect);

router
  .route("/:id")
  .put(permissions("admin"),validator.updateRate, controller.updateRate)
  .delete(permissions("user"),validator.checkRateId, controller.deleteUserRate);

router.post(
  "/",
  permissions("admin"),
  controller.setUserId,
  validator.postRate,
  controller.postRate
);

router.delete("/admin/:id",permissions("admin"), validator.checkRateId, controller.deleteRate);

module.exports = router;

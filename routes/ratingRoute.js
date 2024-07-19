const express = require("express");
const { protect, permissions } = require("../controllers/authController");
const controller = require("../controllers/ratingController");
const validator = require("../validators/ratingValidator");

const router = express.Router({mergeParams:true});

router.get("/", controller.getratings);

router.use(protect);

router.delete("/admin/:id",permissions("admin"), validator.checkRateId, controller.deleteRate);

router.use(permissions("user"));

router
  .route("/:id")
  .put(controller.setUserId,validator.updateRate, controller.updateRate)
  .delete(controller.setUserId,validator.checkRateId, controller.deleteUserRate);

router.post(
  "/",
  controller.setUserId,
  validator.postRate,
  controller.postRate
);



module.exports = router;

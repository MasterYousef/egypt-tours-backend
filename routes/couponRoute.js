const express = require("express");
const controller = require("../controllers/couponController");
const validator = require("../validators/couponValidator");
const { protect, permissions } = require("../controllers/authController");

const router = express.Router();

router.use(protect)

router.get("/apply/:couponName",permissions("user"),validator.getCoupon, controller.getCoupon)

router.use(protect, permissions("admin"));

router.route("/").post(validator.postCoupon,controller.postCoupon).get(controller.getCoupons);
router
  .route("/:id")
  .get(validator.checkCouponId, controller.getCoupon)
  .put(validator.updateCoupon,controller.updateCoupon)
  .delete(validator.checkCouponId, controller.deleteCoupon);

module.exports = router;

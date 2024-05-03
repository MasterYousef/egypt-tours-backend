const coupon = require("../models/couponModel");
const MainController = require("./mainController");

exports.postCoupon = MainController.postOne(coupon);
exports.getCoupons = MainController.getAll(coupon);
exports.updateCoupon = MainController.updateOne(coupon);
exports.getCoupon = MainController.getOne(coupon);
exports.deleteCoupon = MainController.deleteOne(coupon);
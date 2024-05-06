const { check } = require("express-validator");
const validationMiddleWare = require("../middlewares/validationMiddlewares");
const AppError = require("../config/appError");
const tour = require("../models/tourModel");
const coupon = require("../models/couponModel");

exports.createOrder = [
  check("tour")
    .notEmpty()
    .withMessage("order tour reuired")
    .isMongoId()
    .withMessage("invalid tour id")
    .custom(async (value, { req }) => {
      const data = await tour.findOne({ _id: value });
      if (!data) {
        throw new AppError("Invalid Tour ID", 404);
      }
      req.body.price = data.price;
      req.body.user = req.user._id;
      return true;
    }),
  check("coupon")
    .optional()
    .notEmpty()
    .withMessage("order coupon is empty")
    .custom(async (value, { req }) => {
      const data = await coupon.findOne({ name: value });
      if (!data) {
        throw new AppError("Invalid coupon name", 404);
      }
      req.body.priceAfterDiscount =
        req.body.price - (data.discount / 100) * req.body.price;
      return true;
    }),
  validationMiddleWare,
];

exports.checkOrderId = [
  check("id")
    .notEmpty()
    .withMessage("order ID required")
    .isMongoId()
    .withMessage("order id is not valid"),
  validationMiddleWare,
];
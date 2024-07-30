const { check, param } = require("express-validator");
const validationMiddleWare = require("../middlewares/validationMiddlewares");
const AppError = require("../config/appError");
const tour = require("../models/tourModel");
const coupon = require("../models/couponModel");
const order = require("../models/orderModel");

exports.createOrder = [
  check("tour")
    .notEmpty()
    .withMessage("order tour reuired")
    .isMongoId()
    .withMessage("invalid tour id")
    .custom(async (value, { req }) => {
      const data = await tour.findOne({ _id: value });
      const tourOrder = await order.findOne({
        tour: req.body.tour,
        user: req.user._id,
      });
      if (tourOrder) {
        throw new AppError("you booked this tour before", 404)
      }
      if (!data) {
        throw new AppError("Invalid Tour ID", 404);
      }else if(data.maxPeople === data.people){
        throw new AppError("tour is full", 404)
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

exports.checkUserId = [
  param("user")
    .notEmpty()
    .withMessage("user ID required")
    .isMongoId()
    .withMessage("user id is not valid"),
  validationMiddleWare,
];
const { check } = require("express-validator");
const validationMiddleWare = require("../middlewares/validationMiddlewares");
const AppError = require("../config/appError");

exports.postCoupon = [
  check("name")
    .notEmpty()
    .withMessage("coupon name is required")
    .isLength({ min: 2 })
    .withMessage("coupon name must be more than 2 characters")
    .isLength({ max: 30 })
    .withMessage("coupon name must be less than 30 characters"),
  check("discount")
    .notEmpty()
    .withMessage("coupon discount is required")
    .custom((value) => {
      if (value < 5 || value > 100) {
        throw new AppError("coupon discount must be between 5 and 100 percent");
      }
      return true;
    }),
  check("expire")
    .notEmpty()
    .withMessage("expire date is required")
    .isDate()
    .withMessage("expire must be a date")
    .custom(async (value) => {
      const date = new Date(value);
      const now = new Date();
      if (now > date || now === date) {
        throw new AppError("expire date must be in the future");
      }
      return true;
    }),
  validationMiddleWare,
];

exports.updateCoupon = [
  check("id")
    .notEmpty()
    .withMessage("coupon ID required")
    .isMongoId()
    .withMessage("coupon id is not valid"),
  check("name")
    .optional()
    .notEmpty()
    .withMessage("coupon name is required")
    .isLength({ min: 2 })
    .withMessage("coupon name must be more than 2 characters")
    .isLength({ max: 30 })
    .withMessage("coupon name must be less than 30 characters"),
  check("discount")
    .optional()
    .notEmpty()
    .withMessage("coupon discount is required")
    .custom((value) => {
      if (value < 5 || value > 100) {
        throw new AppError("coupon discount must be between 5 and 100 percent");
      }
      return true;
    }),
  check("expire")
    .optional()
    .notEmpty()
    .withMessage("expire date is required")
    .isDate()
    .withMessage("expire must be a date")
    .custom(async (value) => {
      const date = new Date(value);
      const now = new Date();
      if (now > date || now === date) {
        throw new AppError("expire date must be in the future");
      }
      return true;
    }),
  validationMiddleWare,
];

exports.checkCouponId = [
  check("id")
    .notEmpty()
    .withMessage("coupon ID required")
    .isMongoId()
    .withMessage("coupon id is not valid"),
  validationMiddleWare,
];

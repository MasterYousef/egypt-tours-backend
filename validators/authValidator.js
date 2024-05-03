const { check } = require("express-validator");
const validationMiddleWare = require("../middlewares/validationMiddlewares");
const user = require("../models/userModel");
const AppError = require("../config/appError");

exports.signUp = [
  check("username")
    .notEmpty()
    .withMessage("username is required")
    .isLength({ max: 30 })
    .withMessage("username max length is 30 characters")
    .isLength({ min: 2 })
    .withMessage("username minimum length is 2 characters"),
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password minimum length is 6 characters"),
  check("email")
    .notEmpty()
    .withMessage("email is required")
    .isLength({ max: 30 })
    .withMessage("email must be grater than 10 character")
    .isLength({ min: 2 })
    .withMessage("email must be less than 100 character")
    .isEmail()
    .withMessage("unvalid email format")
    .custom(async (value) => {
      const data = await user.findOne({ email: value });
      if (data) {
        throw new AppError("email already exists", 409);
      } else {
        return true;
      }
    }),
  validationMiddleWare,
];

exports.login = [
  check("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("unvalid email format"),
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password minimum length is 6 characters"),
  validationMiddleWare,
];

exports.changePassword = [
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password minimum length is 6 characters"),
  check("newPassword")
    .notEmpty()
    .withMessage("new password is required")
    .isLength({ min: 6 })
    .withMessage("new password minimum length is 6 characters"),
  validationMiddleWare,
];

exports.forgetPassword = [
  check("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email not valid "),
  validationMiddleWare,
];

exports.resetCode = [
  check("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email not valid "),
  check("code")
    .notEmpty()
    .withMessage("Verification code is require")
    .isNumeric()
    .withMessage("Verification code must be number")
    .isLength({ max: 6 })
    .withMessage("Verification code must be 6 numbers"),
  validationMiddleWare,
];

exports.resetPassword = [
  check("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email not valid "),
    check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password minimum length is 6 characters"),
  validationMiddleWare,
];

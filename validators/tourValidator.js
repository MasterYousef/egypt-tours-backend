const { check } = require("express-validator");
const validationMiddleWare = require("../middlewares/validationMiddlewares");
const AppError = require("../config/appError");

exports.postTour = [
  check("title")
    .notEmpty()
    .withMessage("tour title is required")
    .isLength({ max: 25 })
    .withMessage("tour max length is 25 letters")
    .isLength({ min: 3 })
    .withMessage("tour minimum length is 3 letters"),
  check("description")
    .notEmpty()
    .withMessage("tour description is required")
    .isLength({ max: 255 })
    .withMessage("tour max length is 255 letters")
    .isLength({ min: 10 })
    .withMessage("tour minimum length is 10 letters"),
  check("images")
    .optional()
    .notEmpty()
    .withMessage("please choose an image at least"),
  check("price")
    .notEmpty()
    .withMessage("tour price is required")
    .isLength({ min: 1 })
    .withMessage("minimum tour price is 1"),
  check("maxPeople")
    .notEmpty()
    .withMessage("max people in tour is required")
    .isNumeric()
    .withMessage("value must be a number"),
  check("guides")
    .notEmpty()
    .withMessage("guides number in tour is required")
    .isNumeric()
    .withMessage("value must be a number"),
  check("start")
    .notEmpty()
    .withMessage("tour must have a start date")
    .isDate()
    .withMessage("tour start must be a date")
    .custom(async (value) => {
      const date = new Date(value);
      const now = new Date();
      if (now > date || now === date) {
        throw new AppError("tour start date must be in the future");
      }
      return true;
    }),
  check("duration")
    .notEmpty()
    .withMessage("tour duration is required")
    .isNumeric()
    .withMessage("value must be a number")
    .custom((value) => {
      if (value < 1) {
        throw new AppError("tour duration must be more than 1 day");
      }
      return true;
    }),
  validationMiddleWare,
];

exports.updateTour = [
  check("title")
    .optional()
    .notEmpty()
    .withMessage("tour title is required")
    .isLength({ max: 25 })
    .withMessage("tour max length is 25 letters")
    .isLength({ min: 3 })
    .withMessage("tour minimum length is 3 letters"),
  check("description")
    .optional()
    .notEmpty()
    .withMessage("tour description is required")
    .isLength({ max: 255 })
    .withMessage("tour max length is 255 letters")
    .isLength({ min: 10 })
    .withMessage("tour minimum length is 10 letters"),
  check("images")
    .optional()
    .notEmpty()
    .withMessage("please choose an image at least"),
  check("price")
    .optional()
    .notEmpty()
    .withMessage("tour price is required")
    .isLength({ min: 1 })
    .withMessage("minimum tour price is 1"),
  check("maxPeople")
    .optional()
    .notEmpty()
    .withMessage("max people in tour is required")
    .isNumeric()
    .withMessage("value must be a number"),
  check("guides")
    .optional()
    .notEmpty()
    .withMessage("guides number in tour is required")
    .isNumeric()
    .withMessage("value must be a number"),
  check("start")
    .optional()
    .notEmpty()
    .withMessage("tour must have a start date")
    .isDate()
    .withMessage("tour start must be a date")
    .custom(async (value) => {
      const date = new Date(value);
      const now = new Date();
      if (now > date || now === date) {
        throw new AppError("tour start date must be in the future");
      }
      return true;
    }),
  check("duration")
    .optional()
    .notEmpty()
    .withMessage("tour duration is required")
    .isNumeric()
    .withMessage("value must be a number")
    .custom((value) => {
      if (value < 1) {
        throw new AppError("tour duration must be more than 1 day");
      }
      return true;
    }),
  validationMiddleWare,
];

exports.checkTourId = [
  check("id")
    .notEmpty()
    .withMessage("tour ID required")
    .isMongoId()
    .withMessage("tour id is not valid"),
  validationMiddleWare,
];

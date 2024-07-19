const { check, body } = require("express-validator");
const validationMiddleWare = require("../middlewares/validationMiddlewares");
const rating = require("../models/ratingModel");

exports.postRate = [
  check("tour")
    .notEmpty()
    .withMessage("rating must belong to tour")
    .isMongoId()
    .withMessage("tour id is not valid"),
  body("user")
    .notEmpty()
    .withMessage("rating must belong to user")
    .isMongoId()
    .withMessage("user id is not valid")
    .custom(async (value, { req }) => {
      const data = await rating.findOne({ user: value, tour: req.body.tour });
      if (data) {
        throw new Error("you already rated this tour");
      }
      return true;
    }),
  check("rate")
    .notEmpty()
    .withMessage("rate is required")
    .isNumeric()
    .withMessage("rate is not valid")
    .custom((value) => {
      if (value < 1 || value > 5) {
        throw new Error("rate must be between 1 and 5");
      }
      return true;
    }),
  check("comment")
    .optional()
    .isLength({ min: 2 })
    .withMessage("comment letters must be more than 2 letters")
    .isLength({ max: 100 })
    .withMessage("comment letters must be less than 100 letters"),
  validationMiddleWare,
];

exports.updateRate = [
  check("id").isMongoId().withMessage("id not valid"),
  check("tour")
    .optional()
    .notEmpty()
    .withMessage("rating must belong to tour")
    .isMongoId()
    .withMessage("tour id is not valid"),
  body("user")
    .optional()
    .notEmpty()
    .withMessage("rating must belong to user")
    .isMongoId()
    .withMessage("user id is not valid")
    .custom(async (value, { req }) => {
      const data = await rating.findOne({ user: value, tour: req.body.tour });
      if (data) {
        throw new Error("you already rated this tour");
      }
      return true;
    }),
  check("rate")
    .optional()
    .notEmpty()
    .withMessage("rate is required")
    .isNumeric()
    .withMessage("rate is not valid")
    .custom((value) => {
      if (value < 1 || value > 5) {
        throw new Error("rate must be between 1 and 5");
      }
      return true;
    }),
  check("comment")
    .optional()
    .isLength({ min: 2 })
    .withMessage("comment letters must be more than 2 letters")
    .isLength({ max: 100 })
    .withMessage("comment letters must be less than 100 letters"),
  validationMiddleWare,
];

exports.checkRateId = [
  check("id")
    .notEmpty()
    .withMessage("rate ID required")
    .isMongoId()
    .withMessage("rate id is not valid"),
  validationMiddleWare,
];

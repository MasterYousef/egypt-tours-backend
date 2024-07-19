const expressAsyncHandler = require("express-async-handler");
const MainController = require("./mainController");
const rating = require("../models/ratingModel");
const AppError = require("../config/appError");

exports.setUserId = expressAsyncHandler((req, res, next) => {
  req.body.user = req.user._id.toString();
  next();
});
exports.postRate = MainController.postOne(rating);

exports.updateRate = expressAsyncHandler(async (req, res, next) => {
  const data = await rating.findById(req.params.id);
  if (!data) {
    next(new AppError("Invalid rating", 404));
  }
  if (data.user.toString() !== req.user._id.toString()) {
    next(new AppError("Invalid user", 404));
  }
  if (req.body.rate) {
    data.rate = req.body.rate;
  }
  if (req.body.comment) {
    data.comment = req.body.comment;
  }
  data.save();
  res.status(200).json({ status: "success" });
});

exports.deleteUserRate = expressAsyncHandler(async (req, res, next) => {
  const data = await rating.findById(req.params.id);
  if (!data) {
    next(new AppError("Invalid rating", 404));
  }
  if (data.user.toString() !== req.user._id.toString()) {
    next(new AppError("Invalid user", 404));
  }
  await rating.findByIdAndDelete(data._id);
  res.status(204).send();
});

exports.getRate = MainController.getOne(rating);

exports.getratings = MainController.getAll(rating);

exports.deleteRate = MainController.deleteOne(rating);

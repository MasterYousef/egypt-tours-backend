const fs = require('fs');
const expressAsyncHandler = require("express-async-handler");
const {
  multiImagesHandler,
  resizeMultiImages,
} = require("../middlewares/imagesMiddleware");
const tour = require("../models/tourModel");
const MainController = require("./mainController");
const AppError = require("../config/appError");

exports.postTour = MainController.postOne(tour);
exports.getTours = MainController.getAll(tour);

exports.updateTour = expressAsyncHandler(async (req, res, next) => {
  const data = await tour.findOne({ _id: req.params.id });
  if (!data) {
    next(new AppError("id is not valid", 404));
  }
  const image = data.imageCover.replace(`${process.env.BASE_URL}/`, "");
  fs.unlinkSync(`images/${image}`);
  const entries = Object.entries(req.body);
  entries.forEach(([key, value]) => {
    data[key] = req.body[key]
  });
  data.save()
  res.status(200).json({status:"success",data})
});

exports.getTour = MainController.getOne(tour);
exports.deleteTour = MainController.deleteOne(tour);
exports.tourImageHandler = multiImagesHandler([
  { name: "imageCover", maxCount: 1 },
  { name: "imageCover", maxCount: 5 },
]);
exports.resizeTourImages = expressAsyncHandler((req, res, next) =>
  resizeMultiImages(req, res, next, "tour")
);

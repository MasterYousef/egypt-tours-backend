const cloudinary = require("cloudinary").v2;
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
  if (req.body.imageCover) {
    cloudinary.uploader.destroy(data.imageCover);
  }

  if (req.body.images) {
    data.images.forEach((im) => {
      if (!req.body.images.includes(im)) {
        cloudinary.uploader.destroy(im);
      }
    });
  }
  const entries = Object.entries(req.body);
  entries.forEach(([key, value]) => {
    data[key] = req.body[key];
  });
  await data.save();
  res.status(200).json({ status: "success", data });
});

exports.getTour = MainController.getOne(tour);
exports.deleteTour = MainController.deleteOne(tour);
exports.tourImageHandler = multiImagesHandler([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);
exports.resizeTourImages = expressAsyncHandler((req, res, next) =>
  resizeMultiImages(req, res, next, "tour")
);

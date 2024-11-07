const cloudinary = require("cloudinary").v2;
const expressAsyncHandler = require("express-async-handler");
const {
  multiImagesHandler,
  resizeMultiImages,
} = require("../middlewares/imagesMiddleware");
const tour = require("../models/tourModel");
const MainController = require("./mainController");
const AppError = require("../config/appError");

exports.postTour = MainController.postOne(tour, "tour");
exports.getTours = MainController.getAll(tour);

exports.updateTour = expressAsyncHandler(async (req, res, next) => {
  const data = await tour.findOne({ _id: req.params.id });
  if (!data) {
    next(new AppError("id is not valid", 404));
  }
  if (req.body.images) {
    data.images.forEach((im) => {
      console.log(im);
      console.log(req.body.images.includes(im));
      if (!req.body.images.includes(im)) {
        const url = im.split("/");
        const image = `${url[url.length - 2]}/${url[url.length - 1]}`.replace(
          ".png",
          ""
        );
        cloudinary.uploader.destroy(image);
      }
    });
    data.imageCover = req.body.images[0];
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

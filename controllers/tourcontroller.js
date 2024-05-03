const expressAsyncHandler = require("express-async-handler");
const { multiImagesHandler, resizeMultiImages } = require("../middlewares/imagesMiddleware");
const tour = require("../models/tourModel");
const MainController = require("./mainController");


exports.postTour = MainController.postOne(tour);
exports.getTours = MainController.getAll(tour);
exports.updateTour = MainController.updateOne(tour);
exports.getTour = MainController.getOne(tour);
exports.deleteTour = MainController.deleteOne(tour);
exports.tourImageHandler = multiImagesHandler([{name:"imageCover",maxCount:1},{name:"imageCover",maxCount:5}])
exports.resizeTourImages = expressAsyncHandler((req,res,next)=>resizeMultiImages(req,res,next,"tour"))
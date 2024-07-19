const express = require("express");
const controller = require("../controllers/tourcontroller");
const validator = require("../validators/tourValidator");
const { protect, permissions } = require("../controllers/authController");
const ratingRoute = require("./ratingRoute");

const router = express.Router();

router.get("/", controller.getTours);

router.get("/:id", validator.checkTourId, controller.getTour);

router.use("/:tour/ratings", ratingRoute);

router.use(protect, permissions("admin"));

router.post(
  "/",
  controller.tourImageHandler,
  controller.resizeTourImages,
  validator.postTour,
  controller.postTour
);
router
  .route("/:id")
  .put(
    controller.tourImageHandler,
    controller.resizeTourImages,
    validator.updateTour,
    controller.updateTour
  )
  .delete(validator.checkTourId, controller.deleteTour);

module.exports = router;

const { default: mongoose } = require("mongoose");
const { imageModelOptions } = require("../middlewares/imagesMiddleware");

const schema = new mongoose.Schema({
  title: {
    required: [true, "tour title is required"],
    type: String,
    maxlenght: [25, "tour max length is 25 letters"],
    minlenght: [3, "tour minimum length is 3 letters"],
  },
  description: {
    required: [true, "tour description is required"],
    type: String,
    maxlenght: [255, "tour max length is 255 letters"],
    minlenght: [10, "tour minimum length is 10 letters"],
  },
  imageCover: {
    required: [true, "tour image cover is required"],
    type: String,
  },
  images: [String],
  price: {
    required: [true, "tour price is required"],
    type: Number,
    min: [1, "minimum tour price is 1"],
  },
  priceAfterDiscount: Number,
  people: {
    default: 0,
    type: Number,
  },
  maxPeople: {
    type: Number,
    required: [true, "max people in tour is required"],
    min: [1, "minimum tour people is 1"],
  },
  guides: {
    type: Number,
    required: [true, "Number of guides in tour is required"],
    min: [1, "minimum tour guides is 1"],
  },
  start: {
    type: Date,
    required: [true, "tour start date is required"],
  },
  duration: {
    type: Number,
    min: [1, "tour duration must be more than one day"],
    required: [true, "tour duration is required"],
  },
  ratingsAverage: Number,
  ratingsQuantity: Number,
});

imageModelOptions(schema, "tour");

const tour = mongoose.model("tour", schema);

module.exports = tour;

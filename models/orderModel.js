const { default: mongoose } = require("mongoose");

const schema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "tour",
    required: [true, "order tour is required"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: [true, "user is required"],
  },
  price: {
    type: Number,
    required: [true, "price is required"],
  },
  priceAfterDiscount: Number,
  coupon: {
    type: String,
    ref: "coupon",
  },
  ispaid: {
    type: Boolean,
    default: false,
  },
});

schema.pre(/^find/, function (next) {
  this.populate(
    "tour",
    "title start duration price imageCover people"
  ).populate("user", "username email");
  next();
});

const order = mongoose.model("order", schema);

module.exports = order;

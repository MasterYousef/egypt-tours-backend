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
  payment: {
    type: String,
    required: [true, "payment method is required"],
    enum: ["cash", "card"],
    default: "cash",
  },
  ispaid: {
    type: Boolean,
    default: false,
  },
});

const order = mongoose.model("order", schema);

module.exports = order;

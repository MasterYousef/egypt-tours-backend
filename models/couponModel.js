const { default: mongoose } = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "coupon name is required"],
    maxlenght: [30, "coupon name must be less than 30 letters"],
    minlenght: [2, "coupon name must be more than 2 letters"],
  },
  discount: {
    type: Number,
    required: [true, "coupon discount is required"],
    max: [100, "coupon discount must be less than 100 percent"],
    min: [5, "coupon discount must be more than 5 percent"],
  },
  expire: {
    type: Date,
    required: [true, "coupon expire date is required"],
  },
});

const coupon = mongoose.model("coupon", schema);

module.exports = coupon;

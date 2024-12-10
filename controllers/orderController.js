const expressAsyncHandler = require("express-async-handler");
const paypal = require("paypal-rest-sdk");
const MainController = require("./mainController");
const order = require("../models/orderModel");
const AppError = require("../config/appError");
const tour = require("../models/tourModel");

exports.getOrders = MainController.getAll(order,"order");

exports.deleteOrder = MainController.deleteOne(order);

exports.getOrder = MainController.getOne(order);

exports.setIsPaid = expressAsyncHandler(async (req, res, next) => {
  const data = await order.findByIdAndUpdate(
    req.params.id,
    { ispaid: true },
    {
      new: true,
    }
  );
  res.status(200).json({ status: "success", data });
});

exports.createCardOrder = expressAsyncHandler(async (req, res, next) => {
  paypal.configure({
    mode: "sandbox", // or 'live' for production
    client_id: process.env.paypal_Id,
    client_secret: process.env.paypal_secret,
  });

  const price = req.body.priceAfterDiscount
    ? req.body.priceAfterDiscount
    : req.body.price;

  const customData = {
    tour: req.body.tour,
    user: req.user._id,
  };

  const data = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
      payer_info: {
        email: req.user.email,
      },
    },
    redirect_urls: {
      return_url: `${process.env.FRONT_URL}/tour/${req.body.tour}?success`,
      cancel_url: `${process.env.FRONT_URL}/tour/${req.body.tour}`,
    },
    transactions: [
      {
        amount: {
          total: price.toString(),
          currency: "USD",
        },
        description: "Testing PayPal payment",
        custom: JSON.stringify(customData),
      },
    ],
  };

  await paypal.payment.create(data, (error, payment) => {
    if (error) {
      throw error;
    } else {
      res.status(200).json({ payment });
    }
  });
});

exports.paypalWebhook = expressAsyncHandler(async (req, res, next) => {
  const { paymentId } = req.query;
  paypal.configure({
    mode: "sandbox",
    client_id: process.env.paypal_Id,
    client_secret: process.env.paypal_secret,
  });
  paypal.payment.get(paymentId, async (error, payment) => {
    if (error) {
      next(new AppError("'Error retrieving payment details", 404));
    } else {
      const custom = JSON.parse(payment.transactions[0].custom);
      const data = await order.findOne({
        tour: custom.tour,
        user: custom.user,
      });
      if (data) {
        next(new AppError("you booked this tour before", 404));
      } else {
        await order.create({
          tour: custom.tour,
          user: custom.user,
          ispaid: true,
          price: payment.transactions[0].amount.total,
        });
        await tour.findByIdAndUpdate(custom.tour,{$inc:{people:+1}});
        res
          .status(200)
          .json({ status: "success", message: "your order has ben created" });
      }
    }
  });
});

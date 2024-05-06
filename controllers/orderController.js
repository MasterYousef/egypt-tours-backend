const expressAsyncHandler = require("express-async-handler");
const paypal = require("paypal-rest-sdk");
const MainController = require("./mainController");
const order = require("../models/orderModel");
const AppError = require("../config/appError");

exports.getOrders = MainController.getAll(order);

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

exports.createCashOrder = MainController.postOne(order);

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
      return_url: `${req.protocol}://${req.get("host")}/orders`,
      cancel_url: `${req.protocol}://${req.get("host")}/tours`,
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
      console.log(error);
      next(new AppError("'Error retrieving payment details", 404));
    } else {
      const custom = JSON.parse(payment.transactions[0].custom);
      const data = await order.create({
        tour: custom.tour,
        user: custom.user,
        payment: "card",
        ispaid: true,
        price: payment.transactions[0].amount.total,
      });
      res
        .status(200)
        .json({ status: "success", message: "your order has ben created" });
    }
  });
});

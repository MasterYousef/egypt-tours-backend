const expressAsyncHandler = require("express-async-handler");
const paypal = require("paypal-rest-sdk");
const crypto = require("crypto");
const { default: axios } = require("axios");
const MainController = require("./mainController");
const order = require("../models/orderModel");
const AppError = require("../config/appError");

exports.createCashOrder = MainController.postOne(order);

const paypalToken = async () => {
  try {
    const clientId = process.env.paypal_Id;
    const clientSecret = process.env.paypal_secret;
    console.log(process.env.paypal_Id);
    // Make a POST request to PayPal token endpoint
    const response = await axios.post(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      null,
      {
        params: {
          grant_type: "client_credentials",
        },
        headers: {
          Accept: "application/json",
          "Accept-Language": "en_US",
        },
        auth: {
          username: clientId,
          password: clientSecret,
        },
      }
    );

    const accessToken = response.data.access_token;
    return accessToken;
  } catch (error) {
    console.error("Error obtaining access token:", error.response.data);
  }
};

exports.createCardOrder = expressAsyncHandler(async (req, res, next) => {
  paypal.configure({
    mode: "sandbox", // or 'live' for production
    client_id: process.env.paypal_Id,
    client_secret: process.env.paypal_secret,
  });
  const price = req.body.priceAfterDiscount
    ? req.body.priceAfterDiscount
    : req.body.price;
  const data = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
      payer_info: {
        email: req.user.email,
      },
    },
    redirect_urls: {
      return_url: `https://egypt-tours-backend.onrender.com/api/v1/order/webhook`,
      cancel_url: "http://localhost:3000/cancel",
    },
    transactions: [
      {
        amount: {
          total: price.toString(),
          currency: "USD",
        },
        description: "Testing PayPal payment",
        custom: req.body.tour,
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
  const signature = req.headers["paypal-transmission-sig"];
  const body = JSON.stringify(req.body);
  const accessToken = await paypalToken(); // Your function to obtain PayPal access token

  try {
    // Fetch PayPal's public key
    const response = await fetch(
      "https://api.sandbox.paypal.com/v1/notifications/webhooks-public-keys",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch PayPal public keys");
    }

    const { keys } = await response.json();

    // Find the public key corresponding to the webhook signature
    const publicKey = keys.find(
      (key) => key.key_id === req.headers["paypal-webhook-id"]
    ).public_key;

    // Verify signature
    const verifier = crypto.createVerify("sha256");
    verifier.update(body);
    const isSignatureValid = verifier.verify(publicKey, signature, "base64");

    if (!isSignatureValid) {
      throw new Error("Webhook signature verification failed");
    }

    // Signature verified, handle webhook event
    console.log("Received PayPal order webhook:", req.body);
    res.status(200).end();
  } catch (error) {
    console.error("Error handling PayPal webhook:", error);
    res.status(403).end();
  }
});

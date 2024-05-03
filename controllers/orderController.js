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

const verifyWebhookSignature = (
  publicKey,
  authAlgo,
  transmissionId,
  actualSignature,
  requestBody
) => {
  const verifier = crypto.createVerify(authAlgo);
  verifier.update(`${transmissionId} | ${requestBody}`);
  return verifier.verify(publicKey, actualSignature, "base64");
};

const fetchPayPalCert = async (certUrl) => {
  try {
    const response = await axios.get(certUrl);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching PayPal public certificate");
  }
};

const webhook = async (req, res) => {
  const headers = req.headers;
  const body = JSON.stringify(req.body);

  // Retrieve signature details from headers
  const authAlgo = headers["paypal-auth-algo"];
  const transmissionId = headers["paypal-transmission-id"];
  const certUrl = headers["paypal-cert-url"];
  const actualSignature = headers["paypal-transmission-sig"];

  try {
    // Fetch PayPal's public certificate
    const publicKey = await fetchPayPalCert(certUrl);

    // Verify the webhook signature
    const isVerified = verifyWebhookSignature(
      publicKey,
      authAlgo,
      transmissionId,
      actualSignature,
      body
    );

    if (isVerified) {
      console.log("Webhook signature verified");
      // Process the webhook payload here
      res.status(200).send("Webhook signature verified");
    } else {
      console.error("Webhook signature verification failed");
      res.status(400).send("Webhook signature verification failed");
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).send("Error handling webhook");
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
      return_url: `${req.protocol}://${req.get("host")}/order`,
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
  webhook(req, res);
  const signature = req.headers["paypal-transmission-sig"];
  const webhookId = req.headers["paypal-webhook-id"];
  const body = JSON.stringify(req.body);
  const accessToken = await paypalToken();
  console.log(accessToken);
  try {
    const response = await fetch(
      `https://api.sandbox.paypal.com/v1/notifications/webhooks-events/${webhookId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!response.ok) {
      throw new AppError(
        "Failed to fetch PayPal public key",
        response.statusText
      );
    }

    const { public_key: publicKey } = await response.json();

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

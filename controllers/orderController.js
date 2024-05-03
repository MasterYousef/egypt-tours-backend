const expressAsyncHandler = require("express-async-handler");
const paypal = require('paypal-rest-sdk');
const MainController = require("./mainController");
const order = require("../models/orderModel");


exports.createCashOrder = MainController.postOne(order);

exports.createCardOrder = expressAsyncHandler(async(req,res,next)=>{
    paypal.configure({
        'mode': 'sandbox', // or 'live' for production
        'client_id':process.env.paypal_Id,
        'client_secret': process.env.paypal_secret
    });
    const price = req.body.priceAfterDiscount ? req.body.priceAfterDiscount : req.body.price
    console.log(price);
    const data = {
        'intent': 'sale',
        'payer': {
            'payment_method': 'paypal',
            'payer_info': {
                'email': req.user.email
            }
        },
        'redirect_urls': {
            'return_url': 'http://localhost:3000/success',
            'cancel_url': 'http://localhost:3000/cancel'
        },
        'transactions': [{
            'amount': {
                'total': price.toString(),
                'currency': 'USD'
            },
            'description': 'Testing PayPal payment',
            'custom': req.body.tour
        }]
    };

   await paypal.payment.create(data, (error, payment) => {
        if (error) {
            throw error;
        } else {
            res.redirect(payment.links[1].href);
        }
    });
})

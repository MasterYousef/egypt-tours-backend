const express = require("express");
const controller = require("../controllers/orderController");
const validator = require("../validators/orderValidator");
const { protect } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.post("/cash",validator.createOrder, controller.createCashOrder);

router.post("/card",validator.createOrder,controller.createCardOrder);

module.exports = router;

const express = require("express");
const controller = require("../controllers/orderController");
const validator = require("../validators/orderValidator");
const { protect , permissions } = require("../controllers/authController");

const router = express.Router();

router.get("/webhook", controller.paypalWebhook);

router.use(protect);

router.post("/card", permissions("user") , validator.createOrder, controller.createCardOrder);

router.use(permissions("admin"))

router.get("/",controller.getOrders)

router.route("/:id").put(validator.checkOrderId,controller.setIsPaid).delete(validator.checkOrderId,controller.deleteOrder).get(validator.checkOrderId,controller.getOrder)

module.exports = router;

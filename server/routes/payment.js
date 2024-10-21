const express = require("express");
const router = express.Router();
const paymentController = require("../controller/payment");

router.post("/create-payment-vnpay", paymentController.createPaymentVnpay);

module.exports = router;

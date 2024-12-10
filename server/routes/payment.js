const express = require("express");
const router = express.Router();
const paymentController = require("../controller/payment");

router.post("/create-payment-vnpay", paymentController.createPaymentVnpay);
router.get("/vnpay_return", paymentController.vnpayReturn);

module.exports = router;

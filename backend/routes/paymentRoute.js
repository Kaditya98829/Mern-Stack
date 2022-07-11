const express = require('express');
const { processPayment, sendStripeApikey } = require('../controller/paymentControllers');
const { isAuthUser } = require('../middleware/auth');
const router = express.Router();


router.route("/payment/process").post(isAuthUser, processPayment);
router.route("/stripeapikey").get(isAuthUser,sendStripeApikey);
module.exports = router
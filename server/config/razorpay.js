const Razorpay = require("razorpay");
const razorpo = require("razorpay");

exports.instance = new Razorpay({
  key_id: process.env.RAZORPAYKEY,
  key_secret: process.env.RAZORPAYSECRET,
});

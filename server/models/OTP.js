const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 5 minutes (300 seconds) for TTL (Time To Live)
  },
});

// a  fuction to send mail
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "verificaation email fom study notion",
      otp
    );
    console.log(" mail sent succesfuly ", mailResponse);
  } catch (err) {
    console.log("error occured whuile sending mail");
    throw err;
  }
}

OTPSchema.pre("save", async function (next) {
  await sendVerificationEmail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", OTPSchema);

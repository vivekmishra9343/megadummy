const nodemailer = require("nodemailer");

const mailsender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAil_Host,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: "study notion || vivek mishra",
      to: email,
      subject: title,
      html: `${body}`,
    });

    console.log(info);
    return info;
  } catch (err) {
    console.log(err);
  }
};
module.exports = mailsender;

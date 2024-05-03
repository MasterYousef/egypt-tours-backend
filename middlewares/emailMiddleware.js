const nodemailer = require("nodemailer");

const emailMiddleware = (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.email_host,
    port: process.env.email_port,
    secure: process.env.email_secure,
    auth: {
      user: process.env.email_user,
      pass: process.env.email_pass,
    },
  });

  const emailOption = {
    from: "Egypt-Tours <yousef8last@gmail.com>",
    to:options.email,
    subject: options.subject,
    text: options.text,
  };
  transporter.sendMail(emailOption)
};
module.exports = emailMiddleware

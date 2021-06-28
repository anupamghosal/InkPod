const nodemailer = require("nodemailer");

const verifyTemplate = require("../emailTemplates/verifyMail");

const emailAddress = "inkpod-verification@outlook.com";
const mailHost = "smtp-mail.outlook.com";
const emailPassword = process.env.EMAIL_PASS;

sendVerification = async ({ email, template }) => {
  const mailBody = {
    headers: {
      priority: "high",
    },
    from: `Inkpod Inc. <${emailAddress}>`,
    to: email,
    subject: "Confirm your email",
    html: template,
  };

  const transporter = nodemailer.createTransport({
    host: mailHost,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: emailAddress,
      pass: emailPassword,
    },
  });

  await transporter.sendMail(mailBody);
};

module.exports = mailer = {
  sendVerification,
};

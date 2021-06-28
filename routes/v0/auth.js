const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const verifyTemplate = require("../../emailTemplates/verifyMail");
const mailer = require("../../config/mailer");

const User = require("../../models/User");

const rmPassword = require("../../utils/prod-util/removePass");
const {
  validateEmail,
  validatePassword,
  validateName,
} = require("../../utils/prod-util/validators");

const secret = process.env.AUTH_SECRET;
const emailSecret = process.env.EMAIL_SECRET;

router.post("/register", (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  const errors = [
    validateEmail(email),
    validatePassword(password),
    validateName(name),
  ].filter(Boolean);

  if (errors.length)
    return res.status(400).json({
      success: false,
      message: errors[0].details[0].message,
    });

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "passwords do not match",
    });
  }

  User.findOne({ email: email }).then(async (user) => {
    if (user)
      return res.status(403).json({
        success: false,
        message: "Email already exists. Try logging in.",
      });

    const emailToken = await jwt.sign({ email }, emailSecret);

    const newUser = new User({
      name,
      email,
      password,
      emailToken,
    });

    bcrypt.genSalt(11, (err, salt) => {
      if (err)
        return res.status(500).json({
          success: false,
          message:
            "There was some problem while creating your account. Please try again later.",
        });
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err)
          return res.status(500).json({
            success: false,
            message:
              "There was some problem while creating your account. Please try again later.",
          });
        newUser.password = hash;
        newUser.save((err) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message:
                "There was some problem while creating your account. Please try again later.",
            });
          } else {
            const token = jwt.sign({ newUser }, secret);

            sendVerification({
              email,
              template: verifyTemplate({
                userName: `${name.split(" ")[0]}`,
                verifyLink: `https://www.inkpod.org/auth/confirm/${emailToken}`,
              }),
            });

            return res.status(200).json({
              success: true,
              message: "User successfully registered",
              user: rmPassword(newUser),
              token,
            });
          }
        });
      });
    });
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const errors = [validateEmail(email), validatePassword(password)].filter(
    Boolean
  );

  if (errors.length)
    return res.status(400).json({
      success: false,
      message: errors[0].details[0].message,
    });

  User.findOne({ email }, (err, user) => {
    if (err)
      return res
        .status(400)
        .json({ message: "Unexpected error! Please try again" });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Email not registered" });
    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err)
        return res.status(400).json({
          success: false,
          message: "Unexpected error! Please try again",
        });
      if (!isMatch)
        return res
          .status(401)
          .json({ success: false, message: "Email or Password did not match" });

      const token = jwt.sign({ user }, secret);
      return res.status(200).json({
        success: true,
        message: "User successfully logged in",
        token,
        user: rmPassword(user),
      });
    });
  });
});

router.post("/confirm", (req, res) => {
  const { token } = req.body;
  try {
    const email = jwt.verify(token, emailSecret).email;

    User.findOne({ email }).then(async (user) => {
      if (!user)
        return res
          .status(403)
          .json({ success: false, message: "Cannot verify your email." });

      await User.findOneAndUpdate(
        { _id: user._id },
        { userVerified: true, $unset: { emailToken: "" } }
      );
      return res.status(200).json({
        success: true,
        message: "User has been successfully verified",
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
});

router.get("/confirm", (req, res) => {
  const { email } = req.query;

  try {
    User.findOne({ email }).then(async (user) => {
      if (!user)
        return res
          .status(403)
          .json({ success: false, message: "Email address not registered" });

      if (!!user.userVerified)
        return res
          .status(403)
          .json({ success: false, message: "User already verified" });

      const emailToken = await jwt.sign({ email }, emailSecret);

      User.findOneAndUpdate({ _id: user._id }, { emailToken });

      sendVerification({
        email,
        template: verifyTemplate({
          userName: `${user.name.split(" ")[0]}`,
          verifyLink: `https://www.inkpod.org/auth/confirm/${emailToken}`,
        }),
      });

      return res
        .status(200)
        .json({ success: true, message: "Verification mail sent" });
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
});

module.exports = router;

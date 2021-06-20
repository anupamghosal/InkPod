const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const User = require("../../models/User");

const rmPassword = require("../../utils/prod-util/removePass");
const {
  validateEmail,
  validatePassword,
  validateName,
} = require("../../utils/prod-util/validators");

const secret = process.env.AUTH_SECRET;

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

  User.findOne({ email: email }).then((user) => {
    if (user)
      return res.status(403).json({
        success: false,
        message: "Email already exists. Try logging in.",
      });

    const newUser = new User({
      name,
      email,
      password,
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

module.exports = router;

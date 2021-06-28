const Joi = require("joi");

const validateEmail = (email) => {
  const emailSchema = Joi.object({ email: Joi.string().email().required() });
  return emailSchema.validate({ email }).error;
};

const validatePassword = (password) => {
  const passwordSchema = Joi.object({
    password: Joi.string()
      .trim()
      .min(8)
      .max(15)
      .required()
      .invalid("<", ">", "{", "}"),
  });
  return passwordSchema.validate({ password }).error;
};
const validateName = (name) => {
  const nameSchema = Joi.object({
    name: Joi.string().max(40).required(),
  });
  return nameSchema.validate({ name }).error;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
};

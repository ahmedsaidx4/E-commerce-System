const joi = require("joi");

const productValidation = joi.object({
  name: joi.string().max(32).min(3).required(),
  // slug: joi.string().max(32).min(3).required(),
  description: joi.string().required(),
  price: joi.number().required(),
  category: joi.string().required(),
  stock: joi.number().required(),
});

module.exports = { productValidation };

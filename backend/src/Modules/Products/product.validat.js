const joi = require("joi");

const productValidation = joi.object({
  name: joi.string().max(32).min(3).required(),
  slug: joi.string().max(32).min(3).required(),
  description: joi.string().required(),
  price: joi.number().required(),
  category: joi.string().required(),
});

module.exports = {
  productValidation,
};

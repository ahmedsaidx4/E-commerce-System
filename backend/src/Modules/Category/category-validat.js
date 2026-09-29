const joi = require("joi");

const categoryValidation = joi.object({
  name: joi.string().max(32).min(3).required(),
  slug: joi.string().max(32).min(3).required(),
  description: joi.string().required(),
});
module.exports = {
  categoryValidation,
};

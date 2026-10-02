const joi = require("joi");
const cartValidate = joi.object({
  product: joi.string().required(),
  quantity: joi.number().required(),
});
module.exports = cartValidate;

const Joi = require("joi");
const checkoutSchema = Joi.object({
  shippingAddress: Joi.string().trim().min(10).max(300).required().messages({
    "any.required": "Shipping address is required",
    "string.empty": "Shipping address cannot be empty",
    "string.min": "Shipping address must be at least 10 characters",
    "string.max": "Shipping address cannot exceed 300 characters",
  }),
});
module.exports = checkoutSchema;

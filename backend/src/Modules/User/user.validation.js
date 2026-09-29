const joi = require("joi");

const editProfileSchema = joi.object({
  first_name: joi.string().min(3).max(32),
  last_name: joi.string().min(3).max(32),
});
module.exports = { editProfileSchema };

const joi = require("joi");

const updateUserStatusSchema = joi.object({
  accountStatus: joi.string().valid("Active", "inActive").required(),
});

module.exports = {
  updateUserStatusSchema,
};

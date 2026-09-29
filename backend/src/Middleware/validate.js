const fs = require("node:fs");

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      if (req.file?.path) {
        fs.unlink(req.file.path, () => {});
      }

      return res.status(400).json({
        status: "fail",
        message: error.details[0].message,
      });
    }
    req.body = value;

    next();
  };
};
module.exports = validate;

const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const messages = result.error.errors.map((e) => e.message).join(', ');
    return next(new ApiError(400, messages));
  }
  req.validatedBody = result.data;
  next();
};

module.exports = validate;

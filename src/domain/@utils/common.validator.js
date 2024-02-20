const Joi = require('joi').extend(require('@joi/date'));

exports.applyDateRangeValidation = (object) => {
  const validator = Joi.object().keys({
    start: Joi.date().format('YYYY-MM-DD').raw().required(),
    end: Joi.date().format('YYYY-MM-DD').raw().required()
  });
  const { value, error } = validator.validate(object);
  if (error) {
    throw error;
  }
  return value;
};

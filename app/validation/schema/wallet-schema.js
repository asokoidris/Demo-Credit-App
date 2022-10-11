const joi = require('joi');

const creditWallet = joi.object().keys({
  email: joi.string().email().required(),
  amount: joi.number().required(),
  bank: {
    code: joi.string().required(),
    account_number: joi.string().required(),
    token: joi.string().required(),
  },
  currency: joi.string().required(),
});

const initiateWithdrawal = joi.object().keys({
  type: joi.string().required(),
  name: joi.string().required(),
  account_number: joi.string().required(),
  bank_code: joi.string().required(),
  currency: joi.string().required(),
  amount: joi.number().required(),
});

module.exports = {
  creditWallet,
  initiateWithdrawal,
};

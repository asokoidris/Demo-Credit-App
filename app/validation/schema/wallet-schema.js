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

const transfer = joi
  .object()
  .keys({
    username: joi.string(),
    email: joi.string().email(),
    amount: joi.number().required(),
    currency: joi.string().required(),
  })
  .or('username', 'email');

module.exports = {
  creditWallet,
  initiateWithdrawal,
  transfer,
};

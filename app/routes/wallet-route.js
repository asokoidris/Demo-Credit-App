const express = require('express');
const router = express.Router();
const {
  creditWallet,
  initiateWithdrawal,
  transfer,
} = require('../validation/schema/wallet-schema');
const { validate } = require('../validation/validatorClass');
const WalletController = require('../controllers/wallet-controller');
const Auth = require('../middlewares/authentication');
const Currency = require('../middlewares/currency');

router.get('/', Auth.checkUserAuthentication, WalletController.getWallets);
router.get('/banks', Auth.checkUserAuthentication, WalletController.getBanks);
router.post(
  '/deposit',
  Auth.checkUserAuthentication,
  validate(creditWallet),
  Currency.checkCurrency,
  WalletController.creditWallet
);
router.post(
  '/withdrawal',
  Auth.checkUserAuthentication,
  Currency.checkCurrency,
  validate(initiateWithdrawal),
  WalletController.initiateWithdrawal
);

router.post(
  '/transfer',
  Auth.checkUserAuthentication,
  Currency.checkCurrency,
  validate(transfer),
  WalletController.transfer
);

module.exports = router;

const express = require('express');
const router = express.Router();
const {} = require('../validation/schema/wallet-schema');
const { validate } = require('../validation/validatorClass');
const WalletController = require('../controllers/wallet-controller');
const Auth = require('../middlewares/authentication');

router.get('/', Auth.checkUserAuthentication, WalletController.getWallets);
router.get('/banks', Auth.checkUserAuthentication, WalletController.getBanks);

module.exports = router;

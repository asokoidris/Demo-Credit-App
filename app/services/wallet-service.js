const knex = require('../config/database');
const PaystackService = require('../services/paystack-service');

/**
 * @description - wallet service class for business logic
 */

class WalletService {
  /**
   * @description - This method is used to get all wallets
   * @param {object} user - The user object
   * @returns {object} - Returns an object
   * @memberof WalletService
   */

  static async getWallets(user) {
    const WalletModel = () => knex('wallets');

    const wallet = await WalletModel().where({ user_id: user.id }).first();

    if (!wallet)
      return {
        statusCode: 404,
        message: 'No wallets found',
      };
    logger.info(`Wallets retrieved successfully for user: ${user.id}`);

    return wallet;
  }

  /**
   * @description - This method is used to get list of banks and code from paystack
   * @returns {object} - Returns an object
   * @memberof WalletService
   */
  static async getBanks() {
    const result = await PaystackService.getBanks();
    if (result.statusCode == 404)
      return {
        statusCode: 404,
        message: 'No banks found',
      };
    logger.info(`Banks retrieved successfully: ${JSON.stringify(result)}`);
    return result;
  }
}

module.exports = WalletService;

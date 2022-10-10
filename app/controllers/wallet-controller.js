const WalletService = require('../services/wallet-service');
const { errorResponse, successResponse } = require('../utils/response');

/**
 * @description - Wallet controller class for handling wallet requests
 * @class WalletController
 */

class WalletController {
  /**
   * @description - This method is used to get all wallets
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @returns {object} - Returns an object
   * @memberof WalletController
   */

  static async getWallets(req, res) {
    try {
      const { user } = req;
      const result = await WalletService.getWallets(user);
      if (result.statusCode == 404)
        return errorResponse(res, result.statusCode, result.message);
      logger.info(
        `Wallets retrieved successfully for user: ${JSON.stringify(result)}`
      );
      return successResponse(
        res,
        200,
        'Wallets retrieved successfully',
        result
      );
    } catch (error) {
      logger.error(
        `Error in getting wallets: ${JSON.stringify(error.message)}`
      );
      return errorResponse(res, 500, 'Oops! Something went wrong');
    }
  }

  /**
   * @description - This method is used to get list of banks and code from paystack
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @returns {object} - Returns an object
   * @memberof WalletController
   */
  static async getBanks(req, res) {
    try {
      const result = await WalletService.getBanks();
      if (result.statusCode == 404)
        return errorResponse(res, result.statusCode, result.message);
      logger.info(`Banks retrieved successfully: ${JSON.stringify(result)}`);
      return successResponse(res, 200, 'Banks retrieved successfully', result);
    } catch (error) {
      logger.error(`Error in getting banks: ${JSON.stringify(error.message)}`);
      return errorResponse(res, 500, 'Oops! Something went wrong');
    }
  }
}

module.exports = WalletController;

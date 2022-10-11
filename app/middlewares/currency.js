const { errorResponse } = require('../utils/response');

/**
 * @description This middleware is used to validate all currency
 * @class Currency
 */

class Currency {
  /**
   * @description This method is used to check if a currency is valid
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {object} next - The next object
   * @returns {object} - Returns an object
   * @memberof Currency
   */
  static async checkCurrency(req, res, next) {
    const { currency } = req.body;
    const currencyList = ['NGN'];
    if (!currency) return errorResponse(res, 400, 'Currency is required');
    if (!currencyList.includes(currency))
      return errorResponse(res, 400, `Only ${currencyList} is allowed`);
    next();
  }
}

module.exports = Currency;

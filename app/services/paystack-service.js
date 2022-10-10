const { PAYSTACK_SECRET_KEY, PAYSTACK_PUBLIC_KEY } = require('../config/keys');
const axios = require('axios');

/**
 * @description This service handles all paystack related operations 😃
 * @class PaystackService
 */

class PaystackService {
  /**
   * @description This method is used to get list of banks and code from paystack
   * @returns {object} - Returns an object
   * @memberof PaystackService
   */
  static async getBanks() {
    const options = {
      method: 'GET',
      url: 'https://api.paystack.co/bank',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    try {
      const { data } = await axios(options);

      return data;
    } catch (error) {
      return {
        statusCode: 404,
        message: 'No banks found',
      };
    }
  }
}

module.exports = PaystackService;

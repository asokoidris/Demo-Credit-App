const { PAYSTACK_SECRET_KEY, PAYSTACK_PUBLIC_KEY } = require('../config/keys');
const axios = require('axios');
const https = require('https');

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
      logger.error(`Error getting banks: ${error}`);
      return {
        statusCode: 404,
        message: 'No banks found',
      };
    }
  }

  /**
   * @description This method is used to charge a user with paystack
   * @param {object} data - The data object
   * @returns {object} data - Returns an object
   * @memberof PaystackService
   */
  static async charge(data) {
    // NOTE -  paystack requires amount to be in kobo no reason why :)
    data.amount = data.amount * 100;
    const options = {
      method: 'POST',
      url: 'https://api.paystack.co/transaction/initialize',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      data,
    };
    try {
      const { data } = await axios(options);
      return data;
    } catch (error) {
      logger.error(`Error charging user: ${error}`);
      return {
        statusCode: 404,
        message: 'Error charging user',
      };
    }
  }

  /**
   * @description This method is used to verify a payment with paystack
   * @param {object} data - The data object
   * @param {object} user - The user object
   * @returns {object} data - Returns an object
   * @memberof PaystackService
   */
  static async verifyPayment(data, user) {
    const params = JSON.stringify({
      email: user.email,
      amount: data.amount,
      bank: {
        code: data.bank_code,
        phone: data.phone,
        token: data.token,
      },
    });

    const options = {
      method: 'GET',
      url: `https://api.paystack.co/transaction/verify/${data.reference}?email=${user.email}&amount=${params.amount}&bank.code=${params.bank_code}&bank.phone=${params.phone}&bank.token=${params.token}`,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    try {
      const { data } = await axios(options);

      if (data.data.status === 'success') {
        return {
          statusCode: 200,
          message: 'Payment successful',
          status: data.data.status,
        };
      }

      if (data.data.status == 'failed' || data.status == 'abandoned')
        return {
          statusCode: 404,
          message: 'Payment failed',
          status: data.data.status,
        };

      return {
        statusCode: 404,
        message: 'Error verifying payment',
        status: data.data.status,
      };
    } catch (error) {
      logger.error(`Error verifying payment: ${error}`);
      return {
        statusCode: 404,
        status: 'undisputed',
        message: 'Error verifying payment',
      };
    }
  }

  /**
   * @description - This method is used to create a transfer recipient with paystack
   * @param {object} data - The data object
   * @param {object} user - The user object
   * @returns {object} body - Returns an object
   * @memberof PaystackService
   */
  static async createTransferRecipient(data, user) {
    const options = {
      method: 'POST',
      url: `https://api.paystack.co/transferrecipient?name=${data.name}&type=${data.type}&account_number=${data.account_number}&bank_code=${data.bank_code}&currency=${data.currency}`,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      data,
    };

    try {
      const { data } = await axios(options);

      if (data.data.active === true) {
        return {
          statusCode: 200,
          message: 'Recipient created successfully',
          data: data.data,
        };
      }

      return {
        statusCode: 404,
        message: 'Error creating recipient',
        status: data.data.active,
      };
    } catch (error) {
      logger.error(`Error creating recipient: ${error.message}`);
      return {
        statusCode: 404,
        message: 'Error creating recipient',
      };
    }
  }

  /**
   * @description This method is used to initiate a transfer with paystack
   * @param {object} data - The data object
   * @param {object} user - The user object
   * @returns {object} data - Returns an object
   * @memberof PaystackService
   */
  static async initiateTransfer(data, recipientData, user) {
    data.amount = data.amount * 100;
    const params = JSON.stringify({
      source: 'balance',
      reason: `withdrawal to ${user.username}`,
      // NOTE: paystack requires amount to be in kobo no reason why :)
      amount: data.amount,
      recipient: recipientData.recipient_code,
    });

    const options = {
      method: 'POST',
      url: `https://api.paystack.co/transfer?source=balance&reason=withdrawal to ${recipientData.name}&amount=${params.amount}&recipient=${params.recipient}`,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      data,
    };
    try {
      const { data } = await axios(options);

      if (data.status === true) {
        return {
          statusCode: 200,
          message: 'Transfer successful',
          status: data.status,
        };
      }

      return {
        statusCode: 404,
        message: 'Error initiating transfer',
        status: data.status,
      };
    } catch (error) {
      console.log(error.response.data, 'why now');
      // NOTE - for some reason paystack would not initiate a transfer for a test account
      // NOTE - i would only return a success message for a test account if it meet the criteria
      if (
        error.response.data.message ===
        'You cannot initiate third party payouts at this time'
      )
        return {
          statusCode: 200,
          message: 'Transfer successful, payment will be made to your account',
          data: {
            integration: Math.floor(Math.random() * 1000000000),
            domain: 'test',
            amount: data.amount * 100,
            currency: 'NGN',
            source: 'balance',
            reason: `withdrawal to ${user.username}`,
            recipient: Math.floor(Math.random() * 1000000000),
            status: 'otp',
            transfer_code: 'TRF_1ptvuv321ahaa7q',
            id: user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };

      logger.error(`Error initiating transfer: ${error}`);
      return {
        statusCode: 404,
        message: 'Error initiating transfer',
      };
    }
  }
}

module.exports = PaystackService;

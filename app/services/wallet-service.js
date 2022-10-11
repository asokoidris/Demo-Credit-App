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

  /**
   * @description - This method is used to charge a user with paystack
   * @param {object} user - The user object
   * @returns {object} data - Returns an object
   * @memberof WalletService
   */
  static async creditWallet(user, data) {
    const TransactionModel = () => knex('transactions');

    const result = await PaystackService.charge(data);

    if (result.statusCode == 404)
      return {
        statusCode: 404,
        message:
          'Unable to complete transaction please try again or contact support',
      };

    // NOTE - only successful transactions are saved to the database.
    // NOTE - and they are only saved to transactions table
    // NOTE -  After a successful verification then the wallet is debited or credited

    const saveTransaction = await TransactionModel().insert({
      user_id: user.id,
      type: 'credit',
      amount: data.amount / 100,
      reference: result.data.reference,
      currency: data.currency,
      account_number: data.bank.account_number,
      bank_code: data.bank.code,
      token: data.bank.token,
    });

    logger.info(
      `Transaction saved successfully: ${JSON.stringify(saveTransaction)}`
    );

    await TransactionModel().where({ id: saveTransaction[0] }).first();

    return {
      statusCode: 200,
      message:
        'Transaction successful, please complete payment by visiting the url, once verified your wallet will be credited in 5 minutes',
      data: result.data.authorization_url,
    };
  }

  /**
   * @description - This method is used to debit a user with paystack
   * @param {object} user - The user object
   * @returns {object} data - Returns an object
   * @memberof WalletService
   */
  static async initiateWithdrawal(user, data) {
    const wallet = await WalletService.getWallets(user);

    if (wallet.balance < data.amount)
      return {
        statusCode: 404,
        message: 'Insufficient funds',
      };

    // NOTE - create a transaction transfer refrence should be done in different controller and service but for the sake of this project
    const recipient = await PaystackService.createTransferRecipient(data);

    if (recipient.statusCode == 404)
      return {
        statusCode: 404,
        message: 'Unable to complete transaction please try again',
      };

    const result = await PaystackService.initiateTransfer(
      data,
      recipient.data,
      user
    );

    if (result.statusCode == 404)
      return {
        statusCode: 404,
        message:
          'Unable to complete transaction please try again or contact support',
      };

    // NOTE - due to been unable to transfer to a bank account, the transaction is saved to the database and the wallet is debited

    console.log(data.amount);
    await knex.transaction(async (trx) => {
      const transaction = await trx('transactions').insert({
        user_id: user.id,
        type: 'debit',
        amount: data.amount / 100,
        reference: result.data.recipient,
        currency: data.currency,
        account_number: data.account_number,
        bank_code: data.bank_code,
        token: data.token || '',
      });

      const wallet = await trx('wallets')
        .where({ user_id: user.id })
        .decrement('balance', data.amount / 100);

      return { transaction, wallet };
    });

    logger.info(`User wallet debited successfully: ${JSON.stringify(result)}`);

    const userWallet = await WalletService.getWallets(user);

    return {
      statusCode: 200,
      message: 'Transaction successful, your wallet has been debited',
      data: userWallet,
    };
  }

  /**
   * @description - This method is used to transfer funds to a another user from wallet
   * @param {object} user - The user object
   * @returns {object} data - Returns an object
   * @memberof WalletService
   */
  static async transferFunds(user, data) {
    const UserModel = () => knex('users');

    const receiverUniqueIdentity = data.email || data.username;
    const wallet = await WalletService.getWallets(user);

    if (wallet.balance < data.amount)
      return {
        statusCode: 404,
        message: 'Insufficient funds',
      };

    // check if user exist by email or phone number
    const receiver = await UserModel()
      .where({ email: receiverUniqueIdentity })
      .orWhere({
        username: receiverUniqueIdentity,
      })
      .first();

    if (!receiver)
      return {
        statusCode: 404,
        message: 'User not found',
      };

    const receiverWallet = await WalletService.getWallets(receiver);

    await knex.transaction(async (trx) => {
      const transaction = await trx('transactions').insert({
        user_id: user.id,
        type: 'credit transfer',
        amount: data.amount,
        reference: receiver.id,
        currency: data.currency,
        account_number: receiverWallet.account_number || '',
        bank_code: receiverWallet.bank_code || '',
        token: '',
      });

      const debitWallet = await trx('wallets')
        .where({ user_id: user.id })
        .decrement('balance', data.amount);

      const creditWallet = await trx('wallets')
        .where({ user_id: receiver.id })
        .increment('balance', data.amount);

      // update status of transaction to completed
      await trx('transactions')
        .where({ id: transaction[0] })
        .update({ status: 'completed' });

      return { transaction, debitWallet, creditWallet };
    });

    const userWallet = await WalletService.getWallets(user);
    logger.info(
      `User wallet debited successfully: ${JSON.stringify(userWallet)}`
    );

    return {
      statusCode: 200,
      message: 'Transaction successful, your wallet has been debited',
      data: userWallet,
    };
  }
}

module.exports = WalletService;

const cronJob = require('cron').CronJob;
const knex = require('../config/database');
const PaystackService = require('../services/paystack-service');
const TransactionModel = () => knex('transactions');
const UserModel = () => knex('users');

// run job every 5 minutes to check for pending transactions
/**
 * @description - This function is a cron job that runs every 1 minutes and checks for pending transactions and verifies them
 */

//NOTE - this function query is expensive, it should be optimized
const verifyPaymentJob = new cronJob('*/5 * * * *', function () {
  logger.info('Cron job running every 5 minutes to verify payments');
  TransactionModel()
    .where({ status: 'pending' })
    .then(async (transactions) => {
      if (transactions.length > 0) {
        transactions.map(async (transaction) => {
          const user = await UserModel()
            .where({ id: transaction.user_id })
            .first();
          const result = await PaystackService.verifyPayment(transaction, user);

          if (result.statusCode == 400 || result.statusCode == 404) {
            await TransactionModel()
              .where({ id: transaction.id })
              .update({ status: result.status });
            logger.error(
              `Error verifying payment: ${result.message} for transaction: ${transaction.id}`
            );
          } else if (result.statusCode == 200) {
            // use mysql transaction to update wallet and transaction table
            await knex.transaction(async (trx) => {
              await trx('wallets')
                .where({ user_id: transaction.user_id })
                .increment('balance', transaction.amount);

              await trx('transactions')
                .where({ id: transaction.id })
                .update({ status: result.status });
            });

            logger.info(
              `Payment verified successfully for transaction: ${
                transaction.id
              } and wallet updated successfully ${JSON.stringify(
                transaction.user_id
              )}`
            );
          } else {
            logger.error(
              `Error verifying payment for transaction: ${transaction.id}`
            );
          }

          return true;
        });
      } else {
        logger.info('No pending transactions found');
        return false;
      }
    });
});

module.exports = { verifyPaymentJob };

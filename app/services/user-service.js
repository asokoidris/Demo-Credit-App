// const UserSchema = require('../models/users');
const knex = require('../config/database');
const HelperFunctions = require('../utils/helper-functions');
const Token = require('../utils/token');

/**
 * @description - User service class for business logic
 * @class UserService
 */

class UserService {
  /**
   * @description - This method is used to create a user
   * @param {object} body - The request body
   * @returns {object} - Returns an object
   * @memberof UserService
   */
  static async createUser(body) {
    const { username, email, password } = body;

    const UserModel = () => knex('users');
    const WalletModel = () => knex('wallets');

    const user = await UserModel()
      .where({ email })
      .orWhere({ username })
      .first();

    if (user) {
      logger.error(`User already exists with email: ${email}`);
      return {
        statusCode: 409,
        message: 'User already exists',
      };
    }
    const hashedPassword = HelperFunctions.hashPassword(password);

    // insert user into database and return user
    const createNewUser = await UserModel().insert({
      username,
      email,
      password: hashedPassword,
    });

    // create a wallet for the user
    await WalletModel().insert({
      name: 'Main_Wallet',
      currency: 'NGN',
      balance: 0,
      user_id: createNewUser[0],
    });

    const newUser = await UserModel().where({ id: createNewUser[0] }).first();

    delete newUser.password;

    logger.info(`User created with email: ${email}`);
    return {
      statusCode: 201,
      message: 'User created successfully',
      data: newUser,
    };
  }

  /**
   * @description - This method is used to login a user
   * @param {object} body - The request body
   * @returns {object} - Returns an object
   * @memberof UserService
   */
  static async loginUser(body) {
    try {
      const { email, username, password } = body;

      const emailOrUsername = email || username;

      const UserModel = () => knex('users');

      const user = await UserModel()
        .where({ email: emailOrUsername })
        .orWhere({ username: emailOrUsername })
        .first();

      if (!user) {
        logger.error(`User does not exist with email: ${email}`);
        return {
          statusCode: 401,
          message: 'Invalid credentials',
        };
      }

      const isPasswordValid = HelperFunctions.comparePassword(
        password,
        user.password
      );

      if (!isPasswordValid) {
        logger.error(`Invalid password for email: ${email}`);
        return {
          statusCode: 401,
          message: 'Invalid credentials',
        };
      }

      const token = Token.generateToken(user);

      delete user.password;

      logger.info(`User logged in with email: ${email}`);
      return {
        statusCode: 200,
        message: 'User logged in successfully',
        data: {
          user,
          token,
        },
      };
    } catch (error) {
      logger.error(
        `Error in logging in user: ${JSON.stringify(error.message)}`
      );
      return {
        statusCode: 500,
        message: 'Oops! Something went wrong',
      };
    }
  }
}

module.exports = UserService;

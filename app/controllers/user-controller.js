const UserService = require('../services/user-service');
const { errorResponse, successResponse } = require('../utils/response');

/**
 * @description - User controller class for handling user requests
 * @class UserController
 */
class UserController {
  /**
   * @description - This method is used to create a user
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @returns {object} - Returns an object
   * @memberof UserController
   */
  static async createUser(req, res) {
    try {
      const { body } = req;
      const result = await UserService.createUser(body);
      if (result.statusCode == 409)
        return errorResponse(res, result.statusCode, result.message);
      logger.info(
        `User created successfully with email: ${JSON.stringify(result)}`
      );
      return successResponse(res, 201, 'User created successfully', result);
    } catch (err) {
      logger.error(`Error in creating user: ${JSON.stringify(err.message)}`);
      return errorResponse(res, 500, 'Oops! Something went wrong');
    }
  }

  /**
   * @description - This method is used to login a user
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @returns {object} - Returns an object
   * @memberof UserController
   */
  static async loginUser(req, res) {
    try {
      const { body } = req;
      const result = await UserService.loginUser(body);
      if (result.statusCode == 401)
        return errorResponse(res, result.statusCode, result.message);
      logger.info(
        `User logged in successfully with email: ${JSON.stringify(result)}`
      );
      return successResponse(res, 200, 'User logged in successfully', result);
    } catch (err) {
      logger.error(`Error in logging in user: ${JSON.stringify(err.message)}`);
      return errorResponse(res, 500, 'Oops! Something went wrong');
    }
  }
}

module.exports = UserController;

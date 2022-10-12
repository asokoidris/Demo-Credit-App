const { errorResponse } = require('../utils/response');
const { verifyToken } = require('../utils/token');
const knex = require('../config/database');

/**
 * @description -This class is used to handle all authentication
 * @class Authentication
 */

class Authentication {
  /**
   * @description - This method is used to check if a user is authenticated
   * @param {object} req - The request object
   * @param {object} res - The response object
   * @param {object} next - The next object
   * @returns {object} - Returns an object
   * @memberof Authentication
   */
  static async checkUserAuthentication(req, res, next) {
    try {
      const { authorization } = req.headers;
      if (!authorization) return errorResponse(res, 401, 'Unauthorized');

      const decoded = await verifyToken(authorization);

      const user = await knex('users')
        .where({ id: decoded.subject })
        .orWhere({ email: decoded.email })
        .first();
      if (!user) return errorResponse(res, 401, 'Unauthorized');

      req.user = user;
      next();
    } catch (error) {
      return errorResponse(res, 400, 'Unauthorized');
    }
  }
}

module.exports = Authentication;

const bcrypt = require('bcryptjs');

/**
 * @description - This is a class that contains helper functions used across the application.
 */

class HelperFunctions {
  /**
   * @description - This method is used to hash a password
   * @param {string} password - The password to be hashed
   * @returns {string} - Returns a string
   * @memberof HelperFunctions
   */

  static hashPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  }

  /**
   * @description - This method is used to compare a password
   * @param {string} password - The password to be compared
   * @param {string} hashedPassword - The hashed password to be compared with
   * @returns {string} - Returns a string
   * @memberof HelperFunctions
   */
  static comparePassword(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
  }
}

module.exports = HelperFunctions;

const express = require('express');
const router = express.Router();
const {
  createUserSchema,
  loginUserSchema,
} = require('../validation/schema/user-schema');
const { validate } = require('../validation/validatorClass');
const UserController = require('../controllers/user-controller');

router.post('/register', validate(createUserSchema), UserController.createUser);

router.post('/login', validate(loginUserSchema), UserController.loginUser);

module.exports = router;

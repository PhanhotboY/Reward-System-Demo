const express = require('express');
const loginRouter = express.Router();

const loginController = require('../controllers/login.controller');

loginRouter.get('/', loginController.dashboard);

module.exports = loginRouter;

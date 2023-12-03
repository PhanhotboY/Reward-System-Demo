const express = require('express');
const testRouter = express.Router();

const testController = require('../controllers/test.controller');

testRouter.post('/reset-token', testController.resetToken);

module.exports = testRouter;

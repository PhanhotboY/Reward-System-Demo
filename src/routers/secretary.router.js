const express = require('express');
const secretaryRouter = express.Router();

const secretaryController = require('../controllers/secretary.controller');

secretaryRouter.put('/token-balance/:address', secretaryController.updateTokenBalance);

secretaryRouter.get('/requests/:requestId', secretaryController.getRequest);
secretaryRouter.get('/requests', secretaryController.getRequestList);

secretaryRouter.get('/achievements', secretaryController.getAchievementList);
secretaryRouter.get('/employees', secretaryController.getEmployeeList);

secretaryRouter.post('/redeem', secretaryController.processRedeemRequest);
secretaryRouter.post('/balance', secretaryController.updateTokenBalance);

secretaryRouter.get('/', (req, res) => res.redirect('/secretary/requests'));

module.exports = secretaryRouter;

const express = require('express');
const employeeRouter = express.Router();

const employeeController = require('../controllers/employee.controller');

employeeRouter.use('/:employeeId/*', employeeController.refreshBalance);

employeeRouter.post('/redeem', employeeController.requestRedeemSwag);

employeeRouter.get('/:employeeId/achievements/:achievementId', employeeController.getAchievement);
employeeRouter.get('/:employeeId/achievements', employeeController.getAchievementList);
employeeRouter.get('/:employeeId/employees', employeeController.getEmployeeList);
employeeRouter.get('/:employeeId/requests/:requestId', employeeController.getRequest);
employeeRouter.get('/:employeeId/requests', employeeController.getRequestList);
employeeRouter.get('/:employeeId/swags/:swagId', employeeController.getSwag);
employeeRouter.get('/:employeeId/swags', employeeController.getSwagList);
employeeRouter.get('/:employeeId/balance/', employeeController.getBalance);

employeeRouter.get('/', (req, res) => res.redirect('/employee/102/requests'));

module.exports = employeeRouter;

const express = require('express');
const adminRouter = express.Router();

const adminController = require('../controllers/admin.controller');

adminRouter.post('/achievements', adminController.addAchievement);

adminRouter.get('/achievements/add', adminController.addAchievementForm);
adminRouter.get('/achievements', adminController.getAchievementList);

adminRouter.get('/swags/add', adminController.addSwagForm);
adminRouter.get('/swags', adminController.getSwagList);
adminRouter.post('/swags', adminController.addSwag);

adminRouter.post('/issue-token', adminController.issueToken);
adminRouter.get('/issue-token', adminController.issueTokenForm);

adminRouter.get('/', (req, res) => res.redirect('/admin/achievements'));

module.exports = adminRouter;

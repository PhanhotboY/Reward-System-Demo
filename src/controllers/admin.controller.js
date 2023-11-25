const {
  getAchievements,
  addAchievement,
  getSwagList,
  addSwag,
  getEmployeeList,
} = require('../utils/database');

const adminController = {
  async getAchievementList(req, res) {
    const achievementList = await getAchievements();

    return res.render('admin/list', { data: achievementList, type: 'achievements', balance: {} });
  },

  async addAchievement(req, res) {
    const { name, value } = req.body;

    await addAchievement({ name, value });

    return res.redirect('/admin/achievements');
  },

  async addAchievementForm(req, res) {
    return res.render('admin/form', { type: 'achievements', balance: {} });
  },

  async addSwagForm(req, res) {
    return res.render('admin/form', { type: 'swags', balance: {} });
  },

  async getSwagList(req, res) {
    const swagList = await getSwagList();

    return res.render('admin/list', { data: swagList, type: 'swags', balance: {} });
  },

  async addSwag(req, res) {
    const { name, value } = req.body;

    await addSwag({ name, value });

    return res.redirect('/admin/swags');
  },

  async issueTokenForm(req, res) {
    const employeeList = await getEmployeeList();

    return res.render('admin/form', { type: 'issue token', employeeList, balance: {} });
  },

  async issueToken(req, res) {
    const { address, amount, type } = req.body;

    const tokenOperator = await TokenOperator(process.env.TOKEN_OPERATOR_ADDRESS);

    if (type === 'reward') {
      await tokenOperator.issueRewardToken(address, amount);
    } else if (type === 'penalty') {
      await tokenOperator.issuePenaltyToken(address, amount);
    } else if (type === 'reputation') {
      await tokenOperator.issueReputationToken(address, amount);
    }

    return res.redirect('/admin/issue-token');
  },
};

module.exports = adminController;

const { formatEther, getAddress } = require('ethers');

const { TokenOperator } = require('../contracts');
const {
  getUserByAddress,
  updateTokenBalance,
  completeRedeemRequest,
  getActiveRedeemRequestList,
  getAchievements,
  getEmployeeList,
} = require('../utils/database');

const secretaryController = {
  async getEmployeeList(req, res) {
    const employeeList = await getEmployeeList();

    res.render('secretary/list', { data: employeeList, type: 'employees', balance: {} });
  },

  async updateTokenBalance(req, res) {
    const employeeList = await getEmployeeList();
    const tokenOperator = await TokenOperator(process.env.TOKEN_OPERATOR_ADDRESS);

    const balanceList = await Promise.all(
      employeeList.map(async (emp) => tokenOperator.balance(getAddress(emp.address.toLowerCase())))
    );

    await Promise.all(
      employeeList.map(async (emp, index) =>
        updateTokenBalance({
          userId: emp.id,
          balance: {
            rewardToken: formatEther(balanceList[index][0] || 0),
            penaltyToken: formatEther(balanceList[index][1] || 0),
            reputationToken: formatEther(balanceList[index][2] || 0),
          },
        })
      )
    );

    res.redirect('/secretary/employees');
  },

  async processRedeemRequest(req, res) {
    const { requestId } = req.body;

    await completeRedeemRequest(requestId, true);

    return res.redirect('/secretary/requests');
  },

  async getRequestList(req, res) {
    const requestList = await getActiveRedeemRequestList();

    return res.render('secretary/list', { data: requestList, type: 'requests', balance: {} });
  },

  async getRequest(req, res) {},

  async getAchievementList(req, res) {
    const achievementList = await getAchievements();

    return res.render('secretary/list', {
      data: achievementList,
      type: 'achievements',
      balance: {},
    });
  },
};

module.exports = secretaryController;

const { formatEther, getAddress } = require('ethers');
const { RewardToken, PenaltyToken, ReputationToken } = require('../contracts');

const {
  getSwagList,
  getEmployeeList,
  getAchievements,
  getRequestsListForEmployee,
  getUserByAddress,
  getUserById,
  getSwagById,
  addRedeemRequest,
} = require('../utils/database');

const apiUrl = process.env.API_URL || 'http://localhost:3000';

const employeeController = {
  async getBalance(req, res) {
    const { balance } = req.user;

    return res.json(balance);
  },

  async requestRedeemSwag(req, res) {
    const { employeeId, swagId } = req.body;

    const employee = await getUserById(employeeId);

    await fetch(`${apiUrl}/employee/${getAddress(employee.address.toLowerCase())}/balance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then(async (balance) => {
        const { rewardToken, penaltyToken } = balance;
        const tokenBalance = rewardToken - penaltyToken;

        if (tokenBalance <= 0) {
          return res.json({
            message: 'Not enough tokens to redeem swag',
          });
        }

        // fetch swag from database
        const swag = await getSwagById(swagId);
        if (!swag) throw new Error('Swag does not exists');

        // compare tokenBalance with swag price
        if (tokenBalance < swag.value) throw new Error('Insufficient balance');

        // emit swag redeeming request
        await addRedeemRequest({ employeeId, swagId });

        return res.redirect('/employee');
      })
      .catch((err) => {
        throw new Error(err);
      });
  },

  async getRequestList(req, res) {
    const requestList = await getRequestsListForEmployee(req.params.employeeId);

    res.render('employee/list', {
      data: requestList,
      type: 'requests',
      balance: req.user.balance,
    });
  },

  async getRequest(req, res) {},

  async getSwagList(req, res) {
    const swagList = await getSwagList();

    res.render('employee/list', {
      data: swagList,
      type: 'swags',
      employeeId: req.params.employeeId,
      balance: req.user.balance,
    });
  },

  async getSwag(req, res) {},

  async getAchievementList(req, res) {
    const achievementList = await getAchievements();

    res.render('employee/list', {
      data: achievementList,
      type: 'achievements',
      balance: req.user.balance,
    });
  },

  async getAchievement(req, res) {},

  async getEmployeeList(req, res) {
    const employeeList = await getEmployeeList();

    res.render('employee/list', {
      data: employeeList,
      type: 'employees',
      balance: req.user.balance,
    });
  },

  async refreshBalance(req, res, next) {
    const { employeeId } = req.params;

    const employee = await getUserById(employeeId);
    console.log(employee);
    req.user = {
      balance: {
        rewardToken: formatEther(employee.reward_token || 0),
        penaltyToken: formatEther(employee.penalty_token || 0),
        reputationToken: formatEther(employee.reputation_token || 0),
      },
    };
    console.log(req.user);
    next('route');
  },
};

module.exports = employeeController;

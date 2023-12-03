const { getAddress, parseEther } = require('ethers');
const { TokenOperator } = require('../contracts');
const { getEmployeeList } = require('../utils/database');

const testController = {
  async resetToken(req, res) {
    const tokenOperator = await TokenOperator(process.env.DEFAULT_DEPLOYER_ADDRESS);
    const employeeList = await getEmployeeList();

    const employeeAddressList = employeeList.map((emp) => getAddress(emp.address.toLowerCase()));
    const amountList = employeeList.map((emp) => parseEther('10000'));

    await tokenOperator.batchMintPenalties(employeeAddressList, amountList);
    await tokenOperator.batchBurnAllTokens(employeeAddressList);

    const balance = await tokenOperator.balance(employeeAddressList[0]);

    return res.json({ success: true });
  },
};

module.exports = testController;

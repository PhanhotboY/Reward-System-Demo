const { formatEther, getAddress } = require('ethers');

const loginController = {
  async dashboard(req, res) {
    res.render('login');
  },
};

module.exports = loginController;

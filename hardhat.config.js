require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-ethers');
require('hardhat-deploy-ethers');
require('hardhat-deploy');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.20',
  defaultNetwork: 'hardhat',
  networks: {
    localhost: {
      url: 'HTTP://172.31.0.1:7545',
      chainId: 1337,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};

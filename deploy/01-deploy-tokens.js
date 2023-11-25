const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

module.exports = async ({ deployments, getNamedAccounts, ethers }) => {
  const { deployer } = await getNamedAccounts();

  const tokenOperator = await deployments.deploy('TokenOperator', {
    from: deployer,
    log: true,
    autoMine: true,
    gasLimit: 3e7,
  });

  const rewardToken = await deployments.deploy('RewardToken', {
    from: deployer,
    args: [tokenOperator.address],
    log: true,
    autoMine: true,
    gasLimit: 3e7,
  });

  const penaltyToken = await deployments.deploy('PenaltyToken', {
    from: deployer,
    args: [tokenOperator.address],
    log: true,
    autoMine: true,
    gasLimit: 3e7,
  });

  const reputationToken = await deployments.deploy('ReputationToken', {
    from: deployer,
    args: [tokenOperator.address],
    log: true,
    autoMine: true,
    gasLimit: 3e7,
  });

  const tokenOperatorContract = await ethers.getContract('TokenOperator', deployer);
  await tokenOperatorContract.registerTokens(
    rewardToken.address,
    penaltyToken.address,
    reputationToken.address
  );

  const env = readFileSync(path.join(__dirname, '../.env'), 'utf8');
  console.log(env);

  const newEnv = env
    .replace(
      /REWARD_TOKEN_ADDRESS=0x[0-9a-fA-F]{40}/g,
      `REWARD_TOKEN_ADDRESS=${rewardToken.address}`
    )
    .replace(
      /PENALTY_TOKEN_ADDRESS=0x[0-9a-fA-F]{40}/g,
      `PENALTY_TOKEN_ADDRESS=${penaltyToken.address}`
    )
    .replace(
      /REPUTATION_TOKEN_ADDRESS=0x[0-9a-fA-F]{40}/g,
      `REPUTATION_TOKEN_ADDRESS=${reputationToken.address}`
    )
    .replace(
      /TOKEN_OPERATOR_ADDRESS=0x[0-9a-fA-F]{40}/g,
      `TOKEN_OPERATOR_ADDRESS=${tokenOperator.address}`
    );

  writeFileSync(path.join(__dirname, '../.env'), newEnv);
};

module.exports.tags = ['all', 'rewardToken'];

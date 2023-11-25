const { Contract, JsonRpcProvider } = require('ethers');
const { ethers } = require('hardhat');

const rewardTokenJson = require('../../artifacts/contracts/RewardToken.sol/RewardToken.json');
const penaltyTokenJson = require('../../artifacts/contracts/PenaltyToken.sol/PenaltyToken.json');
const reputationTokenJson = require('../../artifacts/contracts/ReputationToken.sol/ReputationToken.json');
const tokenOperator = require('../../artifacts/contracts/TokenOperator.sol/TokenOperator.json');

const contractJson = {
  RewardToken: rewardTokenJson,
  PenaltyToken: penaltyTokenJson,
  ReputationToken: reputationTokenJson,
  TokenOperator: tokenOperator,
};

const contractAddress = {
  RewardToken: process.env.REWARD_TOKEN_ADDRESS,
  PenaltyToken: process.env.PENALTY_TOKEN_ADDRESS,
  ReputationToken: process.env.REPUTATION_TOKEN_ADDRESS,
  TokenOperator: process.env.TOKEN_OPERATOR_ADDRESS,
};

const provider = new JsonRpcProvider(process.env.JSON_RPC_URL || 'http://172.31.0.1:7545');

async function getContract(name, address) {
  const runner = await provider
    .getSigner(address)
    .then((signer) => signer)
    .catch(() => provider.getSigner(process.env.DEFAULT_RUNNER_ADDRESS || 0));

  return new Contract(contractAddress[name], contractJson[name].abi, runner);
}

module.exports = {
  RewardToken: (address) => getContract('RewardToken', address),
  PenaltyToken: (address) => getContract('PenaltyToken', address),
  ReputationToken: (address) => getContract('ReputationToken', address),
  TokenOperator: (address) => getContract('TokenOperator', address),
  provider,
};

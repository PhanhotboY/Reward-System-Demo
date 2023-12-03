require('dotenv').config();

const { formatEther } = require('ethers');
const { provider, RewardToken, PenaltyToken, ReputationToken } = require('./contracts');
const { addUser, deleteAllEmployees, updateTokenBalance } = require('./utils/database');

async function main() {
  await deleteAllEmployees();
  const accounts = await provider.listAccounts();
  const rewardToken = await RewardToken(accounts[0]);
  const penaltyToken = await PenaltyToken(accounts[0]);
  const reputationToken = await ReputationToken(accounts[0]);

  async function getBalance(user) {
    return {
      rewardToken: formatEther((await rewardToken.balanceOf(user)) || 0),
      penaltyToken: formatEther((await penaltyToken.balanceOf(user)) || 0),
      reputationToken: formatEther((await reputationToken.balanceOf(user)) || 0),
    };
  }

  for (let index in accounts) {
    const acc = accounts[index];

    if (![0, 1].includes(+index)) {
      await addUser({
        id: +index + 100,
        username: `employee${index}`,
        password: 'password',
        address: acc.address,
        role: 'employee',
      });

      await updateTokenBalance({
        userId: +index + 100,
        balance: await getBalance(acc.address),
      });
    }
  }
}

main()
  .then(() => {
    console.log('Done refreshing users!');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

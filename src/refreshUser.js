require('dotenv').config();

const { provider } = require('./contracts');
const { addUser, deleteAllEmployees } = require('./utils/database');

async function main() {
  await deleteAllEmployees();
  const accounts = await provider.listAccounts();

  for (let index in accounts) {
    const acc = accounts[index];

    await addUser({
      id: +index + 100,
      username: `employee${index}`,
      password: 'password',
      address: acc.address,
      role: 'employee',
    });
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

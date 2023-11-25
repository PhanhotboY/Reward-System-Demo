require('dotenv').config();
const { ping } = require('../src/utils/database');

async function main() {
  return await ping();
}

main()
  .then(() => {
    console.log('Database connection is good!');
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

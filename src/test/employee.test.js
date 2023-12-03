require('dotenv').config();
const assert = require('assert');
const { formatEther, getAddress } = require('ethers');
const req = require('supertest');
const request = req(process.env.API_URL);

const { TokenOperator, provider } = require('../contracts');
const {
  getUserByUsername,
  deleteAllEmployees,
  addUser,
  updateTokenBalance,
  ping,
  closePool,
  getRequestsListForEmployee,
  getEmployeeList,
  findSwagByName,
} = require('../utils/database');

before(async function () {
  this.timeout(0);
  await ping().then(() => console.log('Database is connected!'));
  await deleteAllEmployees();
  const accounts = await provider.listAccounts();
  const tokenOperator = await TokenOperator(process.env.DEFAULT_DEPLOYER_ADDRESS);

  async function getBalance(user) {
    const balance = await tokenOperator.balance(getAddress(user.toLowerCase()));
    return {
      rewardToken: formatEther(balance[0] || 0),
      penaltyToken: formatEther(balance[1] || 0),
      reputationToken: formatEther(balance[2] || 0),
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
    }
  }
  await request.post('/test/reset-token').expect(200);
  for (let index in accounts) {
    const acc = accounts[index];

    if (![0, 1].includes(+index)) {
      await updateTokenBalance({
        userId: +index + 100,
        balance: await getBalance(acc.address),
      });
    }
  }
  console.log('Done refreshing users!');
  return Promise.resolve();
});

describe('Initiate', function () {
  describe('#employee token balance', function () {
    it('should be 0 for all 3 types of token', async function () {
      const employeeList = await getEmployeeList();

      const tokenOperator = await TokenOperator(process.env.DEFAULT_DEPLOYER_ADDRESS);

      for (let employee of employeeList) {
        const balance = await tokenOperator.balance(getAddress(employee.address));

        assert.equal(formatEther(balance[0]), 0);
        assert.equal(formatEther(balance[1]), 0);
        assert.equal(formatEther(balance[2]), 0);
      }
    });
  });
});

describe('Employee', function () {
  let tokenOperator, employee2, employee3, employee4;

  before(async function () {
    tokenOperator = await TokenOperator(process.env.DEFAULT_DEPLOYER_ADDRESS);
    employee2 = await getUserByUsername('employee2');
    employee3 = await getUserByUsername('employee3');
    employee4 = await getUserByUsername('employee4');
  });

  describe('Employee2', function () {
    describe('#achieve achievement, be rewarded 100 RWT', function () {
      it('should have 100 RWT, 0 PET, 100 REP in balance', function (done) {
        this.timeout(0);
        request
          .post('/secretary/issue-token')
          .send({ employeeId: employee2.id, tokenType: 'rewardToken', amount: 100 })
          .expect(302)
          .end(async function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }

            await assertBalance(employee2.address, 100, 0, 100);
            done();
          });
      });
    });

    describe('#violation of rules, fined 50 PET', function () {
      it('should have 100 RWT, 50 PET, 50 REP in balance', function (done) {
        this.timeout(0);
        request
          .post('/secretary/issue-token')
          .send({ employeeId: employee2.id, tokenType: 'penaltyToken', amount: 50 })
          .expect(302)
          .end(async function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }

            await assertBalance(employee2.address, 100, 50, 50);
            done();
          });
      });
    });

    describe('#request redeem swag with 80 RWT', function () {
      it('should have 100 RWT, 50 PET, 50 REP in balance', async function () {
        await request.post('/admin/swags').send({ name: 'swag1', value: 80 }).expect(302);
        const swag = await findSwagByName('swag1');

        request
          .post('/employee/redeem')
          .send({ employeeId: employee2.id, swagId: swag.id })
          .expect(302)
          .end(async function (err, res) {
            if (err) {
              console.log(err);
              throw err;
            }

            await assertBalance(employee2.address, 100, 50, 50);
            return Promise.resolve();
          });
      });
    });

    describe('#redeem request is denied', function () {
      it('should have 100 RWT, 50 PET, 50 REP in balance', async function () {
        const requests = await getRequestsListForEmployee(employee2.id);

        request
          .post('/secretary/redeem')
          .send({ requestId: requests[0].id })
          .expect(302)
          .end(async function (err, res) {
            if (err) {
              console.log(err);
              throw err;
            }

            await assertBalance(employee2.address, 100, 50, 50);
            return Promise.resolve();
          });
      });
    });
  });

  describe('Employee3', function () {
    describe('#violation of rules, fined 60 PET', function () {
      it('should have 0 RWT, 60 PET, 0 REP in balance', function (done) {
        this.timeout(0);
        request
          .post('/secretary/issue-token')
          .send({ employeeId: employee3.id, tokenType: 'penaltyToken', amount: 60 })
          .expect(302)
          .end(async function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }

            await assertBalance(employee3.address, 0, 60, 0);
            done();
          });
      });
    });

    describe('#achieve achievement, be rewarded 70 RWT', function () {
      it('should have 70 RWT, 60 PET, 70 REP in balance', function (done) {
        this.timeout(0);
        request
          .post('/secretary/issue-token')
          .send({ employeeId: employee3.id, tokenType: 'rewardToken', amount: 70 })
          .expect(302)
          .end(async function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }

            await assertBalance(employee3.address, 70, 60, 70);
            done();
          });
      });
    });
  });

  describe('Employee4', function () {
    describe('#achieve achievement, be rewarded 80 RWT', function () {
      it('should have 80 RWT, 0 PET, 80 REP in balance', function (done) {
        this.timeout(0);
        request
          .post('/secretary/issue-token')
          .send({ employeeId: employee4.id, tokenType: 'rewardToken', amount: 80 })
          .expect(302)
          .end(async function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }

            await assertBalance(employee4.address, 80, 0, 80);
            done();
          });
      });
    });

    describe('#violation of rules, fined 100 PET', function () {
      it('should have 80 RWT, 100 PET, 0 REP in balance', function (done) {
        this.timeout(0);
        request
          .post('/secretary/issue-token')
          .send({ employeeId: employee4.id, tokenType: 'penaltyToken', amount: 100 })
          .expect(302)
          .end(async function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }

            await assertBalance(employee4.address, 80, 100, 0);
            done();
          });
      });
    });

    describe('#achieve achievement, be rewarded 200 RWT', function () {
      it('should have 280 RWT, 100 PET, 200 REP in balance', function (done) {
        this.timeout(0);
        request
          .post('/secretary/issue-token')
          .send({ employeeId: employee4.id, tokenType: 'rewardToken', amount: 200 })
          .expect(302)
          .end(async function (err, res) {
            if (err) {
              console.log(err);
              return done(err);
            }

            await assertBalance(employee4.address, 280, 100, 200);
            done();
          });
      });
    });

    describe('#request redeem swag with 100 RWT', function () {
      it('should have 280 RWT, 100 PET, 200 REP in balance', async function () {
        await request.post('/admin/swags').send({ name: 'swag2', value: 100 }).expect(302);
        const swag = await findSwagByName('swag2');

        request
          .post('/employee/redeem')
          .send({ employeeId: employee4.id, swagId: swag.id })
          .expect(302)
          .end(async function (err, res) {
            if (err) {
              console.log(err);
              throw err;
            }

            await assertBalance(employee4.address, 280, 100, 200);
            return Promise.resolve();
          });
      });
    });

    describe('#redeem request is approved', function () {
      it('should have 180 RWT, 100 PET, 200 REP in balance', async function () {
        const requests = await getRequestsListForEmployee(employee4.id);

        request
          .post('/secretary/redeem')
          .send({ requestId: requests[0].id })
          .expect(302)
          .end(async function (err, res) {
            if (err) {
              console.log(err);
              throw err;
            }

            await assertBalance(employee4.address, 180, 100, 200);
            return Promise.resolve();
          });
      });
    });
  });

  async function assertBalance(address, rewardToken, penaltyToken, reputationToken) {
    const balance = await tokenOperator.balance(address);

    assert.equal(formatEther(balance[0]), rewardToken);
    assert.equal(formatEther(balance[1]), penaltyToken);
    assert.equal(formatEther(balance[2]), reputationToken);
  }
});

describe('Renewal', function () {
  describe('#employee token balance', function () {
    it('should be 0 for RWT and PET, be kept intact for REP', async function () {
      request
        .post('/secretary/renewal')
        .expect(302)
        .end(async function (err, res) {
          if (err) {
            console.log(err);
            throw err;
          }
          const employeeList = await getEmployeeList();
          const tokenOperator = await TokenOperator(process.env.DEFAULT_DEPLOYER_ADDRESS);

          for (let employee of employeeList) {
            const balance = await tokenOperator.balance(getAddress(employee.address));

            assert.equal(formatEther(balance[0]), 0);
            assert.equal(formatEther(balance[1]), 0);
            assert.equal(formatEther(balance[2]), employee.reputation_token);
          }
          return Promise.resolve();
        });
    });
  });
});

after(function () {
  return closePool();
});

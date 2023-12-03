const pg = require('pg');

const pool = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT) || 5432,
});

async function ping() {
  const result = await pool.query('SELECT CURRENT_TIMESTAMP');
  return result;
}

function returnSingle(result) {
  if (result.rowCount > 0) return result.rows[0];
  else return null;
}

function returnMany(result) {
  return result.rows || [];
}

async function getUserById(userId) {
  let result = await pool.query(
    'SELECT id, user_name, address, reward_token, penalty_token, reputation_token ' +
      'FROM users u LEFT JOIN balances b ON u.id = b.user_id WHERE id=$1',
    [userId]
  );
  return returnSingle(result);
}

async function deleteUserById(userId) {
  let result = await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  return returnSingle(result);
}

async function deleteAllEmployees() {
  await pool.query('DELETE FROM balances');
  await pool.query('DELETE FROM requests');

  let result = await pool.query('DELETE FROM users WHERE role = $1', ['employee']);
  return returnSingle(result);
}

async function getUserByUsername(username) {
  let result = await pool.query('SELECT * FROM users WHERE LOWER(user_name) = LOWER($1)', [
    username,
  ]);
  return returnSingle(result);
}

async function getUserByAddress(address) {
  let result = await pool.query(
    'SELECT id, user_name, address, "role" FROM users WHERE LOWER(address) = LOWER($1)',
    [address]
  );
  return returnSingle(result);
}

async function addUser({ id, username, password, address, role }) {
  await pool.query(
    'INSERT INTO public.users (id, user_name, "password", "role", "address") VALUES' +
      '($1, $2, $3, $4, $5)',
    [id, username, password, role, address]
  );
  return await getUserByUsername(username);
}

async function addAchievement({ name, value }) {
  await pool.query('INSERT INTO public.achievements (name, value) VALUES ($1, $2)', [name, value]);
  return true;
}

async function getAchievements() {
  let result = await pool.query('SELECT * FROM achievements');
  return returnMany(result);
}

async function addSwag({ name, value }) {
  await pool.query('INSERT INTO public.swags (name, value) VALUES ($1, $2)', [name, value]);
  return true;
}

async function getSwagList() {
  let result = await pool.query('SELECT * FROM swags');
  return returnMany(result);
}

async function findSwagByName(name) {
  let result = await pool.query('SELECT * FROM swags WHERE name=$1', [name]);
  return returnSingle(result);
}

async function getSwagById(id) {
  let result = await pool.query('SELECT * FROM swags WHERE id=$1', [id]);
  return returnSingle(result);
}

async function getEmployeeList() {
  let result = await pool.query(
    'SELECT id, user_name, reward_token, penalty_token, reputation_token, address' +
      ' FROM users u LEFT JOIN balances b ON u.id = b.user_id  WHERE role = $1',
    ['employee']
  );
  return returnMany(result);
}

async function getUserChainMap() {
  let result = await pool.query('SELECT id, address FROM users');
  let map = new Map();
  result.rows.forEach((r) => map.set(r.id, r.address));
  return map;
}

async function addRedeemRequest({ employeeId, swagId }) {
  await pool.query('INSERT INTO public.requests ' + ' (employee_id, swag_id)' + ' VALUES($1, $2)', [
    employeeId,
    swagId,
  ]);
  return true;
}

async function completeRedeemRequest(requestid, iscomplete) {
  let result = await pool.query(
    'UPDATE public.requests ' +
      ' SET completed_at = CURRENT_TIMESTAMP, is_completed = $2' +
      ' WHERE id=$1',
    [requestid, iscomplete]
  );
  return true;
}

async function getRedeemRequestById(requestId) {
  let result = await pool.query(
    'SELECT r.id, r.employee_id, u.user_name, u.address, r.swag_id, s.name, s.value,' +
      ' r.completed_at, r.is_completed ' +
      ' FROM requests r ' +
      ' join users u on u.id = r.employee_id ' +
      ' join swags s on s.id = r.swag_id ' +
      ' where r.id=$1',
    [requestId]
  );
  return returnSingle(result);
}

async function getActiveRedeemRequestList() {
  let result = await pool.query(
    'SELECT r.id, r.employee_id, u.user_name, r.swag_id, s.name,' +
      ' r.completed_at, r.is_completed ' +
      ' FROM requests r ' +
      ' join users u on u.id = r.employee_id ' +
      ' join swags s on s.id = r.swag_id ' +
      ' where r.completed_at is null and is_completed is null',
    []
  );
  return returnMany(result);
}

async function updateTokenBalance({
  userId,
  balance: { rewardToken, penaltyToken, reputationToken },
}) {
  let result = await pool.query(
    'INSERT INTO balances (user_id, reward_token, penalty_token, reputation_token) ' +
      ' VALUES ($1, $2, $3, $4) ON CONFLICT(user_id)' +
      ' DO UPDATE set reward_token = $2, penalty_token = $3, reputation_token = $4',
    [userId, rewardToken, penaltyToken, reputationToken]
  );
  return true;
}

async function getRequestsListForEmployee(employeeId) {
  let result = await pool.query(
    'SELECT r.id, r.completed_at, r.is_completed, r.swag_id ' +
      ' FROM requests r ' +
      //+ " join swags s on s.id = r.swag_id "
      ' WHERE employee_id = $1',
    [employeeId]
  );
  return returnMany(result);
}

async function closePool() {
  await pool.end();
  console.log('Closed database connection!');
}

module.exports = {
  ping,
  closePool,
  getUserById,
  getUserByUsername,
  getUserByAddress,
  addUser,
  addAchievement,
  getAchievements,
  addSwag,
  getSwagList,
  findSwagByName,
  getSwagById,
  deleteAllEmployees,
  getEmployeeList,
  getUserChainMap,
  addRedeemRequest,
  completeRedeemRequest,
  getRedeemRequestById,
  getActiveRedeemRequestList,
  updateTokenBalance,
  getRequestsListForEmployee,
};

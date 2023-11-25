const express = require('express');

const adminRouter = require('./admin.router');
const loginRouter = require('./login.router');
const employeeRouter = require('./employee.router');
const secretaryRouter = require('./secretary.router');

const router = express.Router();

router.use('/login', loginRouter);
router.use('/admin', adminRouter);
router.use('/employee', employeeRouter);
router.use('/secretary', secretaryRouter);

router.get('/', (req, res) => {
  res.redirect('/employee');
});

module.exports = router;

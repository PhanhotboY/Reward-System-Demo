const express = require('express');
require('express-async-errors');
const path = require('path');

require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', require('./routers'));

// 404 error handler
app.use('/', (req, res, next) => {
  throw new Error('404: Page Not Found');
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = app;

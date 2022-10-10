const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const Logger = require('../config/logger');
const morgan = require('morgan');

// routes
const userRoute = require('./user-route');
const walletRoute = require('./wallet-route');

const app = express();

global.logger = Logger.createLogger({ label: 'DEMOCREDIT' });

app.use(helmet());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined', { stream: logger.stream }));

app.use('/', userRoute);
app.use('/wallet', walletRoute);
app.get('/', (req, res) => {
  res.send('Hello World');
});

module.exports = app;

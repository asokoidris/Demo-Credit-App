const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const Logger = require('../config/logger');
const morgan = require('morgan');

// cron jobs and cron job scheduler and functions
const { verifyPaymentJob } = require('../jobs/verify-payment-cron');

// start cron job
verifyPaymentJob.start();

// routes
const userRoute = require('./user-route');
const walletRoute = require('./wallet-route');

const app = express();

global.logger = Logger.createLogger({ label: 'DEMOCREDIT' });

app.use(helmet());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPDATE', 'PATCH'],
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

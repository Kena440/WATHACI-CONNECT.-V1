const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

app.use(cors());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json());

const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const proposalHelperRoutes = require('./routes/proposalHelper');
app.use('/proposal', proposalHelperRoutes);

app.use(errorHandler);

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', reason, 'ProcessEvents');
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err, 'ProcessEvents');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, null, 'Server');
});

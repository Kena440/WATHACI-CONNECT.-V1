const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
let SentryTransport;
try {
  SentryTransport = require('winston-transport-sentry-node').default;
} catch (err) {
  SentryTransport = null;
}

const logFormat = format.combine(
  format.timestamp(),
  format.json()
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

if (process.env.SENTRY_DSN && SentryTransport) {
  logger.add(
    new SentryTransport({
      sentry: { dsn: process.env.SENTRY_DSN },
      level: 'error',
    })
  );
}

module.exports = logger;

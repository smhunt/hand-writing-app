const https = require('https');
const fs = require('fs');
const path = require('path');
const app = require('./server');
const config = require('./config');
const logger = require('./logger');

// Load SSL certificates
const options = {
  key: fs.readFileSync(path.join(__dirname, '../certs/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../certs/cert.pem'))
};

// Create HTTPS server
const server = https.createServer(options, app);

// Start server
server.listen(config.server.port, config.server.host, () => {
  logger.info(`Backend HTTPS server listening on https://${config.server.host}:${config.server.port}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`HTTPS enabled: true`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

import Client from './database/main/client.js';
import Logger from './server/main/logger.js';
import Threads from './server/main/threads.js';
import path from 'path';

////////////////////////////////////////////////////////////////////////////////

// Start Main Stratum Server
/* eslint-disable */
try {
  const config = (await import('./configs/main/example.js')).default;
  const logger = new Logger(config);

  // Initialize Local/Remote Databases
  const client = new Client(logger, config);
  client.handleClientMaster(() => {
    client.handleClientWorker(() => {
      const threads = new Threads(logger, client, config).setupThreads();
    });
  });

// Error on Startup
} catch(e) {
  console.error('Failed to start the application:', e);
  process.exit(1);
}

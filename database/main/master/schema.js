import Text from '../../../locales/index.js';

////////////////////////////////////////////////////////////////////////////////

// Main Schema Function
class Schema {
  constructor(logger, executor, configMain) {

    const _this = this;
    this.logger = logger;
    this.configMain = configMain;
    this.executor = executor;
    this.text = Text[configMain.language];

    // Check if Schema Exists in Database
    this.selectSchema = async function (pool) {
      const command = `\
      SELECT EXISTS (\
        SELECT 1 FROM pg_namespace\
        WHERE nspname = '${pool}');`;
      _this.executor([command], (results) => callback(results.rows[0].exists));
    };

    // Deploy Schema to Database
    this.createSchema = function (pool, callback) {
      const command = `CREATE SCHEMA IF NOT EXISTS "${pool}";`;
      _this.executor([command], () => {
        if (typeof callback === 'function') {
          callback();
        }
      });
    };

    // Check if Current Blocks Table Exists in Database
    this.selectCurrentBlocks = async function (pool) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'current_blocks');`;
      _this.executor([command], (results) => callback(results.rows[0].exists));
    };

    // Deploy Current Blocks Table to Database
    this.createCurrentBlocks = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".current_blocks(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          submitted BIGINT NOT NULL DEFAULT -1,\
          miner VARCHAR NOT NULL DEFAULT 'unknown',\
          worker VARCHAR NOT NULL DEFAULT 'unknown',\
          category VARCHAR NOT NULL DEFAULT 'pending',\
          confirmations INT NOT NULL DEFAULT -1,\
          difficulty FLOAT NOT NULL DEFAULT -1,\
          hash VARCHAR NOT NULL DEFAULT 'unknown',\
          height INT NOT NULL DEFAULT -1,\
          identifier VARCHAR NOT NULL DEFAULT 'master',\
          luck FLOAT NOT NULL DEFAULT 0,\
          reward FLOAT NOT NULL DEFAULT 0,\
          round VARCHAR NOT NULL DEFAULT 'unknown',\
          solo BOOLEAN NOT NULL DEFAULT false,\
          transaction VARCHAR NOT NULL DEFAULT 'unknown',\
          type VARCHAR NOT NULL DEFAULT 'primary',\
          CONSTRAINT current_blocks_unique UNIQUE (round, type)\
        );\
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_blocks_miner ON "${pool}".current_blocks(miner, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_blocks_worker ON "${pool}".current_blocks(worker, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_blocks_category ON "${pool}".current_blocks(category, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_blocks_identifier ON "${pool}".current_blocks(identifier, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_blocks_type ON "${pool}".current_blocks(type);`]);
    };

    // Check if Current Hashrate Table Exists in Database
    this.selectCurrentHashrate = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'current_hashrate');`;
      _this.executor([command], (results) => callback(results[0].rows[0].exists));
    };

    // Deploy Current Hashrate Table to Database
    this.createCurrentHashrate = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".current_hashrate(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          miner VARCHAR NOT NULL DEFAULT 'unknown',\
          worker VARCHAR NOT NULL DEFAULT 'unknown',\
          identifier VARCHAR NOT NULL DEFAULT 'master',\
          share VARCHAR NOT NULL DEFAULT 'unknown',\
          solo BOOLEAN NOT NULL DEFAULT false,\
          type VARCHAR NOT NULL DEFAULT 'primary',\
          work FLOAT NOT NULL DEFAULT 0\
        );
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_hashrate_miner ON "${pool}".current_hashrate(timestamp, miner, solo, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_hashrate_worker ON "${pool}".current_hashrate(timestamp, worker, solo, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_hashrate_type ON "${pool}".current_hashrate(timestamp, solo, type);`]);
    };

    // Check if Current Metadata Table Exists in Database
    this.selectCurrentMetadata = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'current_metadata');`;
      _this.executor([command], (results) => callback(results[0].rows[0].exists));
    };

    // Deploy Current Metadata Table to Database
    this.createCurrentMetadata = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".current_metadata(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          blocks INT NOT NULL DEFAULT 0,\
          efficiency FLOAT NOT NULL DEFAULT 0,\
          effort FLOAT NOT NULL DEFAULT 0,\
          hashrate FLOAT NOT NULL DEFAULT 0,\
          invalid INT NOT NULL DEFAULT 0,\
          miners INT NOT NULL DEFAULT 0,\
          stale INT NOT NULL DEFAULT 0,\
          type VARCHAR NOT NULL DEFAULT 'primary',\
          valid INT NOT NULL DEFAULT 0,\
          work FLOAT NOT NULL DEFAULT 0,\
          workers INT NOT NULL DEFAULT 0,\
          CONSTRAINT current_metadata_unique UNIQUE (type)\
        );\
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_metadata_type ON "${pool}".current_metadata(type);`]);
    };

    // Check if Current Miners Table Exists in Database
    this.selectCurrentMiners = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables
        WHERE table_schema = '${pool}'
        AND table_name = 'current_miners');`;
      _this.executor([command], (results) => callback(results[0].rows[0].exists));
    };

    // Deploy Current Miners Table to Database
    this.createCurrentMiners = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".current_miners(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          miner VARCHAR NOT NULL DEFAULT 'unknown',\
          balance FLOAT NOT NULL DEFAULT 0,\
          efficiency FLOAT NOT NULL DEFAULT 0,\
          effort FLOAT NOT NULL DEFAULT 0,\
          generate FLOAT NOT NULL DEFAULT 0,\
          hashrate FLOAT NOT NULL DEFAULT 0,\
          immature FLOAT NOT NULL DEFAULT 0,\
          invalid INT NOT NULL DEFAULT 0,\
          paid FLOAT NOT NULL DEFAULT 0,\
          stale INT NOT NULL DEFAULT 0,\
          type VARCHAR NOT NULL DEFAULT 'primary',\
          valid INT NOT NULL DEFAULT 0,\
          work FLOAT NOT NULL DEFAULT 0,\
          CONSTRAINT current_miners_unique UNIQUE (miner, type)\
        );\
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_miners_balance ON "${pool}".current_miners(balance, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_miners_miner ON "${pool}".current_miners(miner, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_miners_type ON "${pool}".current_miners(type);`]);
    };

    // Check if Current Network Table Exists in Database
    this.selectCurrentNetwork = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'current_network');`;
      _this.executor([command], (results) => callback(results[0].rows[0].exists));
    };

    // Deploy Historical Network Table to Database
    this.createCurrentNetwork = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".current_network(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          difficulty FLOAT NOT NULL DEFAULT 0,\
          hashrate FLOAT NOT NULL DEFAULT 0,\
          height INT NOT NULL DEFAULT -1,\
          type VARCHAR NOT NULL DEFAULT 'primary',\
          CONSTRAINT current_network_unique UNIQUE (type)\
        );\
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_network_type ON "${pool}".current_network(type);`]);
    };

    // Check if Current Payments Table Exists in Database
    this.selectCurrentPayments = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'current_payments');`;
      _this.executor([command], (results) => callback(results[0].rows[0].exists));
    };

    // Deploy Current Payments Table to Database
    this.createCurrentPayments = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".current_payments(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          round VARCHAR NOT NULL DEFAULT 'unknown',\
          type VARCHAR NOT NULL DEFAULT 'primary',\
          CONSTRAINT current_payments_unique UNIQUE (round, type)\
        );\
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_payments_type ON "${pool}".current_payments(type);`]);
    };

    // Check if Current Rounds Table Exists in Database
    this.selectCurrentRounds = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'current_rounds');`;
      _this.executor([command], (results) => callback(results[0].rows[0].exists));
    };

    // Deploy Current Rounds Table to Database
    this.createCurrentRounds = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".current_rounds(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          submitted BIGINT NOT NULL DEFAULT -1,\
          recent BIGINT NOT NULL DEFAULT -1,\
          miner VARCHAR NOT NULL DEFAULT 'unknown',\
          worker VARCHAR NOT NULL DEFAULT 'unknown',\
          identifier VARCHAR NOT NULL DEFAULT 'master',\
          invalid INT NOT NULL DEFAULT 0,\
          round VARCHAR NOT NULL DEFAULT 'current',\
          solo BOOLEAN NOT NULL DEFAULT false,\
          stale INT NOT NULL DEFAULT 0,\
          times FLOAT NOT NULL DEFAULT 0,\
          type VARCHAR NOT NULL DEFAULT 'primary',\
          valid INT NOT NULL DEFAULT 0,\
          work FLOAT NOT NULL DEFAULT 0,\
          CONSTRAINT current_rounds_unique UNIQUE (recent, worker, solo, round, type)\
        );\
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_rounds_miner ON "${pool}".current_rounds(miner, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_rounds_worker ON "${pool}".current_rounds(worker, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_rounds_identifier ON "${pool}".current_rounds(identifier, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_rounds_round ON "${pool}".current_rounds(solo, round, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_rounds_historical ON "${pool}".current_rounds(worker, solo, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_rounds_combined ON "${pool}".current_rounds(worker, solo, round, type);`]);
    };

    // Check if Current Transactions Table Exists in Database
    this.selectCurrentTransactions = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'current_transactions');`;
      _this.executor([command], (results) => callback(results[0].rows[0].exists));
    };

    // Deploy Current Transactions Table to Database
    this.createCurrentTransactions = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".current_transactions(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          round VARCHAR NOT NULL DEFAULT 'unknown',\
          type VARCHAR NOT NULL DEFAULT 'primary',\
          CONSTRAINT current_transactions_unique UNIQUE (round, type)\
        );\
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_transactions_type ON "${pool}".current_transactions(type);`]);
    };

    // Check if Current Workers Table Exists in Database
    this.selectCurrentWorkers = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'current_workers');`;
      _this.executor([command], (results) => callback(results[0].rows[0].exists));
    };

    // Deploy Current Workers Table to Database
    this.createCurrentWorkers = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".current_workers(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          miner VARCHAR NOT NULL DEFAULT 'unknown',\
          worker VARCHAR NOT NULL DEFAULT 'unknown',\
          efficiency FLOAT NOT NULL DEFAULT 0,\
          effort FLOAT NOT NULL DEFAULT 0,\
          hashrate FLOAT NOT NULL DEFAULT 0,\
          invalid INT NOT NULL DEFAULT 0,\
          solo BOOLEAN NOT NULL DEFAULT false,\
          stale INT NOT NULL DEFAULT 0,\
          type VARCHAR NOT NULL DEFAULT 'primary',\
          valid INT NOT NULL DEFAULT 0,\
          work FLOAT NOT NULL DEFAULT 0,\
          CONSTRAINT current_workers_unique UNIQUE (worker, solo, type)\
        );\
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_workers_miner ON "${pool}".current_workers(miner, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_workers_solo ON "${pool}".current_workers(solo, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_workers_worker ON "${pool}".current_workers(worker, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS current_workers_type ON "${pool}".current_workers(type);`]);
    };

    // Check if Historical Blocks Table Exists in Database
    this.selectHistoricalBlocks = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'historical_blocks');`;
      _this.executor([command], (results) => callback(results[0].rows[0].exists));
    };

    // Deploy Historical Blocks Table to Database
    this.createHistoricalBlocks = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".historical_blocks(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          submitted BIGINT NOT NULL DEFAULT -1,\
          miner VARCHAR NOT NULL DEFAULT 'unknown',\
          worker VARCHAR NOT NULL DEFAULT 'unknown',\
          category VARCHAR NOT NULL DEFAULT 'pending',\
          confirmations INT NOT NULL DEFAULT -1,\
          difficulty FLOAT NOT NULL DEFAULT -1,\
          hash VARCHAR NOT NULL DEFAULT 'unknown',\
          height INT NOT NULL DEFAULT -1,\
          identifier VARCHAR NOT NULL DEFAULT 'master',\
          luck FLOAT NOT NULL DEFAULT 0,\
          reward FLOAT NOT NULL DEFAULT 0,\
          round VARCHAR NOT NULL DEFAULT 'unknown',\
          solo BOOLEAN NOT NULL DEFAULT false,\
          transaction VARCHAR NOT NULL DEFAULT 'unknown',\
          type VARCHAR NOT NULL DEFAULT 'primary',\
          CONSTRAINT historical_blocks_unique UNIQUE (round, type)\
        );\
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_blocks_miner ON "${pool}".historical_blocks(miner, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_blocks_worker ON "${pool}".historical_blocks(worker, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_blocks_category ON "${pool}".historical_blocks(category, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_blocks_identifier ON "${pool}".historical_blocks(identifier, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_blocks_type ON "${pool}".historical_blocks(type);`]);
    };

    // Check if Historical Metadata Table Exists in Database
    this.selectHistoricalMetadata = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'historical_metadata');`;
      _this.executor([command], (results) => callback(results.rows[0].exists));
    };

    // Deploy Historical Metadata Table to Database
    this.createHistoricalMetadata = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".historical_metadata(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          recent BIGINT NOT NULL DEFAULT -1,\
          blocks INT NOT NULL DEFAULT 0,\
          efficiency FLOAT NOT NULL DEFAULT 0,\
          effort FLOAT NOT NULL DEFAULT 0,\
          hashrate FLOAT NOT NULL DEFAULT 0,\
          invalid INT NOT NULL DEFAULT 0,\
          miners INT NOT NULL DEFAULT 0,\
          stale INT NOT NULL DEFAULT 0,\
          type VARCHAR NOT NULL DEFAULT 'primary',\
          valid INT NOT NULL DEFAULT 0,\
          work FLOAT NOT NULL DEFAULT 0,\
          workers INT NOT NULL DEFAULT 0,\
          CONSTRAINT historical_metadata_recent UNIQUE (recent, type)\
        );\
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_metadata_type ON "${pool}".historical_metadata(type);`]);
    };

    // Check if Historical Miners Table Exists in Database
    this.selectHistoricalMiners = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'historical_miners');`;
      _this.executor([command], (results) => callback(results.rows[0].exists));
    };

    // Deploy Historical Miners Table to Database
    this.createHistoricalMiners = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".historical_miners(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          recent BIGINT NOT NULL DEFAULT -1,\
          miner VARCHAR NOT NULL DEFAULT 'unknown',\
          efficiency FLOAT NOT NULL DEFAULT 0,\
          effort FLOAT NOT NULL DEFAULT 0,\
          hashrate FLOAT NOT NULL DEFAULT 0,\
          invalid INT NOT NULL DEFAULT 0,\
          stale INT NOT NULL DEFAULT 0,\
          type VARCHAR NOT NULL DEFAULT 'primary',\
          valid INT NOT NULL DEFAULT 0,\
          work FLOAT NOT NULL DEFAULT 0,\
          CONSTRAINT historical_miners_recent UNIQUE (recent, miner, type)\
        );\
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_miners_miner ON "${pool}".historical_miners(miner, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_miners_type ON "${pool}".historical_miners(type);`]);
    };

    // Check if Historical Network Table Exists in Database
    this.selectHistoricalNetwork = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'historical_network');`;
      _this.executor([command], (results) => callback(results.rows[0].exists));
    };

    // Deploy Historical Network Table to Database
    this.createHistoricalNetwork = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".historical_network(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          recent BIGINT NOT NULL DEFAULT -1,\
          difficulty FLOAT NOT NULL DEFAULT 0,\
          hashrate FLOAT NOT NULL DEFAULT 0,\
          height INT NOT NULL DEFAULT -1,\
          type VARCHAR NOT NULL DEFAULT 'primary',\
          CONSTRAINT historical_network_recent UNIQUE (recent, type)\
        );\
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_network_type ON "${pool}".historical_network(type);`]);
    };

    // Check if Historical Payments Table Exists in Database
    this.selectHistoricalPayments = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'historical_payments');`;
      _this.executor([command], (results) => callback(results.rows[0].exists));
    };

    // Deploy Historical Payments Table to Database
    this.createHistoricalPayments = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".historical_payments(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          miner VARCHAR NOT NULL DEFAULT 'unknown',\
          amount FLOAT NOT NULL DEFAULT 0,\
          transaction VARCHAR NOT NULL DEFAULT 'unknown',\
          type VARCHAR NOT NULL DEFAULT 'primary'\
        );\
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_payments_miner ON "${pool}".historical_payments(miner, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_payments_transaction ON "${pool}".historical_payments(transaction, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_payments_type ON "${pool}".historical_payments(type);`]);
    };

    // Check if Historical Rounds Table Exists in Database
    this.selectHistoricalRounds = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'historical_rounds');`;
      _this.executor([command], (results) => callback(results.rows[0].exists));
    };

    // Deploy Historical Rounds Table to Database
    this.createHistoricalRounds = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".historical_rounds(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          submitted BIGINT NOT NULL DEFAULT -1,\
          miner VARCHAR NOT NULL DEFAULT 'unknown',\
          worker VARCHAR NOT NULL DEFAULT 'unknown',\
          identifier VARCHAR NOT NULL DEFAULT 'master',\
          invalid INT NOT NULL DEFAULT 0,\
          round VARCHAR NOT NULL DEFAULT 'unknown',\
          solo BOOLEAN NOT NULL DEFAULT false,\
          stale INT NOT NULL DEFAULT 0,\
          times FLOAT NOT NULL DEFAULT 0,\
          type VARCHAR NOT NULL DEFAULT 'primary',\
          valid INT NOT NULL DEFAULT 0,\
          work FLOAT NOT NULL DEFAULT 0,\
          CONSTRAINT historical_rounds_unique UNIQUE (worker, solo, round, type)\
        );\
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_rounds_miner ON "${pool}".historical_rounds(miner, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_rounds_worker ON "${pool}".historical_rounds(worker, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_rounds_identifier ON "${pool}".historical_rounds(identifier, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_rounds_round ON "${pool}".historical_rounds(solo, round, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_rounds_historical ON "${pool}".historical_rounds(worker, solo, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_rounds_combined ON "${pool}".historical_rounds(worker, solo, round, type);`]);
    };

    // Check if Historical Transactions Table Exists in Database
    this.selectHistoricalTransactions = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'historical_transactions');`;
      _this.executor([command], (results) => callback(results.rows[0].exists));
    };

    // Deploy Historical Transactions Table to Database
    this.createHistoricalTransactions = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".historical_transactions(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          amount FLOAT NOT NULL DEFAULT 0,\
          transaction VARCHAR NOT NULL DEFAULT 'unknown',\
          type VARCHAR NOT NULL DEFAULT 'primary'\
        );\
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_transactions_transaction ON "${pool}".historical_transactions(transaction, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_transactions_type ON "${pool}".historical_transactions(type);`]);
    };

    // Check if Historical Workers Table Exists in Database
    this.selectHistoricalWorkers = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'historical_workers');`;
      _this.executor([command], (results) => callback(results.rows[0].exists));
    };

    // Deploy Historical Workers Table to Database
    this.createHistoricalWorkers = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".historical_workers(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          recent BIGINT NOT NULL DEFAULT -1,\
          miner VARCHAR NOT NULL DEFAULT 'unknown',\
          worker VARCHAR NOT NULL DEFAULT 'unknown',\
          efficiency FLOAT NOT NULL DEFAULT 0,\
          effort FLOAT NOT NULL DEFAULT 0,\
          hashrate FLOAT NOT NULL DEFAULT 0,\
          invalid INT NOT NULL DEFAULT 0,\
          solo BOOLEAN NOT NULL DEFAULT false,\
          stale INT NOT NULL DEFAULT 0,\
          type VARCHAR NOT NULL DEFAULT 'primary',\
          valid INT NOT NULL DEFAULT 0,\
          work FLOAT NOT NULL DEFAULT 0,\
          CONSTRAINT historical_workers_recent UNIQUE (recent, worker, type)\
        );\
      `;
      await _this.executor([tableCommand]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_workers_miner ON "${pool}".historical_workers(miner, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_workers_worker ON "${pool}".historical_workers(worker, type);`]);
      await _this.executor([`CREATE INDEX IF NOT EXISTS historical_workers_type ON "${pool}".historical_workers(type);`]);
    };

    // Build Schema Promises for Deployment
    /* istanbul ignore next */
    this.handlePromises = async function (pool, checker, deployer) {
      const exists = await checker(pool);
      if (exists) return;
      await deployer(pool);
    };

    // Build Deployment Model for Each Current
    /* istanbul ignore next */
    this.handleDeployment = async function (pool) {
      await _this.handlePromises(pool, _this.selectSchema, _this.createSchema);
      await _this.handlePromises(pool, _this.selectCurrentBlocks, _this.createCurrentBlocks);
      await _this.handlePromises(pool, _this.selectCurrentHashrate, _this.createCurrentHashrate);
      await _this.handlePromises(pool, _this.selectCurrentMetadata, _this.createCurrentMetadata);
      await _this.handlePromises(pool, _this.selectCurrentMiners, _this.createCurrentMiners);
      await _this.handlePromises(pool, _this.selectCurrentNetwork, _this.createCurrentNetwork);
      await _this.handlePromises(pool, _this.selectCurrentPayments, _this.createCurrentPayments);
      await _this.handlePromises(pool, _this.selectCurrentRounds, _this.createCurrentRounds);
      await _this.handlePromises(pool, _this.selectCurrentTransactions, _this.createCurrentTransactions);
      await _this.handlePromises(pool, _this.selectCurrentWorkers, _this.createCurrentWorkers);
      await _this.handlePromises(pool, _this.selectHistoricalBlocks, _this.createHistoricalBlocks);
      await _this.handlePromises(pool, _this.selectHistoricalMetadata, _this.createHistoricalMetadata);
      await _this.handlePromises(pool, _this.selectHistoricalMiners, _this.createHistoricalMiners);
      await _this.handlePromises(pool, _this.selectHistoricalNetwork, _this.createHistoricalNetwork);
      await _this.handlePromises(pool, _this.selectHistoricalPayments, _this.createHistoricalPayments);
      await _this.handlePromises(pool, _this.selectHistoricalRounds, _this.createHistoricalRounds);
      await _this.handlePromises(pool, _this.selectHistoricalTransactions, _this.createHistoricalTransactions);
      await _this.handlePromises(pool, _this.selectHistoricalWorkers, _this.createHistoricalWorkers);
    };

    // Handle Updating Database Schema
    /* istanbul ignore next */
    this.handleSchema = async function (configs) {
      const keys = Object.keys(configs);
      if (keys.length < 1) return;
      for (let i = 0; i < keys.length; i++) {
        await _this.handleDeployment(keys[i]);
        const lines = [_this.text.databaseSchemaText1(keys[i])];
        _this.logger.log('Database', 'Database', lines);
      }
    };
  }
}

export default Schema;

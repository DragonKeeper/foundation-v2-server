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
    this.selectSchema = function (pool, callback) {
      _this.logger.debug('Schema', null, [`Checking if schema exists: ${pool}`], false);
      const command = `\
      SELECT EXISTS (\
        SELECT 1 FROM pg_namespace\
        WHERE nspname = '${pool}');`;
      _this.executor([command], (results) => {
        if (typeof callback === 'function') {
          callback(results.rows[0].exists);
        }
      });
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

    // Check if Local Shares Table Exists in Database
    this.selectLocalShares = function (pool, callback) {
      _this.logger.debug('Schema', null, [`Checking if local_shares table exists in schema: ${pool}`], false);
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'local_shares');`;
      _this.executor([command], (results) => {
        if (typeof callback === 'function') {
          callback(results.rows[0].exists);
        }
      });
    };

    // Deploy Local Shares Table to Database
    this.createLocalShares = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".local_shares(\
          id BIGSERIAL PRIMARY KEY,\
          error VARCHAR NOT NULL DEFAULT 'unknown',\
          uuid VARCHAR NOT NULL DEFAULT 'unknown',\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          submitted BIGINT NOT NULL DEFAULT -1,\
          ip VARCHAR NOT NULL DEFAULT '0.0.0.0',\
          port INT NOT NULL DEFAULT -1,\
          addrprimary VARCHAR NOT NULL DEFAULT 'unknown',\
          addrauxiliary VARCHAR NOT NULL DEFAULT 'unknown',\
          blockdiffprimary FLOAT NOT NULL DEFAULT -1,\
          blockdiffauxiliary FLOAT NOT NULL DEFAULT -1,\
          blockvalid BOOLEAN NOT NULL DEFAULT false,\
          blocktype VARCHAR NOT NULL DEFAULT 'share',\
          clientdiff FLOAT NOT NULL DEFAULT -1,\
          hash VARCHAR NOT NULL DEFAULT 'unknown',\
          height INT NOT NULL DEFAULT -1,\
          identifier VARCHAR NOT NULL DEFAULT 'master',\
          reward FLOAT NOT NULL DEFAULT 0,\
          sharediff FLOAT NOT NULL DEFAULT -1,\
          sharevalid BOOLEAN NOT NULL DEFAULT false,\
          transaction VARCHAR NOT NULL DEFAULT 'unknown',\
          CONSTRAINT local_shares_unique UNIQUE (uuid)\
        );\
      `;
      await _this.executor([tableCommand]);
    };

    // Check if Local Transactions Table Exists in Database
    this.selectLocalTransactions = function (pool, callback) {
      const command = `\
      SELECT EXISTS (\
        SELECT FROM information_schema.tables\
        WHERE table_schema = '${pool}'\
        AND table_name = 'local_transactions');`;
      return new Promise((resolve, reject) => {
        _this.executor([command], (results) => {
          try {
            resolve(results.rows[0].exists);
          } catch (err) {
            reject(err);
          }
        });
      });
    };

    // Deploy Local Transactions Table to Database
    this.createLocalTransactions = async function (pool) {
      const tableCommand = `\
        CREATE TABLE IF NOT EXISTS "${pool}".local_transactions(\
          id BIGSERIAL PRIMARY KEY,\
          timestamp BIGINT NOT NULL DEFAULT -1,\
          uuid VARCHAR NOT NULL DEFAULT 'unknown',\
          type VARCHAR NOT NULL DEFAULT 'primary',\
          CONSTRAINT local_transactions_unique UNIQUE (uuid)\
        );\
      `;
      await _this.executor([tableCommand]);
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
      await _this.handlePromises(pool, _this.selectLocalShares, _this.createLocalShares);
      // Promise-based usage for selectLocalTransactions
      const exists = await _this.selectLocalTransactions(pool);
      if (!exists) {
        await _this.createLocalTransactions(pool);
      }
    };

    // Handle Updating Database Schema
    /* istanbul ignore next */
    this.handleSchema = async function (configs) {
      const keys = Object.keys(configs);
      if (keys.length < 1) return;
      for (let i = 0; i < keys.length; i++) {
        await _this.handleDeployment(keys[i]);
        const lines = [_this.text.databaseSchemaText2(keys[i])];
        _this.logger.log('Database', 'Database', lines);
      }
    };
  }
}

export default Schema;

import Schema from './schema.js';
import Text from '../../../locales/index.js';
import LocalShares from './local/shares.js';
import LocalTransactions from './local/transactions.js';

////////////////////////////////////////////////////////////////////////////////

// Main Command Function
class Commands {
  constructor(logger, client, configMain) {

    const _this = this;
    this.logger = logger;
    this.client = client;
    this.configMain = configMain;
    this.text = Text[configMain.language];
    this.timing = [1000, 5000, 30000];

    // Database Table Structure
    this.local = {};
    this.retries = 0;

    // Execute Commands (async/await version)
    this.executor = async function (commands) {
      const query = commands.join(' ');
      try {
        const results = await _this.client.query(query);
        _this.retries = 0; // Reset retries on success
        return results;
      } catch (error) {
        if (error.message && error.message.includes('current transaction is aborted')) {
          try {
            await this.client.query('ROLLBACK');
          } catch (rollbackError) {
            // Optionally log rollback error
          }
          return this.retry(commands, error);
        } else {
          return this.retry(commands, error);
        }
      }
    };

    // Handle Retries (async/await version)
    this.retry = async function (commands, error) {
      if (_this.retries < 3) {
        const lines = [_this.text.databaseCommandsText3(_this.retries)];
        _this.logger.error('Database', 'Worker', lines);
        await new Promise(resolve => setTimeout(resolve, _this.timing[_this.retries] || 1000));
        _this.retries += 1;
        return _this.executor(commands);
      } else {
        throw error;
      }
    };

    // Build Out Schema Generation
    this.schema = new Schema(_this.logger, _this.executor, _this.configMain);

    // Initialize Local Commands
    this.local.shares = new LocalShares(_this.logger, _this.configMain);
    this.local.transactions = new LocalTransactions(_this.logger, _this.configMain);
  }
}

export default Commands;

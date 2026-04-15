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

   // Simpler async executor: joins commands and executes as a single query
    this.executor = async (commands, callback) => {
      // Join commands, trim, and replace all whitespace (indentation, newlines) with a single space
      // Removing any indentation and newlines to prevent any potential issues with the query execution.
      // To ensure that the commands are properly formatted for logging and debugging purposes.
      // All current queries in backticks have been formatted with backslashes to prevent newlines, but this will ensure that any
      // future queries that are not properly formatted will still be executed correctly.
      const query = commands.join(' ').trim().replace(/\s+/g, ' ');
      try {
        const results = await this.client.query(query);
        if (callback) callback(results);
        this.retries = 0;
        return results;
      } catch (error) {
        if (callback) this.retry(commands, error, callback);
        else return this.retry(commands, error);
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

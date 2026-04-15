import Schema from './schema.js';
import Text from '../../../locales/index.js';
import CurrentBlocks from './current/blocks.js';
import CurrentHashrate from './current/hashrate.js';
import CurrentMetadata from './current/metadata.js';
import CurrentMiners from './current/miners.js';
import CurrentNetwork from './current/network.js';
import CurrentPayments from './current/payments.js';
import CurrentRounds from './current/rounds.js';
import CurrentTransactions from './current/transactions.js';
import CurrentWorkers from './current/workers.js';
import HistoricalBlocks from './historical/blocks.js';
import HistoricalMetadata from './historical/metadata.js';
import HistoricalMiners from './historical/miners.js';
import HistoricalNetwork from './historical/network.js';
import HistoricalPayments from './historical/payments.js';
import HistoricalRounds from './historical/rounds.js';
import HistoricalTransactions from './historical/transactions.js';
import HistoricalWorkers from './historical/workers.js';

////////////////////////////////////////////////////////////////////////////////

// Main Command Function

class Commands {

  constructor(logger, client, configMain) {
    // Defensive fallback logger to prevent TypeError
    this.logger = logger || {
      debug: () => {},
      info: () => {},
      error: () => {},
      log: () => {}
    };
    this.client = client;
    this.configMain = configMain;
    this.text = Text[configMain.language];
    this.timing = [1000, 5000, 30000];

    // Database Table Structure
    this.current = {};
    this.historical = {};
    this.retries = 0;

    // Simpler async executor: joins commands and executes as a single query
    this.executor = async (commands, callback) => {
      // Check for objects in commands and log them
      let foundObject = false;
      commands.forEach((cmd, idx) => {
        if (typeof cmd === 'object' && cmd !== null) {
          foundObject = true;
          //console.log(`executor: Detected object at index ${idx}:`, JSON.stringify(cmd, null, 2));
        }
      });
      // Join commands, trim, and replace all whitespace (indentation, newlines) with a single space
      // Removing any indentation and newlines to prevent any potential issues with the query execution.
      // To ensure that the commands are properly formatted for logging and debugging purposes.
      // All current queries in backticks have been formatted with backslashes to prevent newlines, but this will ensure that any
      // future queries that are not properly formatted will still be executed correctly.
      const query = commands.join(' ').trim().replace(/\s+/g, ' ');
      if (foundObject) {
        //console.log('executor: Final joined query (may contain [object Object]):', query);
      } else {
        //console.log('Query:', query);
      }
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
    this.retry = async (commands, error) => {
      if (this.retries < 3) {
        await new Promise(resolve => setTimeout(resolve, this.timing[this.retries] || 1000));
        this.retries += 1;
        return this.executor(commands);
      } else {
        throw error;
      }
    };

    // Build Out Schema Generation
    this.schema = new Schema(this.logger, this.executor, this.configMain);

    // Initialize Historical Commands
    this.historical.blocks = new HistoricalBlocks(this.logger, this.configMain);
    this.historical.metadata = new HistoricalMetadata(this.logger, this.configMain);
    this.historical.miners = new HistoricalMiners(this.logger, this.configMain);
    this.historical.network = new HistoricalNetwork(this.logger, this.configMain);
    this.historical.payments = new HistoricalPayments(this.logger, this.configMain);
    this.historical.rounds = new HistoricalRounds(this.logger, this.configMain);
    this.historical.transactions = new HistoricalTransactions(this.logger, this.configMain);
    this.historical.workers = new HistoricalWorkers(this.logger, this.configMain);

    // Initialize Current Commands
    this.current.blocks = new CurrentBlocks(this.logger, this.configMain);
    this.current.hashrate = new CurrentHashrate(this.logger, this.configMain);
    this.current.metadata = new CurrentMetadata(this.logger, this.configMain);
    this.current.miners = new CurrentMiners(this.logger, this.configMain);
    this.current.network = new CurrentNetwork(this.logger, this.configMain);
    this.current.payments = new CurrentPayments(this.logger, this.configMain);
    this.current.rounds = new CurrentRounds(this.logger, this.configMain);
    this.current.transactions = new CurrentTransactions(this.logger, this.configMain);
    this.current.workers = new CurrentWorkers(this.logger, this.configMain);
  }
}

export default Commands;

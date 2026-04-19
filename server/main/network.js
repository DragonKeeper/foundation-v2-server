import Text from '../../locales/index.js';
import * as utils from './utils.js';

////////////////////////////////////////////////////////////////////////////////

// Main Network Function
class Network {
  constructor(logger, client, config, configMain) {

    const _this = this;
    this.logger = logger;
    this.client = client;
    this.config = config;
    this.configMain = configMain;
    this.pool = config.name;
    this.text = Text[configMain.language];

    // Stratum Variables
    process.setMaxListeners(0);
    this.forkId = process.env.forkId;

    // Client Handlers
    this.master = {
      executor: _this.client.master.commands.executor,
      current: _this.client.master.commands.current
    };

    // Handle Current Network Updates
    this.handleCurrentNetwork = function (network, networkType) {

      // Return Network Updates
      return {
        timestamp: Date.now(),
        difficulty: network.difficulty,
        hashrate: network.hashrate,
        height: network.height,
        type: networkType,
      };
    };

    // Handle Primary Updates
    this.handlePrimary = function (network, callback) {
      // Build Combined Transaction
      const networkUpdates = _this.handleCurrentNetwork(network, 'primary');
      let transaction = [
        'BEGIN;',
        _this.master.current.network.insertCurrentNetworkMain(_this.pool, [networkUpdates]),
        'COMMIT;'
      ];
      utils.executeExecutorTransaction(_this.master.executor, transaction, (err) => {
        if (err) {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Network', 'handlePrimary', err.stack || err.toString());
          }
          callback(err);
          return;
        }

        callback();
      });
    };

    // Handle Auxiliary Updates
    this.handleAuxiliary = function (network, callback) {
      // Build Combined Transaction
      const networkUpdates = _this.handleCurrentNetwork(network, 'auxiliary');
      const transaction = [
        'BEGIN;',
        _this.master.current.network.insertCurrentNetworkMain(_this.pool, [networkUpdates]),
        'COMMIT;'
      ];
      utils.executeExecutorTransaction(_this.master.executor, transaction, (err) => {
        if (err) {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Network', 'handleAuxiliary', err.stack || err.toString());
          }
          callback(err);
          return;
        }

        callback();
      });
    };

    // Handle Network Data Submissions
    this.handleSubmissions = function (networkData, callback) {

      // Establish Separate Behavior
      switch (networkData.networkType) {

        // Primary Behavior
        case 'primary':
          _this.handlePrimary(networkData, () => callback());
          break;

        // Auxiliary Behavior
        case 'auxiliary':
          _this.handleAuxiliary(networkData, () => callback());
          break;

        // Default Behavior
        default:
          callback();
          break;
      }
    };
  }
}

export default Network;

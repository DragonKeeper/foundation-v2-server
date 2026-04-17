import Text from '../../locales/index.js';
import * as utils from './utils.js';

////////////////////////////////////////////////////////////////////////////////

// Main API Function
class Endpoints {
  constructor(logger, client, configMain) {

    const _this = this;
    this.logger = logger;
    this.client = client;
    this.configMain = configMain;
    this.text = Text[configMain.language];

    // Client Handlers
    this.master = {
      executor: _this.client.master.commands.executor,
      current: _this.client.master.commands.current,
      historical: _this.client.master.commands.historical
    };

    // Handle Blocks Queries
    this.handleCurrentBlocks = function (pool, queries, callback) {
  try {
      // Validated Query Types
      const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', submitted: 'number', miner: 'string',
        worker: 'string', category: 'string', confirmations: 'number', difficulty: 'number',
        hash: 'string', height: 'number', identifier: 'string', luck: 'number',
        reward: 'number', round: 'string', solo: 'boolean', transaction: 'string',
        type: 'string'
      };

      // Accepted Values for Parameters
      const validCategories = ['pending', 'immature', 'generate', 'orphan', 'confirmed'];
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'miner', 'worker', 'category', 'confirmations', 'difficulty',
        'hash', 'height', 'identifier', 'luck', 'reward', 'round', 'solo', 'transaction', 'type'];
      const validRound = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.category && !validCategories.includes(queries.category)) {
        callback(400, _this.text.websiteValidationText1('category', validCategories.join(', ')));
        return;
      } else if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.round && !validRound.test(queries.round)) {
        callback(400, _this.text.websiteValidationText1('round', '<uuid>'));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Blocks Data
      const transaction = [_this.master.current.blocks.selectCurrentBlocksMain(pool, queries)];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups.rows);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleCurrentBlocks', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleCurrentBlocks');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleCurrentBlocks', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleCurrentBlocks');
      }
    };

    // Handle Hashrate Queries
    this.handleCurrentHashrate = function (pool, queries, callback) {
      if (_this.logger && typeof _this.logger.debug === 'function') {
      }
  try {
  // Validated Query Types
  const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', miner: 'string', worker: 'string',
        identifier: 'string', share: 'string', solo: 'boolean', type: 'string'
      };

      // Accepted Values for Parameters
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'miner', 'worker', 'solo', 'type', 'work'];
      const validShare = ['valid', 'invalid', 'stale'];
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.share && !validShare.includes(queries.share)) {
        callback(400, _this.text.websiteValidationText1('share', validShare.join(', ')));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Hashrate Data
      const transaction = [_this.master.current.hashrate.selectCurrentHashrateMain(pool, queries)];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups.rows);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleCurrentHashrate', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleCurrentHashrate');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleCurrentHashrate', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleCurrentHashrate');
      }
    };

    // Handle Metadata Queries
    this.handleCurrentMetadata = function (pool, queries, callback) {
      try {

      // Validated Query Types
      const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', blocks: 'number', efficiency: 'number',
        effort: 'number', hashrate: 'number', invalid: 'number', miners: 'number',
        stale: 'number', type: 'string', valid: 'number', work: 'number',
        workers: 'number'
      };

      // Accepted Values for Parameters
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'blocks', 'efficiency', 'effort', 'hashrate', 'invalid', 'miners',
        'stale', 'type', 'valid', 'work', 'workers'];
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Metadata Data
      const transaction = [_this.master.current.metadata.selectCurrentMetadataMain(pool, queries)];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups.rows);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleCurrentMetadata', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleCurrentMetadata');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleCurrentMetadata', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleCurrentMetadata');
      }
    };

    // Handle Pool/Solo Metadata Queries
        this.handleCurrentPoolSoloMetadata = function (pool, queries, callback) {
          try {
            // Validated Query Types
            const parameters = {
            };

            // General Parameter Validation.  Here just to catch any unexpected parameters and prevent them from being used in the query
            for (let i = 0; i < Object.keys(queries).length; i++) {
              const query = Object.keys(queries)[i];
              if (!utils.handleValidation(queries[query], parameters[query])) {
                const expected = parameters[query] || 'unknown';
                callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
                return;
              }
            }

            // Specific Parameter Validation
            if (queries.solo && !validType.includes(queries.solo)) {
              callback(400, _this.text.websiteValidationText1('solo', validSolo.join(', ')));
              return;
            }

            // Make Request and Return Data
            const transaction = [_this.master.current.metadata.selectCurrentPoolSoloMetadataMain(pool)];
            _this.master.executor(transaction)
              .then((lookups) => {
                callback(200, lookups.rows);
              })
              .catch((err) => {
                if (_this.logger && typeof _this.logger.error === 'function') {
                  _this.logger.error('Endpoints', 'handleCurrentPoolSoloMetadata', err.stack || err.toString());
                }
                callback(500, 'Internal server error in handleCurrentPoolSoloMetadata');
              });
          } catch (err) {
            if (_this.logger && typeof _this.logger.error === 'function') {
              _this.logger.error('Endpoints', 'handleCurrentPoolSoloMetadata', err.stack || err.toString());
            }
            callback(500, 'Internal server error in handleCurrentPoolSoloMetadata');
          }
        };

        // Handle Latest Pool/Solo Blocks Queries
        this.handleCurrentLatestPoolSoloBlocks = function (pool, queries, callback) {
          try {
            // Validated Query Types
            const parameters = {
            };

            // General Parameter Validation.  Here just to catch any unexpected parameters and prevent them from being used in the query
            for (let i = 0; i < Object.keys(queries).length; i++) {
              const query = Object.keys(queries)[i];
              if (!utils.handleValidation(queries[query], parameters[query])) {
                const expected = parameters[query] || 'unknown';
                callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
                return;
              }
            }

            // Specific Parameter Validation
            if (queries.solo && !validType.includes(queries.solo)) {
              callback(400, _this.text.websiteValidationText1('solo', validSolo.join(', ')));
              return;
            }

            // Make Request and Return Data
            const transaction = [_this.master.current.blocks.selectLatestPoolSoloBlocksMain(pool)];
            _this.master.executor(transaction)
              .then((lookups) => {
                callback(200, lookups.rows);
              })
              .catch((err) => {
                if (_this.logger && typeof _this.logger.error === 'function') {
                  _this.logger.error('Endpoints', 'handleCurrentLatestPoolSoloBlocks', err.stack || err.toString());
                }
                callback(500, 'Internal server error in handleCurrentLatestPoolSoloBlocks');
              });
          } catch (err) {
            if (_this.logger && typeof _this.logger.error === 'function') {
              _this.logger.error('Endpoints', 'handleCurrentLatestPoolSoloBlocks', err.stack || err.toString());
            }
            callback(500, 'Internal server error in handleCurrentLatestPoolSoloBlocks');
          }
        };

    // Handle Miners Queries
    this.handleCurrentMiners = function (pool, queries, callback) {
      if (_this.logger && typeof _this.logger.debug === 'function') {
        _this.logger.debug('Endpoints', 'handleCurrentMiners', 'Logger check', {
          loggerType: typeof _this.logger,
          loggerHasError: typeof _this.logger.error === 'function',
          loggerHasDebug: typeof _this.logger.debug === 'function',
        });
      }
  try {
  // Validated Query Types
  const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', miner: 'string', balance: 'number',
        efficiency: 'number', effort: 'number', generate: 'number', hashrate: 'number',
        immature: 'number', invalid: 'number', paid: 'number', stale: 'number',
        type: 'string', valid: 'number'
      };

      // Accepted Values for Parameters
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'miner', 'balance', 'efficiency', 'effort', 'generate', 'hashrate',
        'immature', 'paid', 'type'];
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Miners Data
      const transaction = [_this.master.current.miners.selectCurrentMinersMain(pool, queries)];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups.rows);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleCurrentMiners', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleCurrentMiners');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleCurrentMiners', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleCurrentMiners');
      }
    };

    // Handle Network Queries
    this.handleCurrentNetwork = function (pool, queries, callback) {
      if (_this.logger && typeof _this.logger.debug === 'function') {
        _this.logger.debug('Endpoints', 'handleCurrentNetwork', 'Logger check', {
          loggerType: typeof _this.logger,
          loggerHasError: typeof _this.logger.error === 'function',
          loggerHasDebug: typeof _this.logger.debug === 'function',
        });
      }
  try {
  // Validated Query Types
  const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', difficulty: 'number', hashrate: 'number',
        height: 'number', type: 'string'
      };

      // Accepted Values for Parameters
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'difficulty', 'hashrate', 'height', 'type'];
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Network Data
      const transaction = [_this.master.current.network.selectCurrentNetworkMain(pool, queries)];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups.rows);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleCurrentNetwork', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleCurrentNetwork');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleCurrentNetwork', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleCurrentNetwork');
      }
    };

    // Handle Payments Queries
    this.handleCurrentPayments = function (pool, queries, callback) {
      if (_this.logger && typeof _this.logger.debug === 'function') {
        _this.logger.debug('Endpoints', 'handleCurrentPayments', 'Logger check', {
          loggerType: typeof _this.logger,
          loggerHasError: typeof _this.logger.error === 'function',
          loggerHasDebug: typeof _this.logger.debug === 'function',
        });
      }
  try {
  // Validated Query Types
  const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', round: 'string', type: 'string'
      };

      // Accepted Values for Parameters
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'round', 'type'];
      const validRound = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.round && !validRound.test(queries.round)) {
        callback(400, _this.text.websiteValidationText1('round', '<uuid>'));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Payments Data
      const transaction = [_this.master.current.payments.selectCurrentPaymentsMain(pool, queries)];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups.rows);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleCurrentPayments', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleCurrentPayments');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleCurrentPayments', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleCurrentPayments');
      }
    };

    // Handle Rounds Queries
    this.handleCurrentRounds = function (pool, queries, callback) {
      if (_this.logger && typeof _this.logger.debug === 'function') {
        _this.logger.debug('Endpoints', 'handleCurrentRounds', 'Logger check', {
          loggerType: typeof _this.logger,
          loggerHasError: typeof _this.logger.error === 'function',
          loggerHasDebug: typeof _this.logger.debug === 'function',
        });
      }
  try {
  // Validated Query Types
  const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', miner: 'string', worker: 'string',
        identifier: 'string', invalid: 'number', round: 'string', solo: 'boolean',
        stale: 'number', times: 'number', type: 'string', valid: 'number',
        work: 'number'
      };

      // Accepted Values for Parameters
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'miner', 'worker', 'identifier', 'invalid', 'round', 'solo',
        'stale', 'times', 'type', 'valid', 'work'];
      const validRound = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.round && (queries.round !== 'current' && !validRound.test(queries.round))) {
        callback(400, _this.text.websiteValidationText1('round', 'current, <uuid>'));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Rounds Data
      const transaction = [_this.master.current.rounds.selectCurrentRoundsMain(pool, queries)];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups.rows);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleCurrentRounds', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleCurrentRounds');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleCurrentRounds', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleCurrentRounds');
      }
    };

    // Handle Transactions Queries
    this.handleCurrentTransactions = function (pool, queries, callback) {
      if (_this.logger && typeof _this.logger.debug === 'function') {
        _this.logger.debug('Endpoints', 'handleCurrentTransactions', 'Logger check', {
          loggerType: typeof _this.logger,
          loggerHasError: typeof _this.logger.error === 'function',
          loggerHasDebug: typeof _this.logger.debug === 'function',
        });
      }
  try {
  // Validated Query Types
  const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', round: 'string', type: 'string'
      };

      // Accepted Values for Parameters
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'round', 'type'];
      const validRound = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.round && !validRound.test(queries.round)) {
        callback(400, _this.text.websiteValidationText1('round', '<uuid>'));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Transactions Data
      const transaction = [_this.master.current.transactions.selectCurrentTransactionsMain(pool, queries)];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups.rows);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleCurrentTransactions', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleCurrentTransactions');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleCurrentTransactions', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleCurrentTransactions');
      }
    };

    // Handle Workers Queries
    this.handleCurrentWorkers = function (pool, queries, callback) {
  try {
  // Validated Query Types
  const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', miner: 'string', worker: 'string',
        efficiency: 'number', effort: 'number', hashrate: 'number', invalid: 'number',
        solo: 'boolean', stale: 'number', type: 'string', valid: 'number'
      };

      // Accepted Values for Parameters
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'miner', 'worker', 'efficiency', 'effort', 'hashrate', 'type'];
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Workers Data
      const transaction = [_this.master.current.workers.selectCurrentWorkersMain(pool, queries)];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups.rows);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleCurrentWorkers', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleCurrentWorkers');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleCurrentWorkers', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleCurrentWorkers');
      }
    };

    // Handle Blocks Queries
    this.handleHistoricalBlocks = function (pool, queries, callback) {
  try {
  // Validated Query Types
  const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', submitted: 'number', timestamp: 'number', miner: 'string',
        worker: 'string', category: 'string', confirmations: 'number', difficulty: 'number',
        hash: 'string', height: 'number', identifier: 'string', luck: 'number',
        reward: 'number', round: 'string', solo: 'boolean', transaction: 'string',
        type: 'string'
      };

      // Accepted Values for Parameters
      const validCategories = ['pending', 'immature', 'generate', 'orphan', 'confirmed'];
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'miner', 'worker', 'category', 'confirmations', 'difficulty',
        'hash', 'height', 'identifier', 'luck', 'reward', 'round', 'solo', 'transaction', 'type'];
      const validRound = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.category && !validCategories.includes(queries.category)) {
        callback(400, _this.text.websiteValidationText1('category', validCategories.join(', ')));
        return;
      } else if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.round && !validRound.test(queries.round)) {
        callback(400, _this.text.websiteValidationText1('round', '<uuid>'));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Blocks Data
      const transaction = [_this.master.historical.blocks.selectHistoricalBlocksMain(pool, queries)];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups.rows);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleHistoricalBlocks', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleHistoricalBlocks');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleHistoricalBlocks', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleHistoricalBlocks');
      }
    };

    // Handle Metadata Queries
    this.handleHistoricalMetadata = function (pool, queries, callback) {
      try {

      // Validated Query Types
      const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', blocks: 'number', efficiency: 'number',
        effort: 'number', hashrate: 'number', invalid: 'number', miners: 'number',
        stale: 'number', type: 'string', valid: 'number', work: 'number', workers: 'number'
      };

      // Accepted Values for Parameters
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'blocks', 'efficiency', 'effort', 'hashrate', 'invalid', 'miners',
        'stale', 'type', 'valid', 'work', 'workers'];
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Metadata Data
      const transaction = [_this.master.historical.metadata.selectHistoricalMetadataMain(pool, queries)];
      if (_this.logger && typeof _this.logger.debug === 'function') {
        _this.logger.debug('Endpoints', 'handleHistoricalMetadata', ['Calling executor with transaction:', transaction]);
      }
      _this.master.executor(transaction)
        .then((lookups) => {
          if (_this.logger && typeof _this.logger.debug === 'function') {
            _this.logger.debug('Endpoints', 'handleHistoricalMetadata', ['Executor called, lookups:', lookups]);
          }
          callback(200, lookups.rows);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleHistoricalMetadata', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleHistoricalMetadata');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleHistoricalMetadata', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleHistoricalMetadata');
      }
    };

    // Handle Miners Queries
    this.handleHistoricalMiners = function (pool, queries, callback) {
  try {
  // Validated Query Types
  const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', miner: 'string', efficiency: 'number',
        effort: 'number', hashrate: 'number', invalid: 'number', stale: 'number',
        type: 'string', valid: 'number'
      };

      // Accepted Values for Parameters
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'miner', 'efficiency', 'effort', 'hashrate', 'type'];
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Miners Data
      const transaction = [_this.master.historical.miners.selectHistoricalMinersMain(pool, queries)];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups[0]?.rows ?? []);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleHistoricalMiners', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleHistoricalMiners');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleHistoricalMiners', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleHistoricalMiners');
      }
    };

    // Handle Network Queries
    this.handleHistoricalNetwork = function (pool, queries, callback) {
  try {
  // Validated Query Types
  const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', difficulty: 'number', hashrate: 'number',
        height: 'number', type: 'string'
      };

      // Accepted Values for Parameters
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'difficulty', 'hashrate', 'height', 'type'];
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Network Data
      const transaction = [_this.master.historical.network.selectHistoricalNetworkMain(pool, queries)];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups[0]?.rows ?? []);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleHistoricalNetwork', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleHistoricalNetwork');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleHistoricalNetwork', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleHistoricalNetwork');
      }
    };

    // Handle Payments Queries
    this.handleHistoricalPayments = function (pool, queries, callback) {
  try {
  // Validated Query Types
  const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', miner: 'string', amount: 'number',
        transaction: 'string', type: 'string'
      };

      // Accepted Values for Parameters
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'miner', 'amount', 'transaction', 'type'];
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Payments Data
      const transaction = [_this.master.historical.payments.selectHistoricalPaymentsMain(pool, queries)];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups[0]?.rows ?? []);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleHistoricalPayments', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleHistoricalPayments');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleHistoricalPayments', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleHistoricalPayments');
      }
    };

    // Handle Rounds Queries
    this.handleHistoricalRounds = function (pool, queries, callback) {
  try {
  // Validated Query Types
  const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', miner: 'string', worker: 'string',
        identifier: 'string', invalid: 'number', round: 'string', solo: 'boolean',
        stale: 'number', times: 'number', type: 'string', valid: 'number',
        work: 'number'
      };

      // Accepted Values for Parameters
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'miner', 'worker', 'identifier', 'invalid', 'round', 'solo',
        'stale', 'times', 'type', 'valid', 'work'];
      const validRound = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.round && (!validRound.test(queries.round))) {
        callback(400, _this.text.websiteValidationText1('round', '<uuid>'));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Rounds Data
      const transaction = [_this.master.historical.rounds.selectHistoricalRoundsMain(pool, queries)];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups[0]?.rows ?? []);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleHistoricalRounds', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleHistoricalRounds');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleHistoricalRounds', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleHistoricalRounds');
      }
    };

    // Handle Transactions Queries
    this.handleHistoricalTransactions = function (pool, queries, callback) {
  try {
  // Validated Query Types
  const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', amount: 'number', transaction: 'string',
        type: 'string'
      };

      // Accepted Values for Parameters
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'amount', 'transaction', 'type'];
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Transactions Data
      const transaction = [_this.master.historical.transactions.selectHistoricalTransactionsMain(pool, queries)];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups[0]?.rows ?? []);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleHistoricalTransactions', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleHistoricalTransactions');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleHistoricalTransactions', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleHistoricalTransactions');
      }
    };

    // Handle Workers Queries
    this.handleHistoricalWorkers = function (pool, queries, callback) {
  try {
  // Validated Query Types
  const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', miner: 'string', worker: 'string',
        efficiency: 'number', effort: 'number', hashrate: 'number', invalid: 'number',
        solo: 'boolean', stale: 'number', type: 'string', valid: 'number'
      };

      // Accepted Values for Parameters
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'miner', 'worker', 'efficiency', 'effort', 'hashrate', 'type'];
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Workers Data
      const transaction = [_this.master.historical.workers.selectHistoricalWorkersMain(pool, queries)];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups[0]?.rows ?? []);
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleHistoricalWorkers', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleHistoricalWorkers');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleHistoricalWorkers', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleHistoricalWorkers');
      }
    };

    // Handle Blocks Queries
    this.handleCombinedBlocks = function (pool, queries, callback) {
  try {
  // Validated Query Types
  const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', submitted: 'number', miner: 'string',
        worker: 'string', category: 'string', confirmations: 'number', difficulty: 'number',
        hash: 'string', height: 'number', identifier: 'string', luck: 'number',
        reward: 'number', round: 'string', solo: 'boolean', transaction: 'string',
        type: 'string'
      };

      // Accepted Values for Parameters
      const validCategories = ['pending', 'immature', 'generate', 'orphan', 'confirmed'];
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'miner', 'worker', 'category', 'confirmations', 'difficulty',
        'hash', 'height', 'identifier', 'luck', 'reward', 'round', 'solo', 'transaction', 'type'];
      const validRound = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.category && !validCategories.includes(queries.category)) {
        callback(400, _this.text.websiteValidationText1('category', validCategories.join(', ')));
        return;
      } else if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.round && !validRound.test(queries.round)) {
        callback(400, _this.text.websiteValidationText1('round', '<uuid>'));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Blocks Data
      const transaction = [
        _this.master.current.blocks.selectCurrentBlocksMain(pool, queries),
        _this.master.historical.blocks.selectHistoricalBlocksMain(pool, queries)
      ];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups.map((data, idx) => {
            const partition = idx === 0 ? 'current' : 'historical';
            return (data?.rows ?? []).map((obj) => ({ ...obj, partition: partition }));
          }).flat(1));
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleCombinedBlocks', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleCombinedBlocks');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleCombinedBlocks', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleCombinedBlocks');
      }
    };

    // Handle Rounds Queries
    this.handleCombinedRounds = function (pool, queries, callback) {
  try {
  // Validated Query Types
  const parameters = {
        limit: 'special', offset: 'special', order: 'special',
        direction: 'special', timestamp: 'number', miner: 'string', worker: 'string',
        identifier: 'string', invalid: 'number', round: 'string', solo: 'boolean',
        stale: 'number', times: 'number', type: 'string', valid: 'number',
        work: 'number'
      };

      // Accepted Values for Parameters
      const validDirection = ['ascending', 'descending'];
      const validOrder = ['timestamp', 'miner', 'worker', 'identifier', 'invalid', 'round', 'solo',
        'stale', 'times', 'type', 'valid', 'work'];
      const validRound = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
      const validType = ['primary', 'auxiliary'];

      // General Parameter Validation
      for (let i = 0; i < Object.keys(queries).length; i++) {
        const query = Object.keys(queries)[i];
        if (!utils.handleValidation(queries[query], parameters[query])) {
          const expected = parameters[query] || 'unknown';
          callback(400, _this.text.websiteValidationText1(query, `<${expected}>`));
          return;
        }
      }

      // Specific Parameter Validation
      if (queries.direction && !validDirection.includes(queries.direction)) {
        callback(400, _this.text.websiteValidationText1('direction', validDirection.join(', ')));
        return;
      } else if (queries.limit && !Number(queries.limit)) {
        callback(400, _this.text.websiteValidationText1('limit', '<number>'));
        return;
      } else if (queries.offset && !Number(queries.offset)) {
        callback(400, _this.text.websiteValidationText1('offset', '<number>'));
        return;
      } else if (queries.order && !validOrder.includes(queries.order)) {
        callback(400, _this.text.websiteValidationText1('order', validOrder.join(', ')));
        return;
      } else if (queries.round && (queries.round !== 'current' && !validRound.test(queries.round))) {
        callback(400, _this.text.websiteValidationText1('round', 'current, <uuid>'));
        return;
      } else if (queries.type && !validType.includes(queries.type)) {
        callback(400, _this.text.websiteValidationText1('type', validType.join(', ')));
        return;
      }

      // Make Request and Return Rounds Data
      const transaction = [
        _this.master.current.rounds.selectCurrentRoundsMain(pool, queries),
        _this.master.historical.rounds.selectHistoricalRoundsMain(pool, queries)
      ];
      _this.master.executor(transaction)
        .then((lookups) => {
          callback(200, lookups.map((data, idx) => {
            const partition = idx === 0 ? 'current' : 'historical';
            return (data?.rows ?? []).map((obj) => ({ ...obj, partition: partition }));
          }).flat(1));
        })
        .catch((err) => {
          if (_this.logger && typeof _this.logger.error === 'function') {
            _this.logger.error('Endpoints', 'handleCombinedRounds', err.stack || err.toString());
          }
          callback(500, 'Internal server error in handleCombinedRounds');
        });
      } catch (err) {
        if (_this.logger && typeof _this.logger.error === 'function') {
          _this.logger.error('Endpoints', 'handleCombinedRounds', err.stack || err.toString());
        }
        callback(500, 'Internal server error in handleCombinedRounds');
      }
    };
  }
}

export default Endpoints;

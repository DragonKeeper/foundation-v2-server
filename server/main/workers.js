import Checks from './checks.js';
import Payments from './payments.js';
import Rounds from './rounds.js';
const { statistics } = require('./statistics.js');
import Stratum from './stratum.js';

////////////////////////////////////////////////////////////////////////////////

// Main Workers Function
const Workers = function (logger, client) {
  const _this = this;
  this.logger = logger;
  this.client = client;
  this.stratums = {};
  this.configs = JSON.parse(process.env.configs);
  this.configMain = JSON.parse(process.env.configMain);

  // Build Promise from Input Configuration
  /* istanbul ignore next */
  this.handlePromises = function(pool) {
    return new Promise((resolve) => {
      const config = _this.configs[pool];
      import('foundation-v2-' + config.template).then((module) => {
        const template = module.default;

        // Build Out Individual Modules
        const checks = new Checks(_this.logger, _this.client, config, _this.configMain);
        const payments = new Payments(_this.logger, _this.client, config, _this.configMain);
        const rounds = new Rounds(_this.logger, _this.client, config, _this.configMain);
        const statistics = new Statistics(_this.logger, _this.client, config, _this.configMain, template);
        const stratum = new Stratum(_this.logger, _this.client, config, _this.configMain, template);

        // Initialize Individual Modules
        stratum.setupStratum(() => {
          checks.setupChecks(stratum, () => {
            payments.setupPayments(stratum, () => {
              rounds.setupRounds(() => {});
              statistics.setupStatistics(() => {});
            });
          });
          resolve(stratum);
        });
      });
    });
  };

  // Start Worker Capabilities
  this.setupWorkers = function(callback) {
    const keys = Object.keys(_this.configs);
    const promises = keys.map((pool) => _this.handlePromises(pool));
    Promise.all(promises).then((stratums) => {
      stratums.forEach((stratum) => _this.stratums[stratum.config.name] = stratum);
      callback();
    });
  };
};

export default Workers;

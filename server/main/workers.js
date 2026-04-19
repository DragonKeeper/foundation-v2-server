import Checks from './checks.js';
import Payments from './payments.js';
import Rounds from './rounds.js';
import { Statistics } from './statistics.js';
import Stratum from './stratum.js';

////////////////////////////////////////////////////////////////////////////////

// Main Workers Function
class Workers {
  constructor(logger, client) {
    const _this = this;
    this.logger = logger;
    this.client = client;
    this.stratums = {};
    this.configs = JSON.parse(process.env.configs);
    this.configMain = JSON.parse(process.env.configMain);

    // Build Promise from Input Configuration
    /* istanbul ignore next */
    this.handlePromises = function (pool) {
      return (async () => {
        _this.logger.debug('Workers', pool, ['Starting handlePromises for pool']);
        const config = _this.configs[pool];
        const module = await import('foundation-v2-' + config.template);
        const template = module.default;

        // Build Out Individual Modules
        _this.logger.debug('Workers', pool, ['Instantiating modules']);
        const checks = new Checks(_this.logger, _this.client, config, _this.configMain);
        const payments = new Payments(_this.logger, _this.client, config, _this.configMain);
        const rounds = new Rounds(_this.logger, _this.client, config, _this.configMain);
        const statistics = new Statistics(_this.logger, _this.client, config, _this.configMain, template);
        const stratum = new Stratum(_this.logger, _this.client, config, _this.configMain, template);

        // Initialize Individual Modules
        await stratum.setupStratum();
        await new Promise((resolve) => checks.setupChecks(stratum, resolve));
        await new Promise((resolve) => payments.setupPayments(stratum, resolve));
        await new Promise((resolve) => rounds.setupRounds(resolve));
        await new Promise((resolve) => statistics.setupStatistics(resolve));
        return stratum;
      })();
    };

    // Start Worker Capabilities
    this.setupWorkers = function (callback) {
      const keys = Object.keys(_this.configs);
      const promises = keys.map((pool) => _this.handlePromises(pool));
      Promise.all(promises).then((stratums) => {
        stratums.forEach((stratum) => _this.stratums[stratum.config.name] = stratum);
        callback();
      });
    };
  }
}

export default Workers;

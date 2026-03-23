import Logger from '../main/logger.js';
import Stratum from '../main/stratum.js';
import config from '../../configs/pools/example.js';
import configMain from '../../configs/main/example.js';

config.primary.address = 'ltc1qya20xua0rgq9jdteffkt83xr4aq082gruc2gry';
config.primary.recipients[0].address = 'LRJeNFbLC28wA4hYfiV2Dyjb6hK9pLTD5y';
config.primary.daemons = [{
  'host': '127.0.0.1',
  'port': '9332',
  'username': 'foundation',
  'password': 'foundation'
}];

////////////////////////////////////////////////////////////////////////////////

describe('Test stratum functionality', () => {

  let configCopy, configMainCopy;
  beforeEach(() => {
    configCopy = JSON.parse(JSON.stringify(config));
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of stratum', () => {
    const logger = new Logger(configMainCopy);
    const stratum = new Stratum(logger, null, configCopy, configMainCopy);
    expect(typeof stratum.config).toBe('object');
    expect(typeof stratum.setupStratum).toBe('function');
  });
});

import Builder from '../main/builder.js';
import Logger from '../main/logger.js';
import configMain from '../../configs/main/example.js';
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test builder functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of builder', () => {
    const builder = new Builder(logger, configMainCopy);
    expect(typeof builder.configMain).toBe('object');
    expect(typeof builder.createPoolWorkers).toBe('function');
    expect(typeof builder.setupPoolWorkers).toBe('function');
  });
});

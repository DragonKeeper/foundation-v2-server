import Logger from '../main/logger.js';
import Threads from '../main/threads.js';
import configMain from '../../configs/main/example.js';
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

describe('Test threads functionality', () => {

  let configMainCopy;
  let mockClient;
  let mockTemplate;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
    mockClient = {
      master: {
        commands: {
          executor: () => {},
          current: {},
          historical: {}
        }
      },
      worker: {
        commands: {
          schema: {
            handleSchema: (configs, cb) => cb()
          }
        }
      }
    };
    mockTemplate = {
      algorithms: {
        sha256d: { multiplier: 1 }
      }
    };
    process.env.configs = JSON.stringify({
      pool1: {
        name: 'pool1',
        template: 'default',
        primary: { coin: { algorithm: 'sha256d' }, checks: { enabled: false } },
        settings: { window: { hashrate: 60000, inactive: 60000, updates: 60000 }, interval: { statistics: 60000, historical: 60000 } }
      }
    });
    process.env.configMain = JSON.stringify(configMainCopy);
  });

  test('Test initialization of threads', () => {
    const threads = new Threads(logger, mockClient, configMainCopy);
    expect(typeof threads.configMain).toBe('object');
    expect(typeof threads.setupThreads).toBe('function');
  });
});

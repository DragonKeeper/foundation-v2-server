import Commands from '../../main/master/commands.js';
import Logger from '../../../server/main/logger.js';
import configMain from '../../../configs/main/example.js';
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

function mockClient(error, results) {
  let requests = 0;
  return {
    query: () => {
      if (requests >= 1) return Promise.resolve(results);
      requests += 1;
      if (error) return Promise.reject(error);
      return Promise.resolve(results);
    },
  };
}

////////////////////////////////////////////////////////////////////////////////

describe('Test command functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of commands', () => {
    const client = mockClient();
    const commands = new Commands(logger, client, configMainCopy);
    expect(typeof commands.configMain).toBe('object');
    expect(typeof commands.executor).toBe('function');
    expect(typeof commands.blockTimeSummary).toBe('object');
  });

  test('Test executor functionality [1]', async () => {
    const client = mockClient(null, ['test']);
    const commands = new Commands(logger, client, configMainCopy);
    const results = await commands.executor(['test']);
    expect(results[0]).toBe('test');
  });

  test('Test executor functionality [2]', async () => {
    const client = mockClient(new Error('retry'), ['test']);
    const commands = new Commands(logger, client, configMainCopy);
    const results = await commands.executor(['test']);
    expect(results[0]).toBe('test');
    expect(commands.retries).toBe(0);
  });

  test('Test executor functionality [3]', async () => {
    const client = mockClient(new Error('fail'), null);
    const commands = new Commands(logger, client, configMainCopy);
    commands.retries = 3;
    await expect(commands.executor(['test'])).rejects.toThrow('fail');
  });
});

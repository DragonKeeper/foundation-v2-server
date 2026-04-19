import Schema from '../../main/worker/schema.js';
import Logger from '../../../server/main/logger.js';
import configMain from '../../../configs/main/example.js';
const logger = new Logger(configMain);

////////////////////////////////////////////////////////////////////////////////

function mockExecutor(results, expected) {
  const normalize = (value) => value
    .replace(/\bIF NOT EXISTS\b/g, '')
    .replace(/\s+\)/g, ')')
    .replace(/\s+/g, ' ')
    .trim();
  const expectedStatements = (expected || '')
    .split(';')
    .map((statement) => normalize(statement))
    .filter(Boolean);
  let statementIndex = 0;

  return async (expecteds, callback) => {
    if (expectedStatements.length >= 1) {
      expect(normalize(expecteds[0])).toBe(`${expectedStatements[statementIndex]};`);
      statementIndex += 1;
    }
    if (callback) callback(results);
    return results;
  };
}

////////////////////////////////////////////////////////////////////////////////

describe('Test schema functionality', () => {

  let configMainCopy;
  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of schema', () => {
    const executor = mockExecutor();
    const schema = new Schema(logger, executor, configMainCopy);
    expect(typeof schema.configMain).toBe('object');
    expect(typeof schema.selectSchema).toBe('function');
  });

  test('Test schema functionality [1]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT 1 FROM pg_namespace
        WHERE nspname = 'Pool-Main');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectSchema('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [2]', async () => {
    const expected = 'CREATE SCHEMA IF NOT EXISTS "Pool-Main";';
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    await schema.createSchema('Pool-Main', () => {});
  });

  test('Test schema functionality [3]', () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'local_shares');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    schema.selectLocalShares('Pool-Main', (results) => {
      expect(results).toBe(true);
    });
  });

  test('Test schema functionality [4]', async () => {
    const expected = `
      CREATE TABLE "Pool-Main".local_shares(
        id BIGSERIAL PRIMARY KEY,
        error VARCHAR NOT NULL DEFAULT 'unknown',
        uuid VARCHAR NOT NULL DEFAULT 'unknown',
        timestamp BIGINT NOT NULL DEFAULT -1,
        submitted BIGINT NOT NULL DEFAULT -1,
        ip VARCHAR NOT NULL DEFAULT '0.0.0.0',
        port INT NOT NULL DEFAULT -1,
        addrprimary VARCHAR NOT NULL DEFAULT 'unknown',
        addrauxiliary VARCHAR NOT NULL DEFAULT 'unknown',
        blockdiffprimary FLOAT NOT NULL DEFAULT -1,
        blockdiffauxiliary FLOAT NOT NULL DEFAULT -1,
        blockvalid BOOLEAN NOT NULL DEFAULT false,
        blocktype VARCHAR NOT NULL DEFAULT 'share',
        clientdiff FLOAT NOT NULL DEFAULT -1,
        hash VARCHAR NOT NULL DEFAULT 'unknown',
        height INT NOT NULL DEFAULT -1,
        identifier VARCHAR NOT NULL DEFAULT 'master',
        reward FLOAT NOT NULL DEFAULT 0,
        sharediff FLOAT NOT NULL DEFAULT -1,
        sharevalid BOOLEAN NOT NULL DEFAULT false,
        transaction VARCHAR NOT NULL DEFAULT 'unknown',
        CONSTRAINT local_shares_unique UNIQUE (uuid));`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
      await schema.createLocalShares('Pool-Main', () => {});
  });

  test('Test schema functionality [5]', async () => {
    const results = { rows: [{ exists: true }]};
    const expected = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'Pool-Main'
        AND table_name = 'local_transactions');`;
    const executor = mockExecutor(results, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    await expect(schema.selectLocalTransactions('Pool-Main')).resolves.toBe(true);
  });

  test('Test schema functionality [6]', async () => {
    const expected = `
      CREATE TABLE "Pool-Main".local_transactions(
        id BIGSERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL DEFAULT -1,
        uuid VARCHAR NOT NULL DEFAULT 'unknown',
        type VARCHAR NOT NULL DEFAULT 'primary',
        CONSTRAINT local_transactions_unique UNIQUE (uuid));`;
    const executor = mockExecutor(null, expected);
    const schema = new Schema(logger, executor, configMainCopy);
    await schema.createLocalTransactions('Pool-Main', () => {});
  });
});

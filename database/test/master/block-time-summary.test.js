import BlockTimeSummary from '../../main/master/block-time-summary.js';
import Logger from '../../../server/main/logger.js';
import configMain from '../../../configs/main/example.js';

const logger = new Logger(configMain);

describe('Test block time summary functionality', () => {
  let configMainCopy;

  beforeEach(() => {
    configMainCopy = JSON.parse(JSON.stringify(configMain));
  });

  test('Test initialization of block time summary', () => {
    const blockTimeSummary = new BlockTimeSummary(logger, configMainCopy);
    expect(typeof blockTimeSummary.selectBlockTimeSummaryMain).toBe('function');
    expect(typeof blockTimeSummary.refreshBlockTimeSummaryMain).toBe('function');
  });

  test('Test refresh block time summary query', () => {
    const blockTimeSummary = new BlockTimeSummary(logger, configMainCopy);
    const query = blockTimeSummary.refreshBlockTimeSummaryMain('Pool-Main', 123456789);

    expect(query).toContain('INSERT INTO "Pool-Main".block_time_summary');
    expect(query).toContain('current_blocks_solo_average');
    expect(query).toContain('historical_blocks_shared_average');
    expect(query).toContain('combined_shared_average');
    expect(query).toContain('123456789');
  });
});
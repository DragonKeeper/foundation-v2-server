import Text from '../../../locales/index.js';

////////////////////////////////////////////////////////////////////////////////

// Main Block Time Summary Function
class BlockTimeSummary {
  constructor(logger, configMain) {

    this.logger = logger;
    this.configMain = configMain;
    this.text = Text[configMain.language];

    this.selectBlockTimeSummaryMain = function (pool) {
      return `SELECT * FROM "${pool}".block_time_summary ORDER BY label ASC;`;
    };

    this.refreshBlockTimeSummaryMain = function (pool, timestamp) {
      return `\
      WITH current_blocks_gaps AS (\
        SELECT\
          solo,\
          (timestamp - LAG(timestamp) OVER (PARTITION BY solo ORDER BY timestamp)) / 1000.0 AS gap_seconds\
        FROM "${pool}".current_blocks\
        WHERE timestamp > 0\
      ),\
      historical_blocks_gaps AS (\
        SELECT\
          solo,\
          (timestamp - LAG(timestamp) OVER (PARTITION BY solo ORDER BY timestamp)) / 1000.0 AS gap_seconds\
        FROM "${pool}".historical_blocks\
        WHERE timestamp > 0\
      ),\
      table_averages AS (\
        SELECT\
          CASE WHEN solo THEN 'current_blocks_solo_average' ELSE 'current_blocks_shared_average' END AS label,\
          solo,\
          ROUND(AVG(gap_seconds)::numeric, 2) AS avg_gap_seconds\
        FROM current_blocks_gaps\
        WHERE gap_seconds IS NOT NULL\
        GROUP BY solo\
        UNION ALL\
        SELECT\
          CASE WHEN solo THEN 'historical_blocks_solo_average' ELSE 'historical_blocks_shared_average' END AS label,\
          solo,\
          ROUND(AVG(gap_seconds)::numeric, 2) AS avg_gap_seconds\
        FROM historical_blocks_gaps\
        WHERE gap_seconds IS NOT NULL\
        GROUP BY solo\
      ),\
      combined_averages AS (\
        SELECT\
          CASE WHEN solo THEN 'combined_solo_average' ELSE 'combined_shared_average' END AS label,\
          ROUND(AVG(avg_gap_seconds)::numeric, 2) AS avg_gap_seconds\
        FROM table_averages\
        GROUP BY solo\
      ),\
      final_rows AS (\
        SELECT label, avg_gap_seconds FROM table_averages\
        UNION ALL\
        SELECT label, avg_gap_seconds FROM combined_averages\
      )\
      INSERT INTO "${pool}".block_time_summary (\
        label, avg_gap_seconds, updated_at)\
      SELECT\
        label,\
        avg_gap_seconds,\
        ${timestamp}\
      FROM final_rows\
      ON CONFLICT ON CONSTRAINT block_time_summary_unique\
      DO UPDATE SET\
        avg_gap_seconds = EXCLUDED.avg_gap_seconds,\
        updated_at = EXCLUDED.updated_at;`;
    };
  }
}

export default BlockTimeSummary;
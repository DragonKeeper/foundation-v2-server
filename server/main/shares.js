import Text from '../../locales/index.js';
import { v4 as uuidv4 } from 'uuid';

////////////////////////////////////////////////////////////////////////////////

// Main Shares Function
class Shares {
  constructor(logger, client, config, configMain) {

    const _this = this;
    this.logger = logger;
    this.client = client;
    this.config = config;
    this.configMain = configMain;
    this.pool = config.name;
    this.text = Text[configMain.language];

    // Stratum Variables
    process.setMaxListeners(0);
    this.forkId = process.env.forkId;

    // Client Handlers
    this.worker = {
      executor: _this.client.worker.commands.executor,
      local: _this.client.worker.commands.local
    };

    // Handle Share Updates
    this.handleLocalShares = function (shareData, shareValid, blockValid) {

      // Calculate Features of Shares
      const identifier = uuidv4();
      const error = shareData.error || '';
      const submitted = shareData.submitTime || Date.now();
      const transaction = shareData.transaction || '';

      // Return Share Updates
      return {
        error: error,
        uuid: identifier,
        timestamp: Date.now(),
        submitted: submitted,
        ip: shareData.ip || '0.0.0.0',
        port: parseFloat(shareData.port || '0'),
        addrprimary: shareData.addrPrimary || '',
        addrauxiliary: shareData.addrAuxiliary || '',
        blockdiffprimary: shareData.blockDiffPrimary || -1,
        blockdiffauxiliary: shareData.blockDiffAuxiliary || -1,
        blockvalid: blockValid || false,
        blocktype: shareData.blockType || 'share',
        clientdiff: shareData.difficulty || -1,
        hash: shareData.hash || '',
        height: shareData.height || -1,
        identifier: shareData.identifier || '',
        reward: shareData.reward || -1,
        sharediff: shareData.shareDiff || -1,
        sharevalid: shareValid || false,
        transaction: transaction || '',
      };
    };

    // Handle Share/Block Updates
    this.handleShares = function (shareData, shareValid, blockValid, callback) {
      _this.logger.debug('Shares', _this.config?.name || _this.pool, `handleShares ENTRY: shareValid=${shareValid}, blockValid=${blockValid}, addrPrimary=${shareData.addrPrimary}, addrAuxiliary=${shareData.addrAuxiliary}, diff=${shareData.difficulty}, error=${shareData.error}`);

      // Build Combined Transaction
      const shares = _this.handleLocalShares(shareData, shareValid, blockValid);
      const transaction = [
        'BEGIN;',
        _this.worker.local.shares.insertLocalSharesMain(_this.pool, [shares]),
        'COMMIT;'
      ];
      // Insert Work into Database
      try {
        _this.worker.executor(transaction, (result) => {
          callback();
        });
      } catch (err) {
        _this.logger.error('Shares', _this.config?.name || _this.pool, `handleShares DB executor ERROR: ${err && err.stack ? err.stack : err}`);
        callback();
      }
    };

    // Handle Share/Block Submissions
    this.handleSubmissions = function (shareData, shareValid, blockValid, callback) {

      // Calculate Share Features
      let shareType = 'valid';
      if (shareData.error && shareData.error === 'job not found') shareType = 'stale';
      else if (!shareValid || shareData.error) shareType = 'invalid';

      // Add Share/Block Data to Local Table
      _this.handleShares(shareData, shareValid, blockValid, () => {
        const lines = [(shareType === 'valid') ?
          _this.text.sharesSubmissionsText1(
            shareData.difficulty, shareData.shareDiff, shareData.addrPrimary, shareData.ip) :
          _this.text.sharesSubmissionsText2(shareData.error, shareData.addrPrimary, shareData.ip)];
        if (shareType === 'valid') {
            _this.logger.log('Shares', _this.config?.name || _this.pool, lines);
        } else {
          if (typeof _this.logger.error === 'function') {
            _this.logger.error('Shares', _this.config?.name || _this.pool, lines);
          }
        }
        callback();
      });
    };
  }
}

export default Shares;

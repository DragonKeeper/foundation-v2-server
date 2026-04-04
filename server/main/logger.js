 import colors from 'colors';
import * as utils from './utils.js';
////////////////////////////////////////////////////////////////////////////////

// Main Logger Function
class Logger {
  constructor(configMain) {

    const _this = this;
    this.configMain = configMain;

    // Logger Variables
    this.logLevel = utils.loggerSeverity[_this.configMain.logger.logLevel];
    this.logColors = _this.configMain.logger.logColors;

    // Start Logging Capabilities
    this.logText = function (severity, system, component, lines, separator) {

      // Log Level is too Low to be Reported
      if (utils.loggerSeverity[severity] < _this.logLevel) return;

      // Structure Log Message
      let logString = '';
      [].concat(lines).forEach((text, idx) => {
        // Stringify non-string log lines for better debug output
        const safeText = (typeof text === 'string') ? text : JSON.stringify(text, null, 2);
        if (_this.logColors) {
          logString += utils.loggerColors(severity, `[${new Date().toLocaleString()}] `);
          if (severity) logString += utils.loggerColors(severity, `[${severity.toUpperCase()}] `).bold;
          if (typeof component === 'string' && component) logString += utils.loggerColors(severity, `(${component}) `);
          if (system) logString += (`foundation:${system.toLowerCase()} - `).bold.grey + safeText.grey;
          if (idx + 1 !== lines.length) logString += '\n';
        } else {
          logString += `${new Date().toLocaleString()} `;
          if (severity) logString += `[${severity.toUpperCase()}] `;
          if (typeof component === 'string' && component) logString += `(${component}) `;
          if (system) logString += `foundation:${system.toLowerCase()} - ${safeText}`;
          if (idx + 1 !== lines.length) logString += '\n';
        }
      });

      // Structure Separator
      const width = process.stdout.columns || 100;
      let logSeparator = new Array(width).fill('-').join('');
      if (_this.logColors) logSeparator = logSeparator.grey;

      // Send Log Message to Console
      console.log(logString);
      if (separator) console.log(logSeparator);
    };

    // Manage Logger Events
    Object.keys(utils.loggerSeverity).forEach((logType) => {
      _this[logType] = function () {
        const args = Array.prototype.slice.call(arguments, 0);
        args.unshift(logType);
        _this.logText.apply(this, args);
      };
    });
  }
}

export default Logger;

import os from 'os';

////////////////////////////////////////////////////////////////////////////////

export function executeExecutorTransaction(executor, transaction, callback) {
  let settled = false;

  const handleResult = (results) => {
    if (settled) return;
    settled = true;
    callback(null, results);
  };

  const handleError = (error) => {
    if (settled) return;
    settled = true;
    callback(error);
  };

  try {
    const result = executor(transaction, handleResult);
    if (result && typeof result.then === 'function') {
      result.then(handleResult).catch(handleError);
    } else if (result !== undefined) {
      handleResult(result);
    }
  } catch (error) {
    handleError(error);
  }
}

export function createPromiseExecutor(executor) {
  return (commands) => new Promise((resolve, reject) => {
    executeExecutorTransaction(executor, commands, (error, results) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
}

export function checkSoloMining(poolConfig, data) {
  let isSoloMining = false;
  const activePort = poolConfig.ports.filter((port) => port.port === data.port);
  if (activePort.length >= 1) {
    isSoloMining = activePort[0].type === 'solo';
  }
  return isSoloMining;
}

// Count Number of Process Forks
/* istanbul ignore next */
export function countProcessForks(configMain) {
  if (!configMain.clustering || !configMain.clustering.enabled) {
    return 1;
  } else if (configMain.clustering.forks === 'auto') {
    return os.cpus().length;
  } else if (!configMain.clustering.forks || isNaN(configMain.clustering.forks)) {
    return 1;
  }
  return configMain.clustering.forks;
}

// Handle Query Validator
export function handleValidation(parameter, type) {
  switch (type) {
    case 'boolean':
      return validateBooleans(parameter);
    case 'number':
      return validateNumbers(parameter);
    case 'string':
      return validateStrings(parameter);
    case 'special':
      return true;
    default:
      return false;
  }
}

// Indicate Severity By Colors
export function loggerColors(severity, text) {
  switch (severity) {
    case 'debug':
      return text.blue;
    case 'log':
      return text.green;
    case 'warning':
      return text.yellow;
    case 'special':
      return text.cyan;
    case 'error':
      return text.red;
    default:
      return text.italic;
  }
}

// Severity Mapping Values
export const loggerSeverity = {
  debug: 1,
  log: 2,
  warning: 3,
  special: 4,
  error: 5,
};

// Round to # of Digits Given
export function roundTo(n, digits) {
  if (typeof digits !== 'number' || isNaN(digits)) {
    digits = 0;
  }
  const multiplicator = Math.pow(10, digits);
  n = parseFloat((n * multiplicator).toFixed(11));
  const test = Math.round(n) / multiplicator;
  return +(test.toFixed(digits));
}

// Validate Booleans
export function validateBooleans(parameter) {
  return parameter === true || parameter === false || parameter === 'true' || parameter === 'false';
}

// Validate Numbers
export function validateNumbers(parameter) {
  const accepted = ['lt', 'le', 'gt', 'ge', 'ne'];
  const condition = parameter.slice(0, 2);
  const remainder = parameter.slice(2);
  if (accepted.includes(condition) && !isNaN(Number(remainder))) return true;
  else if (!isNaN(Number(parameter))) return true;
  else return false;
}

// Validate Parameters
export function validateParameters(parameter) {
  if (parameter.length >= 1) {
    parameter = parameter.toString().replace(/[^a-zA-Z0-9.-]+/g, '');
  }
  return parameter;
}

// Validate Strings
export function validateStrings(parameter) {
  return /^[a-zA-Z0-9.-]+$/g.test(parameter);
}

var logger = require('./logger');

var CHECKPOINTS_COUNTER = 1;

function announceCheckpoint(checkpoint){
  logger.info('\n=================================================================================================');
  logger.info(`# ${CHECKPOINTS_COUNTER} ${checkpoint}`);
  logger.info('=================================================================================================\n');
  CHECKPOINTS_COUNTER = CHECKPOINTS_COUNTER + 1;
};

function print(message, paddingTop, paddingBottom) {
  var _message = message;

  if (paddingTop) {
    _message = `\n ${_message}`;
  }

  if (paddingBottom) {
    _message = `${_message} \n`;
  }

  logger.info(_message);
}

function printItem(message, paddingTop, paddingBottom, level) {
  var _message = `    → ${message}`;

  if (level === 0) {
    _message = `    → ⚪️ INFO: ${message}`;
  }

  if (level === 1) {
    _message = `    → 🟡 WARN: ${message}`;
  }

  if (level === 2) {
    _message = `    → 🔴 ERROR: ${message}`;
  }

  if (level === 3) {
    _message = `    → 🟢 SUCCESS: ${message}`;
  }

  if (paddingTop) {
    _message = `\n${_message}`;
  }

  if (paddingBottom) {
    _message = `${_message}\n`;
  }

  logger.info(_message);
}

module.exports = {
  announceCheckpoint,
  print,
  printItem
};

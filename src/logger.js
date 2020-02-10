let debugLogger = function(){};

if (process.env.DEBUG) {
  debugLogger = console.log;
}

const logger = {
  debug: debugLogger,
  info: console.log
};

export default logger;
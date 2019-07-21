const path = require('path');

module.exports = {
  entry: './src/realbot.js',
  output: {
    filename: 'realbot.js',
    path: path.resolve(__dirname, 'realbot')
  }
};
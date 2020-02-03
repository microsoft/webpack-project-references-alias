const path = require('path');

module.exports = {
  entry: './lib/index.js',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.prod.js'
  }
};

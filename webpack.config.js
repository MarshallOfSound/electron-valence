const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    bridge: path.resolve(__dirname, 'src', 'Bridge.ts'),
    connector: path.resolve(__dirname, 'src', 'Connector.ts'),
  },
  output: {
    filename: '[name].js',
    library: 'Connector',
    libraryTarget: 'umd'
  },
  // target: 'electron-renderer',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },

  devtool: 'source-map',

  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'awesome-typescript-loader'
    }]
  }
};
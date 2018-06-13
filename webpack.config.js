const DtsBundleWebpack = require('dts-bundle-webpack');

const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    Bridge: path.resolve(__dirname, 'src', 'Transmitter.ts'),
    Connector: path.resolve(__dirname, 'src', 'Receiver.ts'),
  },
  output: {
    filename: '[name].js',
    library: 'ElectronContextBridge',
    libraryTarget: 'umd'
  },
  // target: 'electron-renderer',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },

  externals: ['electron'],

  devtool: 'source-map',

  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'awesome-typescript-loader'
    }]
  },
  plugins: [
    new DtsBundleWebpack({
      name: 'electron-context-bridge/dist',
      main: 'tsc_out/src/index.d.ts',
      out: path.resolve(__dirname, 'dist', 'index.d.ts'),
    })
  ]
};
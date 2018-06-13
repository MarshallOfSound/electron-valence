const DtsBundleWebpack = require('dts-bundle-webpack');

const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: {
    transmitter: path.resolve(__dirname, 'src', 'Transmitter.ts'),
    receiver: path.resolve(__dirname, 'src', 'Receiver.ts'),
  },
  output: {
    filename: '[name].js',
    library: 'ElectronValence',
    libraryTarget: 'umd',
    path: path.resolve(__dirname)
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
      name: 'electron-valence',
      main: 'cjs/index.d.ts',
      out: path.resolve(__dirname, 'index.d.ts'),
    })
  ]
};
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './app/javascripts/app.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.js'
  },
  plugins: [
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([
      { from: './app/index.html', to: "index.html" },
	  { from: './app/createAsset.html', to: "createAsset.html" },
	  { from: './app/getAssetIDByBBL.html', to: "getAssetIDByBBL.html" },
	  { from: './app/updateAsset.html', to: "updateAsset.html" },
    { from: './app/assetIndex.html', to: "assetIndex.html" },
    { from: './app/smartMortgage.html', to: "smartMortgage.html" },
    { from: './app/registerMortgage.html', to: "registerMortgage.html" },
    { from: './app/updateMortgage.html', to: "updateMortgage.html" },
    { from: './app/todoMortgage.html', to: "todoMortgage.html" },
    { from: './app/previousMortgage.html', to: "previousMortgage.html" }
    ])
  ],
  module: {
    rules: [
      {
       test: /\.css$/,
       use: [ 'style-loader', 'css-loader' ]
      }
    ],
    loaders: [
      { test: /\.json$/, use: 'json-loader' },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      }
    ]
  }
}

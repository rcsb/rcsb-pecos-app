const path = require('path')

module.exports = {
  entry: ["regenerator-runtime/runtime.js", path.resolve(__dirname, './src/index.js')],
  output: {
    path: path.resolve(__dirname, '../../../static/build/js'),
    filename: 'alignment-app.js',
  },
  devServer: {
    port: 3000,
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, './src'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
}

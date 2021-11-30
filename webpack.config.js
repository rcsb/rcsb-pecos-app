const path = require('path');

module.exports = {
  entry: ["regenerator-runtime/runtime.js", path.resolve(__dirname, './src/index.js')],
  mode: "production",
  output: {
    path: path.resolve(__dirname, 'build/src/'),
    filename: 'alignment-app.js',
  },
  devServer: {
    port: 3000,
    historyApiFallback: true,
    static: path.resolve(__dirname, './src'),
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    }
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

const HtmlWebpackPlugin = require('html-webpack-plugin');

const commonConfig = {
    mode: "development",
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/
        },{
            test: /\.s?css$/,
            use: ['style-loader', 'css-loader', 'sass-loader']
        }]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', 'jsx'],
        fallback: {
            fs: false,
            buffer: require.resolve('buffer'),
            crypto: require.resolve('crypto-browserify'),
            path: require.resolve('path-browserify'),
            stream: require.resolve('stream-browserify')
        }
    },
    devtool: 'source-map'
};

const server = {
    ...commonConfig,
    entry: {
        app: './src/example.ts'
    },
    devServer: {
        compress: true,
        port: 9000,
    },
    plugins: [new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/index.html',
        inject: true,
        chunks: ['app']
    })]
};

module.exports = [server];

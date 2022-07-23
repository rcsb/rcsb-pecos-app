const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ExtraWatchWebpackPlugin = require('extra-watch-webpack-plugin');

const configOptions = {
    module: {
        rules: [
            {
                test: /\.(html|ico)$/,
                use: [{
                    loader: 'file-loader',
                    options: { name: '[name].[ext]' }
                }]
            },
            {
                test: /\.(s*)css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: 'css-loader', options: { sourceMap: false } }
                ]
            }
        ]
    },
    plugins: [
        new ExtraWatchWebpackPlugin({
            files: [
                './lib/**/*.css',
                './lib/**/*.html'
            ],
        }),
        new MiniCssExtractPlugin({ filename: 'rcsb-pecos-app.css' })
    ],
    resolve: {
        modules: [
            'node_modules',
            path.resolve(__dirname, 'lib/')
        ],
        fallback: {
            fs: false,
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            path: require.resolve('path-browserify')
        },
    }
};

function assetsEntryPoint() {
    return {
        entry: path.resolve(__dirname, `lib/assets.js`),
        output: {
            path: path.resolve(__dirname, `build`)
        },
        ...configOptions
    }
}

function appEntryPoint() {
    return {
        entry: path.resolve(__dirname, 'lib/index.js'),
        target: "web",
        output: { 
            library: 'RcsbStructureAlignment',
            libraryTarget: 'umd', 
            filename: 'rcsb-pecos-app.js', 
            path: path.resolve(__dirname, 'build')
        },
        ...configOptions
    };
}

module.exports = [
    appEntryPoint(),
    assetsEntryPoint()
];

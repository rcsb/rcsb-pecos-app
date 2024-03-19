const path = require('path');

const configOptions = {
    module: {
        rules: [{
            test: /\.svg$/,
            issuer: /\.[jt]sx?$/,
            use: [{
                loader:'@svgr/webpack',
                options: {
                    expandProps: "end",
                    svgoConfig: {}
                }
            }]
        },{
            test: /\.(graphql|gql)$/,
            loader: 'raw-loader'
        },
            {
                test: /\.(html|ico)$/,
                use: [{
                    loader: 'file-loader',
                    options: { name: '[name].[ext]' }
                }]
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.s?css$/,
                use: ['style-loader', {
                    loader: 'css-loader',
                    options: {
                        modules: {
                            localIdentName:'[local]'
                        }
                    }
                },{
                    loader: 'sass-loader',
                    options: {
                        sourceMap: true
                    }
                }]
            }
        ]
    },
    resolve: {
        modules: [
            'node_modules',
            path.resolve(__dirname, 'lib/')
        ],
        fallback: {
            fs: false,
            vm: false,
            buffer: require.resolve('buffer'),
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

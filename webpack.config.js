const webpack = require('webpack');
const path = require('path');

const config = {
    mode: 'development',
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'a-avatar-vrm.js'
    },
    devServer: {
        static: './dist',
    },
    module: {
        rules: [
            {
                test: /\.ts(x)?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    externals: {
        'three': 'THREE'
    },
    resolve: {
        alias: {
            'three': 'super-three'
        },
        extensions: [
            '.tsx',
            '.ts',
            '.js'
        ]
    },
};

module.exports = config;
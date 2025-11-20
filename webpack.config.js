const path = require('path');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');

// Plugin to bundle background script with all dependencies
class BundleBackgroundPlugin {
    apply(compiler) {
        compiler.hooks.afterEmit.tap('BundleBackgroundPlugin', (compilation) => {
            // Background is now bundled via webpack entry point
            console.log('✅ Background script bundled');
        });
    }
}

module.exports = {
    entry: {
        popup: './src/popup/index.tsx',
        options: './src/options/index.tsx',
        background: './src/background/background.js',
        content: './src/content/index.ts',
        'myJquery-3.7.1': './src/myJquery-3.7.1.js'
    },
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    watch: isWatch,
    stats: isProduction ? 'errors-only' : 'normal',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            compilerOptions: { noEmit: false },
                        },
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                            plugins: isProduction ? [
                                'transform-remove-console'
                            ] : [],
                        },
                    },
                ],
                exclude: [
                    /node_modules/
                ],
            },
            {
                test: /\.css$/i,
                exclude: /node_modules/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.json$/,
                type: 'json',
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'public', to: '..' },
            ],
        }),
        new BundleBackgroundPlugin(),

    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: path.join(__dirname, 'dist/js'),
        filename: '[name].js',
    },
    optimization: {
        minimize: isProduction,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: false,
                    },
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
    },
};
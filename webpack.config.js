const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');

module.exports = {
    entry: {
        popup: './src/popup/index.tsx',
        background: './src/background/index.ts',
        content: './src/content/index.ts'
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
                exclude: /node_modules/,
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

    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: path.join(__dirname, 'dist/js'),
        filename: '[name].js',
    },
};
const path = require('path');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';
const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');

// Plugin to copy background.js directly without any processing
class CopyBackgroundPlugin {
    apply(compiler) {
        compiler.hooks.afterEmit.tap('CopyBackgroundPlugin', (compilation) => {
            const sourcePath = path.join(__dirname, 'src/background/background.js');
            const destPath = path.join(__dirname, 'dist/js/background.js');
            
            try {
                if (fs.existsSync(sourcePath)) {
                    fs.copyFileSync(sourcePath, destPath);
                    console.log('✅ Background.js copied directly (no minification)');
                }
            } catch (error) {
                console.error('❌ Error copying background.js:', error);
            }
        });
    }
}

module.exports = {
    entry: {
        popup: './src/popup/index.tsx',
        // background: './src/background/index.ts', // Excluded from bundle - will be copied directly
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
                exclude: [
                    /node_modules/,
                    /src\/background\/background\.js$/
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
        new CopyBackgroundPlugin(),

    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: path.join(__dirname, 'dist/js'),
        filename: '[name].js',
    },
};
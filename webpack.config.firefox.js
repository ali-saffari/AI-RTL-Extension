const path = require('path');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { iranyekanFontPattern } = require('./scripts/private-assets');

const isProduction = process.env.NODE_ENV !== 'development';
const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');

class BundleBackgroundPlugin {
    apply(compiler) {
        compiler.hooks.afterEmit.tap('BundleBackgroundPlugin', () => {
            console.log('✅ Firefox background script bundled');
        });
    }
}

// webpack clean only clears dist-firefox/js; strip Chrome-only leftovers from package root
class RemoveChromeManifestPlugin {
    apply(compiler) {
        compiler.hooks.afterEmit.tap('RemoveChromeManifestPlugin', () => {
            const chromeManifest = path.join(__dirname, 'dist-firefox', 'manifest.chrome.json');
            if (fs.existsSync(chromeManifest)) {
                fs.unlinkSync(chromeManifest);
                console.log('🗑️ Removed leftover manifest.chrome.json from dist-firefox');
            }
        });
    }
}

module.exports = {
    entry: {
        popup: './src/popup/index.tsx',
        options: './src/options/index.tsx',
        background: './src/background/background.js',
        content: './src/content/index.ts',
        'manual-rtl': './src/manual-rtl/content.js',
        'myJquery-3.7.1': './src/myJquery-3.7.1.js',
        'inject-fonts': './src/content/injectFonts.js'
    },
    mode: isProduction ? 'production' : 'development',
    // Avoid huge .map files that bloat AMO packages / lint
    devtool: isProduction ? false : 'cheap-module-source-map',
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
                            plugins: isProduction
                                ? ['transform-remove-console']
                                : [],
                        },
                    },
                ],
                exclude: [/node_modules/],
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
                {
                    from: 'public',
                    to: '..',
                    globOptions: {
                        // Never copy Chrome or Firefox source manifests as-is;
                        // font CSS is transformed separately for moz-extension://
                        ignore: [
                            '**/manifest.chrome.json',
                            '**/manifest.firefox.json',
                            '**/manifest.json',
                            '**/css/fontiran-iranyekan.css',
                        ],
                    },
                },
                {
                    from: 'public/manifest.firefox.json',
                    to: '../manifest.json',
                },
                iranyekanFontPattern('../fonts/iranyekan'),
                {
                    // Popup/options: relative URLs resolve against the CSS file in the extension package.
                    // Content scripts use js/inject-fonts.js (FontFace + getURL) instead of this file.
                    from: 'public/css/fontiran-iranyekan.css',
                    to: '../css/fontiran-iranyekan.css',
                    transform(content) {
                        return content
                            .toString('utf8')
                            .replace(
                                /url\(['"]?chrome-extension:\/\/__MSG_@@extension_id__\/fonts\//g,
                                "url('../fonts/"
                            );
                    },
                },
            ],
        }),
        new BundleBackgroundPlugin(),
        new RemoveChromeManifestPlugin(),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: path.join(__dirname, 'dist-firefox/js'),
        filename: '[name].js',
        clean: true,
    },
    optimization: {
        minimize: isProduction,
        minimizer: [
            new TerserPlugin({
                include: /background\.js$/,
                terserOptions: {
                    compress: {
                        drop_console: true,
                        drop_debugger: true,
                    },
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
            new TerserPlugin({
                exclude: /background\.js$/,
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

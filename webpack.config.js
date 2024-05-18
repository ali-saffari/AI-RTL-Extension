const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin")

module.exports = {
    entry: {
        index: "./src/index.tsx"
    },
    mode: "production",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: { noEmit: false },
                        }
                    }],
                exclude: /node_modules/,
            },
            {
                exclude: /node_modules/,
                test: /\.css$/i,
                use: [
                    "style-loader",
                    "css-loader"
                ]

            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                // { from: "manifest.json", to: "../manifest.json" },
                // { from: "extension.js", to: "../extension.js" },
                // { from: "style.css", to: "../style.css" },
                // { from: "jquery-3.6.4.min.js", to: "../jquery-3.6.4.min.js" },
                // { from: "images", to: "../images" },
                // { from: "fonts", to: "../fonts" },
                { from: "base-extension", to: ".." },

            ],
        }),
        // ...getHtmlPlugins(["index"]),
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        path: path.join(__dirname, "dist/js"),
        filename: "[name].js",
    },
};

// function getHtmlPlugins(chunks) {
//     return chunks.map(
//         (chunk) =>
//             new HTMLPlugin({
//                 title: "React extension",
//                 filename: `${chunk}.html`,
//                 chunks: [chunk],
//             })
//     );
// }
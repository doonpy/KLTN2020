const path = require("path");
const webpack = require("webpack");

/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

/*
 * We've enabled HtmlWebpackPlugin for you! This generates a html
 * page for you when you compile webpack, which will make you start
 * developing and prototyping faster.
 *
 * https://github.com/jantimon/html-webpack-plugin
 *
 */

module.exports = {
    mode: "development",
    entry: {
        "def-main": "./source/def-data/main.js",
        "crawl-main": "./source/crawl/main.js",
        "comp-main": "./source/compile-data/main.js",
        "extr-main": "./source/extract-catalog/main.js"
    },

    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "public/javascripts")
    },

    module: {
        rules: [
            {
                test: /.(js|jsx)$/,
                include: [path.resolve(__dirname, "source")],
                loader: "babel-loader",

                options: {
                    plugins: ["syntax-dynamic-import"],

                    presets: [
                        [
                            "@babel/preset-env",
                            {
                                modules: false
                            }
                        ]
                    ]
                }
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            },
            {
                test: /\.(scss)$/,
                use: [
                    {
                        // Adds CSS to the DOM by injecting a `<style>` tag
                        loader: "style-loader"
                    },
                    {
                        // Interprets `@import` and `url()` like `import/require()` and will resolve them
                        loader: "css-loader"
                    },
                    {
                        // Loader for webpack to process CSS with PostCSS
                        loader: "postcss-loader",
                        options: {
                            plugins: function () {
                                return [require("autoprefixer")];
                            }
                        }
                    },
                    {
                        // Loads a SASS/SCSS file and compiles it to CSS
                        loader: "sass-loader"
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: "file-loader"
                    }
                ]
            }
        ]
    },

    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    priority: -10,
                    test: /[\\/]node_modules[\\/]/
                }
            },

            chunks: "async",
            minChunks: 1,
            minSize: 30000,
            name: true
        }
    },

    devServer: {
        open: false
    }
};

const path = require("path")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CopyPlugin = require("copy-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const { VueLoaderPlugin } = require("vue-loader")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const env = process.env.NODE_ENV
const isWatch = process.env.npm_lifecycle_event === "watch"
const sourceMap = env === "development"
const production = env === "production"
const aliases = require("./webpack.aliases")
const PurgecssPlugin = require("purgecss-webpack-plugin")
const glob = require("glob-all")

const config = {
    mode: env,
    target: "web",
    entry: {
        background: ["./src/js/background.js"],
        result: [
            "./src/js/result.js",
            "./src/scss/result.scss"
        ],
        options: [
            "./src/js/options.js",
            "./src/scss/options.scss"
        ]
    },
    output: {
        path: path.resolve(__dirname, "build"),
        publicPath: "/",
        filename: "js/[name].js",
        chunkFilename: "js/[name].js"
    },
    optimization: {},
    resolve: {
        alias: {
            ...aliases.resolve.alias,
            "vue$": "vue/dist/vue.esm.js",
        },
        extensions: ["*", ".js", ".vue", ".json"],
        modules: ["./node_modules"],
        fallback: {
            crypto: false
        }
    },
    stats: {
        colors: true
    },
    devtool: sourceMap ? "cheap-module-source-map" : undefined,
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.vue$/,
                loader: "vue-loader"
            },
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap,
                            importLoaders: 2
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: { sourceMap }
                    },
                    "resolve-url-loader",
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap,
                            implementation: require("sass"),
                            sassOptions: {
                                indentWidth: 4,
                                includePaths: [path.resolve(__dirname, "src/scss")],
                            },
                        }
                    },
                ]
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{
                    loader: "file-loader",
                    options: {
                        name: "[name].[ext]",
                        outputPath: "fonts/",
                        publicPath: "/fonts/",
                    }
                }]
            },
            {
                test: /\.(ico|jpe?g|png|gif|webp)(\?.*)?$/,
                loader: "file-loader",
                options: {
                    name: "[name].[ext]",
                    outputPath: "images/",
                    publicPath: "/images/",
                }
            },
            {
                test: /dexie.*\.js$/,
                loader: "string-replace-loader",
                options: {
                    search: "return new Function(\"let F=async ()=>{},p=F();return [p,Object.getPrototypeOf(p),Promise.resolve(),F.constructor];\")();",
                    replace: "return [Promise.resolve(), Promise.prototype, Promise.resolve(), Function.constructor]",
                }
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "src/html"),
                    to: path.resolve(__dirname, "build/html"),
                    globOptions: {
                        dot: true,
                        ignore: ["**/.DS_Store"],
                    },
                },
                {
                    from: path.resolve(__dirname, "src/images"),
                    to: path.resolve(__dirname, "build/images"),
                    globOptions: {
                        dot: true,
                        ignore: ["**/.DS_Store"],
                    },
                },
                {
                    from: path.resolve(__dirname, "src/data"),
                    to: path.resolve(__dirname, "build/data"),
                    globOptions: {
                        dot: true,
                        ignore: ["**/.DS_Store"],
                    },
                },
                {
                    from: path.resolve(__dirname, "manifest.json"),
                    to: path.resolve(__dirname, "build")
                },
                {
                    from: path.resolve(__dirname, "LICENSE"),
                    to: path.resolve(__dirname, "build")
                },
            ]
        }),
        new MiniCssExtractPlugin({
            filename: "css/[name].css",
            chunkFilename: "css/[name].css"
        }),
        new CleanWebpackPlugin({ cleanStaleWebpackAssets: !isWatch })
    ]
}


if (production) {
    config.plugins.push(
        new PurgecssPlugin({
            paths: glob.sync([
                path.join(__dirname, "src/html/*.html"),
                path.join(__dirname, "src/js/**/*.js"),
                path.join(__dirname, "src/js/**/*.vue"),
                path.join(__dirname, "node_modules/vue-single-select/dist/VueSingleSelect.vue")
            ]),
            safelist: ["color_orange", "font_xlarge", "strong", "color_lightdark", "font_small", "italic", "font_large", "color_dark"]
        }),
    )

    config.optimization.minimize = true
    config.optimization.minimizer = [
        new CssMinimizerPlugin({
            parallel: true,
            minimizerOptions: {
                preset: [
                    "default",
                    {
                        discardComments: { removeAll: true },
                    },
                ],
            },
        }),
        new TerserPlugin({
            parallel: true,
        }),
    ]
}

module.exports = config

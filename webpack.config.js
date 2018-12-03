const path = require('path');
const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const ENV = process.env.NODE_ENV || 'dev';
const PROXY_URL = process.env.PROXY_URL || 'http://dev.mynexthit.com:1341';
const API_URL = process.env.API_URL || '';
const PUBLIC_PATH = process.env.PUBLIC_PATH || '/';
const BUILD_NUMBER = process.env.BITBUCKET_BUILD_NUMBER || 'custom';
const GTM_ID = process.env.GTM_ID || '';
const ROLLBAR_ID = process.env.ROLLBAR_ID || '';

const PROD = ENV === 'production';
const STAGE = ENV === 'stage';

const lastCommit = require('child_process')
    .execSync('git log --oneline -1')
    .toString().trim();
const date = (new Date()).toUTCString();
console.log(`Date: ${date}`);
console.log(`Commit: ${lastCommit}`);
console.log(`Build: ${BUILD_NUMBER}`);
console.log(`Build vars: ENV = ${ENV}; API_URL = ${API_URL}; PUBLIC_PATH = ${PUBLIC_PATH}; GTM_ID = ${GTM_ID}; ROLLBAR_ID = ${ROLLBAR_ID}`);

function isVendor(module) {
    return module.context && module.context.indexOf('node_modules') !== -1;
}

let webpackConf = {
    entry: {
        app: ['./src/app.js'],
        signup: ['./src/signup/signup.module.js']
    },
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'scripts-[name]-[hash].js',
        publicPath: PUBLIC_PATH
    },
    module: {
        exprContextCritical: false,
        rules: [
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                exclude: /(node_modules|mnh-shared)/
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: [
                    'ng-annotate-loader',
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: 'es2015',
                            minified: PROD
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        {
                            loader: 'autoprefixer-loader',
                            options: {
                                browsers: 'last 2 version'
                            }
                        }
                    ]
                })
            },
            {
                test: /\.scss/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        {
                            loader: 'autoprefixer-loader',
                            options: {
                                browsers: 'last 2 version'
                            }
                        },
                        'sass-loader',
                        {
                            loader: 'sass-resources-loader',
                            options: {
                                resources: './src/assets/styles/global/global.scss'
                            }
                        }
                    ]
                })
            },
            {
                test: /\.(eot|ttf|woff|woff2|svg|svgz)$/,
                loader: 'file-loader',
                options: {
                    name: 'fonts/[name].[ext]'
                }
            },
            {
                test: /\.html$/,
                exclude: [
                    new RegExp(`(node_modules)`),
                    path.resolve(__dirname, './src/index.html'),
                    path.resolve(__dirname, './src/signup/index.html')
                ],
                use: [
                    {
                        loader: 'ngtemplate-loader',
                        options: {
                            relativeTo: `${path.resolve(__dirname, './src')}/`
                        }
                    },
                    {
                        loader: 'html-loader',
                        options: {
                            interpolate: true,
                            collapseWhitespace: false,
                            minimize: PROD
                        }
                    }
                ]
            },
            {
                test: /\.(jpg|jpeg)/,
                loader: 'file-loader',
                options: {
                    name: 'images/[name]-[hash].[ext]'
                }
            },
            {
                test: /\.png$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'images/[name]-[hash].[ext]'
                }
            }
        ]
    },
    plugins: [
        new CleanPlugin(['dist']),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            chunks: ['app', 'signup', 'text-editor'],
            minChunks: function (module, count) {
                return isVendor(module) && count > 1;
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor-app',
            chunks: ['app'],
            minChunks: function (module) {
                return isVendor(module);
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor-signup',
            chunks: ['signup'],
            minChunks: function (module) {
                return isVendor(module);
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest'
        }),
        new HtmlPlugin({
            filename: 'index.html',
            template: (path.resolve(__dirname, './src/index.html')),
            inject: 'body',
            chunks: ['manifest', 'vendor', 'vendor-app', 'app'],
            chunksSortMode: function (a, b) {
                let order = ['manifest', 'vendor', 'vendor-app', 'app'];
                return order.indexOf(a.names[0]) - order.indexOf(b.names[0]);
            }
        }),
        new HtmlPlugin({
            filename: 'signup/index.html',
            template: (path.resolve(__dirname, './src/signup/index.html')),
            inject: 'body',
            chunks: ['manifest', 'vendor', 'vendor-singup', 'signup'],
            chunksSortMode: function (a, b) {
                let order = ['manifest', 'vendor', 'vendor-signup', 'signup'];
                return order.indexOf(a.names[0]) - order.indexOf(b.names[0]);
            }
        }),
        new CopyPlugin([
            {from: 'src/favicon.ico'},
            {from: 'build.html'}
        ]),
        new ExtractTextPlugin('styles-[name]-[hash].css'),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            '_': 'lodash'
        }),
        new webpack.DefinePlugin({
            'PROD': PROD,
            'STAGE': STAGE,
            'STAGE_OR_PROD': STAGE || PROD,
            'ENV': JSON.stringify(ENV),
            'API_URL': JSON.stringify(API_URL),
            'BUILD_NUMBER': JSON.stringify(BUILD_NUMBER),
            'GTM_ID': JSON.stringify(GTM_ID),
            'ROLLBAR_ID': JSON.stringify(ROLLBAR_ID)
        })
    ],
    devtool: 'inline-source-map',
    devServer: {
        port: 9902,
        proxy: [{
            context: ['/socket.io', '/api'],
            target: PROXY_URL
        }]
    },
    resolve: {
        alias: {
            mocks: path.resolve(__dirname, 'mocks')
        }
    }
};

if (PROD) {
    webpackConf.plugins.push(new webpack.optimize.UglifyJsPlugin({
        output: {
            ascii_only: true
        }
    }));
}

if (!PROD) {
    webpackConf.entry['text-editor'] = ['./src/new-text-editor/text-editor.module.js'];

    webpackConf.module.rules[5].exclude.push(path.resolve(__dirname, './src/new-text-editor/index.html'));
    webpackConf.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor-text-editor',
            chunks: ['text-editor'],
            minChunks: function (module) {
                return isVendor(module);
            }
        })
    );
    webpackConf.plugins.push(
        new HtmlPlugin({
            filename: 'text-editor/index.html',
            template: (path.resolve(__dirname, './src/new-text-editor/index.html')),
            inject: 'body',
            chunks: ['manifest', 'vendor', 'vendor-text-editor', 'text-editor'],
            chunksSortMode: function (a, b) {
                let order = ['manifest', 'vendor', 'vendor-text-editor', 'text-editor'];
                return order.indexOf(a.names[0]) - order.indexOf(b.names[0]);
            }
        })
    );
}


module.exports = webpackConf;

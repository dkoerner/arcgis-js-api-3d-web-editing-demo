const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: "",
        libraryTarget: "amd"
    },
    optimization: {
        minimize: false
    },
    externals: [
        /^esri\/.*/,
        /^app\/.*/
    ],
    mode: 'development'
};
process.env.ASSET_PATH = '/';
const fse = require('fs-extra');
const path = require('path');

fse.ensureDirSync(path.join(__dirname, '..', 'build'));
var webpack = require('webpack'),
    config = require('../webpack.config');

delete config.chromeExtensionBoilerplate;

// config.mode = 'production';

webpack(config, function (err) {
    if (err) throw err;
});

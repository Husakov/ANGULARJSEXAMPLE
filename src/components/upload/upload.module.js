const mod = angular.module('intercom.components.upload', []);

require('./upload.scss');

require('./upload')(mod);
require('./file-drop')(mod);

module.exports = mod;

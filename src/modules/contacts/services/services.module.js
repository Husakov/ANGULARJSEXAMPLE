const mod = angular.module('riika.modules.contacts.services', []);

require('./listPageHelper')(mod);
require('./detailsContactHelper')(mod);

module.exports = mod;
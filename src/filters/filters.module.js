const mod = angular.module('riika.filters', []);

require('./capitalize')(mod);
require('./dash')(mod);
require('./emojis')(mod);
require('./filesize')(mod);
require('./find')(mod);
require('./isNotEmpty')(mod);
require('./limitWithDots')(mod);
require('./minutesToDayPeriods')(mod);
require('./removeHtmlTags')(mod);
require('./startcase')(mod);

module.exports = mod;

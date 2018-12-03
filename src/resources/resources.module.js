const mod = module.exports = angular.module('riika.resources', [
    'riika.resources.base'
]);

require('./admin')(mod);
require('./app')(mod);
require('./attributes')(mod);
require('./companies')(mod);
require('./conversations')(mod);
require('./dispatch')(mod);
require('./emailTemplate')(mod);
require('./events')(mod);
require('./giphy')(mod);
require('./message')(mod);
require('./messageFolder')(mod);
require('./invites')(mod);
require('./notes')(mod);
require('./profile')(mod);
require('./savedReply')(mod);
require('./segments')(mod);
require('./settings')(mod);
require('./tags')(mod);
require('./teams')(mod);
require('./uploadResource')(mod);
require('./users')(mod);
require('./export')(mod);
require('./import')(mod);

module.exports = function (module) {
    module
        .factory('TIME_ZONES', function (moment) {
            'ngInject';

            return _.sortBy(_.map(moment.tz.names(), function (zoneName) {
                return {
                    name: zoneName,
                    offset: 'UTC' + moment().tz(zoneName).format('Z')
                };
            }), 'offset')
        });
};
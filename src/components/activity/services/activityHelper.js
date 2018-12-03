module.exports = function (mod) {
    mod.factory('activityHelper', function (Events) {
        'ngInject';

        let baseParams = {
            limit: 10,
            include_count: true,
            sort: 'created_at desc'
        };

        let activityMainTypes = [
            {type: '', name: 'All activity', icon: 'copy'},
            {type: 'mention', name: 'Mentions', icon: 'at'},
            {type: 'notes', name: 'Notes', icon: 'sticky-note'},
            {type: 'conversations', name: 'Conversations', icon: 'comments'}
        ];

        let activityIndividualTypes = [
            {type: 'messages', name: 'Messages', icon: 'envelope'},
            {type: 'notes', name: 'Notes', icon: 'sticky-note'},
            {type: 'tags', name: 'Tags', icon: 'tags'},
            {type: 'segments', name: 'Segments', icon: 'pie-chart'},
            {type: 'events', name: 'Events', icon: 'calendar'}
        ];

        class Helper {
            constructor() {
                this.activityMainTypes = activityMainTypes;
                this.activityIndividualTypes = activityIndividualTypes;
            }

            getType(event) {
                return event.event_type;
            }

            getActivityType(activityTypes, event) {
                return _.find(activityTypes, {type: this.getType(event)});
            }

            getList(params) {
                params = angular.extend({}, baseParams, params);

                return Events.query(params).$promise;
            }

            getUser(event) {
                let user = event.user || _.get(event, 'conversation.participants[0]') || null;
                if (user) {
                    user.name = user.name || user.display_as;
                }
                return user;
            }
        }

        return new Helper();
    });
};

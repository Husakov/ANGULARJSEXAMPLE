module.exports = function (module) {
    module
        .factory('SavedReply', (AuthResource, Admin, mnhMessageUtils, $cacheFactory) => {
            'ngInject';

            let cache = $cacheFactory('savedRepliesCache'),
                admins = Admin.query(),
                parser = new mnhMessageUtils.MessageParser();


            function prepare(item) {
                item.admin = _.find(admins, 'id', item.admin_id);
                item.body = parser.toHtml(item.blocks);
            }

            function prepareInterceptor(action) {
                AuthResource.interceptAction(action, {
                    response: function (response) {
                        let resource = response.resource || response;
                        return admins.$promise
                            .then(() => {
                                if (action.isArray) {
                                    resource.forEach(
                                        item => prepare(item)
                                    )
                                } else {
                                    prepare(resource);
                                }
                                return response;
                            });
                    }
                }, true);
            }

            let Resource = AuthResource.decorate([prepareInterceptor], [], {
                clearCache: function () {
                    cache.removeAll();
                }
            });

            return Resource('saved_reply/:id', {id: '@id'}, {
                query: {
                    method: 'GET',
                    isArray: true,
                    cache: cache
                },
                prepare: {
                    url: 'saved_reply/:id/prepare?conversation_id=:conversationId',
                    params: {conversationId: '@conversationId'},
                    method: 'GET'
                }
            });
        });
};

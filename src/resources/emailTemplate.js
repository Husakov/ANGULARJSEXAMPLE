module.exports = function (module) {
    module
        .factory('EmailTemplate', (AuthResource, $cacheFactory) => {
            'ngInject';

            let emailTemplateCache = $cacheFactory('emailTemplateCache');

            let EmailTemplate = AuthResource('emailtemplate', {id: '@id'}, {
                query: {
                    url: 'emailtemplate',
                    method: 'GET',
                    isArray: true,
                    params: {limit: 0},
                    cache: emailTemplateCache
                },
                list: {
                    url: 'emailtemplate/list',
                    method: 'GET',
                    isArray: true,
                    params: {limit: 0},
                    cache: emailTemplateCache
                }
            });

            EmailTemplate.clearCache = () => {
                emailTemplateCache.removeAll();
            };

            return EmailTemplate;
        });
};

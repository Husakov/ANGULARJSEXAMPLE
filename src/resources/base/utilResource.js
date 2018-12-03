let utils = require('./utils');
const resourceExtend = utils.resourceExtend;

module.exports = function (module) {
    module
        .factory('UtilResource', function ($resource, $q) {
            'ngInject';
            let defaultActions = {
                get: {method: 'GET'},
                save: {method: 'POST'},
                update: {method: 'PUT'},
                query: {method: 'GET', isArray: true},
                remove: {method: 'DELETE'},
                delete: {method: 'DELETE'}
            };

            utils.initDeps($q);

            function UtilResource(url, paramDefaults, actions, options) {
                let resource,
                    params;

                actions = angular.merge({}, defaultActions, actions);

                params = [url, paramDefaults, actions, options];
                _.each(this.paramsDecorators, dec => params = dec(params));
                [url, paramDefaults, actions, options] = params;

                _.each(actions, (action, key) => {
                    _.each(this.decorators, (dec) => dec(action, key));
                });

                resource = $resource(url, paramDefaults, actions, options);

                _.forIn(this.resourceMethods, (method, key) => resource[key] = method.bind(resource));

                return resource;
            }

            resourceExtend(UtilResource, {
                resource: UtilResource,
                decorators: [],
                resourceMethods: [],
                paramsDecorators: []
            });

            return UtilResource.decorate();
        });
};

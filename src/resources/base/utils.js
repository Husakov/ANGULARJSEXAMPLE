let $q;

function bind(origFn, context) {
    let fn = function () {
        return origFn.apply(context, arguments);
    };
    fn.__origFn = origFn;
    return fn;
}

function unbind(fn) {
    return fn.__origFn || fn;
}

function appendTransform(defaults, transform) {
    // We can't guarantee that the default transformation is an array
    defaults = defaults ? defaults : [];
    defaults = angular.isArray(defaults) ? defaults : [defaults];

    // Append the new transformation to the defaults
    return defaults.concat(transform);
}

function resourceExtend(resource, decorateContext) {
    _.defaultsDeep(resource, {
        decorate: _.bind(decorate, decorateContext),
        interceptAction: interceptAction,
        transformAction: transformAction
    });
}

/**
 * You can decorate resource using this method
 *
 * @function decorate
 * @param {function[]} decorators - functions to decorate each action.
 * @param {function[]} paramsDecorators - functions to decorate params. Take params array.
 * @param {Object} resourceMethods - methods to add to resource.
 * @returns {function}
 */
function decorate(decorators = [], paramsDecorators = [], resourceMethods = {}) {
    decorators = _.isArray(decorators) ? decorators : [decorators];
    let that = {
            paramsDecorators: this.paramsDecorators.concat(paramsDecorators),
            decorators: this.decorators.concat(decorators),
            resourceMethods: angular.merge({}, this.resourceMethods, resourceMethods)
        },
        resource = bind(unbind(this.resource), that);

    that.resource = resource;

    resourceExtend(resource, that);
    return resource;
}

/**
 * Helper function to add response interceptors
 *
 * @param {Object} action - action object
 * @param {Object} interceptor
 * @param {function} [interceptor.response]
 * @param {function} [interceptor.responseError]
 * @param {boolean} post - if true, will be add in end of interceptors array (even after final resource
 */
function interceptAction(action, interceptor, post = false) {
    if (!action.interceptor) {
        action.interceptor = {};
    }

    if (interceptor.response) {
        let originInterceptor = action.interceptor.response || $q.resolve;
        if (post) {
            action.interceptor.response = function () {
                return $q.when(originInterceptor.apply(null, arguments))
                    .then(interceptor.response);
            }
        } else {
            action.interceptor.response = function () {
                return $q.when(interceptor.response.apply(null, arguments))
                    .then(originInterceptor);
            }
        }
    }

    if (interceptor.responseError) {
        let originInterceptor = action.interceptor.responseError || $q.reject;
        if (post) {
            action.interceptor.responseError = function () {
                return $q.when(originInterceptor.apply(null, arguments))
                    .catch(interceptor.responseError);
            }
        } else {
            action.interceptor.responseError = function () {
                return $q.when(interceptor.responseError.apply(null, arguments))
                    .catch(originInterceptor);
            }
        }
    }
}

/**
 * Helper function to add request/response transformation function
 *
 * @param {Object} action - action object
 * @param {Object} transform
 * @param {function} [transform.request] - function to transform request
 * @param {function} [transform.response] - function to transform response
 */
function transformAction(action, transform) {
    if (transform.request) {
        action.transformRequest = appendTransform(action.transformRequest, transform.request);
    }

    if (transform.response) {
        action.transformResponse = appendTransform(action.transformResponse, transform.response);
    }
}

module.exports = {
    initDeps: function (_$q) {
        $q = _$q;
    },
    resourceExtend
};
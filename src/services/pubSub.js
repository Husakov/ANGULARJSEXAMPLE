module.exports = function (module) {
    module
        .factory('pubSub', function ($rootScope) {
            'ngInject';

            function emit() {
                return $rootScope.$emit.apply($rootScope, arguments);
            }

            function on(event, listener, $scope) {
                let off = $rootScope.$on(event, listener);
                if ($scope) {
                    $scope.$on('$destroy', () => {
                        off();
                    })
                }
                return off;
            }

            let eventPrefixKey = Symbol();

            class EventEmitter {
                constructor() {
                    this[eventPrefixKey] = _.uniqueId('eventEmitter') + '.';
                }

                on() {
                    arguments[0] = this[eventPrefixKey] + arguments[0];
                    return on.apply(null, arguments);
                }

                emit() {
                    arguments[0] = this[eventPrefixKey] + arguments[0];
                    return emit.apply(null, arguments)
                }
            }

            return {
                EventEmitter,
                emit,
                on,
                onStateChanged(callback, $scope) {
                    return on('$stateChangeSuccess', callback, $scope);
                }
            };
        });
};

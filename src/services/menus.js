module.exports = function (module) {

    let menus = {},
        keys = [],
        className = 'hidden';

    function setHidden($state) {
        let state = $state.$current,
            existInViews = _.zipObject(keys);

        do {
            Object.keys(state.views)
                .forEach(key => {
                    keys.forEach(name => {
                        if (existInViews[name]) {
                            return;
                        }
                        if (key.includes(name)) {
                            existInViews[name] = true;
                        }
                    });

                });
            state = state.parent;
        } while (state);

        keys.forEach(name => {
            let hidden = !existInViews[name],
                menu = menus[name];
            if (hidden !== menu.hasClass) {
                if (hidden) {
                    menu.$element.addClass(className);
                } else {
                    menu.$element.removeClass(className);
                }
                menu.hasClass = hidden;
            }
        });

    }


    module
        .factory('menus', function ($state) {
            'ngInject';

            return {
                register(name, ctrl) {
                    menus[name] = {
                        ctrl,
                        $element: ctrl.$element,
                        hasClass: false
                    };
                    keys.push(name);
                    setHidden($state);
                }
            };
        })
        .run(function (pubSub, $timeout, $state) {
            'ngInject';
            pubSub.onStateChanged(() => {
                $timeout(() => {
                    setHidden($state);
                });
            })
        });
};
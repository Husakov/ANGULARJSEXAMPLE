module.exports = function (module) {

    module
        .factory('slidePanelManager', function ($compile, $rootScope, pubSub) {
            'ngInject';

            const container = angular.element('.app-container');

            class Panel extends pubSub.EventEmitter {
                constructor(options) {
                    super();
                    this.$scope = options.$scope || $rootScope.$new();
                    this.$scope.isOpen = false;

                    this.$scope.$on('$destroy', () => {
                        this.destroy(true);
                    });

                    let html = '';

                    if (options.template) {
                        html = options.template;
                    } else if (options.templateUrl) {
                        html = `<ng-include src="${options.templateUrl}"></ng-include>`;
                    }

                    html = `<slide-panel is-open="isOpen" \
                            background="${options.background}" \
                            dark-background="${options.darkBackground}"\
                            from-bottom="${options.fromBottom}"\
                            slide-app-container="${options.slideAppContainer}"\
                            >${html}</slidemenu>`;

                    this.$element = $compile(html)(this.$scope);
                    container.append(this.$element);
                }
                open() {
                    this.toggle(true);
                }
                toggle(state = !this.$scope.isOpen) {
                    this.$scope.isOpen = state;
                    this.emit('toggle', state);
                }
                destroy(scopeDestroyed = false) {
                    if (!scopeDestroyed) {
                        this.$scope.$destroy();
                    }
                    this.$element.remove();
                }
            }

            return {
                render(options) {
                    return new Panel(options);
                },
                open(options) {
                    let panel = this.render(options);
                    panel.open();
                    return panel;
                }
            };
        });
};

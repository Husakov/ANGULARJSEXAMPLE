module.exports = function (module) {
    module
        .factory('dropdownHelper', function (pubSub, $document, $window, $compile, $timeout) {
            'ngInject';

            let windowSizes,
                dropdownComponents = [];

            function setWindowSizes() {
                windowSizes = {
                    height: $document.height(),
                    width: $document.width()
                }
            }

            function addToCollection(dropdown) {
                dropdownComponents.push(dropdown);
                dropdown.on('$destroy', () => {
                    _.pull(dropdownComponents, dropdown);
                });

                dropdown.on('show', () => {
                    dropdownComponents
                        .filter(c => c !== dropdown)
                        .forEach(c => c.hide());
                });
            }

            class DropdownComponent extends pubSub.EventEmitter {
                constructor($scope, template, conf = {}) {
                    super();
                    this.$scope = $scope;
                    this.$element = $compile(template)($scope);
                    this.$element.addClass('dropdown-component');
                    this.hide();
                    angular.element($document.get(0).body).append(this.$element);

                    $scope.$on('$destroy', () => {
                        this.$element.remove();
                        this.emit('$destroy');
                    });

                    $scope.bodyComponent = this;
                    this.positionClassNames = '';

                    if (!conf.isStandalone) {
                        addToCollection(this);
                    }
                    if (conf.closeOnOutside) {
                        const hide = () => this.hide();
                        this.on('show', () => {
                            $timeout(() => $document.on('click keydown', hide));
                        });
                        this.on('hide', () => {
                            $document.off('click keydown', hide);
                        });
                        this.$element.on('click keydown', $e => $e.stopPropagation());
                    }

                    this.lastPositionParams = null;
                    const updatePosition = () => {
                        if (!this.hidden && this.lastPositionParams) {
                            this.setPosition(...this.lastPositionParams);
                        }
                    };
                    angular.element($window).on('resize', updatePosition);
                    this.on('$destroy', () => angular.element($window).off('resize', updatePosition));
                }

                /**
                 *
                 * @param {Object|Function} rect -  Object (or function, what returns the object) with properties top, bottom, left, right - coordinates
                 *                                  of sides of selected rect
                 * @param {String[]} position -     array of two element:
                 *                                  horizontal ('left', 'center', 'right') and
                 *                                  vertical ('top', 'bottom')
                 *                                  position of component (exp: ['left', 'bottom'])
                 */
                show(rect, position) {
                    if (this.hidden) {
                        this.hidden = false;
                        this.$element.removeClass('hidden');
                    }
                    if (rect) {
                        this.$element.addClass('invisible');
                        this.lastPositionParams = [rect, position];
                        $timeout(() => this.setPosition(rect, position));
                    }
                    this.emit('show');
                }

                hide() {
                    if (this.hidden) {
                        return;
                    }

                    this.hidden = true;
                    this.lastPositionParams = null;
                    this.$element.addClass('hidden');
                    this.$element.removeClass(this.positionClassNames);
                    this.positionClassNames = '';
                    this.emit('hide');
                }

                setPosition(rect, position) {
                    rect = _.isFunction(rect) ? rect() : rect;

                    function setTop() {
                        pos.top = rect.top - elementSizes.height;
                        classNames.push('top');
                    }

                    function setBottom() {
                        pos.top = rect.bottom;
                        classNames.push('bottom');
                    }

                    function setLeft() {
                        pos.left = rect.left;
                        classNames.push('left');
                    }

                    function setRight() {
                        pos.left = rect.right - elementSizes.width;
                        classNames.push('right');
                    }

                    let [x, y] = position,
                        classNames = [],
                        elementSizes = {
                            width: this.$element.outerWidth(),
                            height: this.$element.outerHeight()
                        },
                        pos = {};
                    setWindowSizes();

                    switch (x) {
                        case 'center':
                            pos.left = rect.left + (rect.right - rect.left) / 2 - elementSizes.width / 2;
                            if (pos.left < 0) {
                                setLeft();
                            } else if (pos.left + elementSizes.width > windowSizes.width) {
                                setRight();
                            } else {
                                classNames.push('center');
                            }
                            break;
                        case 'right':
                            setRight();
                            break;
                        case 'left':
                        default:
                            if (rect.left + elementSizes.width < windowSizes.width) {
                                setLeft();
                            } else {
                                setRight();
                            }
                            break;
                    }

                    switch (y) {
                        case 'bottom':
                            if (rect.bottom + elementSizes.height < windowSizes.height) {
                                setBottom();
                            } else {
                                setTop();
                            }
                            break;
                        case 'top':
                        default:
                            if (rect.top - elementSizes.height > 0) {
                                setTop();
                            } else {
                                setBottom();
                            }
                            break;
                    }

                    this.positionClassNames = classNames.join(' ');

                    this.$element.css(pos);
                    this.$element.removeClass(
                        ['left', 'center', 'right', 'top', 'bottom']
                            .filter(el => !classNames.includes(el))
                            .join(' ')
                    );
                    this.$element.addClass(this.positionClassNames);
                    this.$element.removeClass('invisible');
                }
            }

            return {
                DropdownComponent
            };
        });
};

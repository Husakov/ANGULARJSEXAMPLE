module.exports = function (module) {

    module.directive('riDraggable', function () {
        'ngInject';

        let topContainer = angular.element('.app-container'),
            containerProps = {};


        function setContainerProps() {
            let pos = topContainer.offset();
            containerProps = {
                height: topContainer.height(),
                width: topContainer.width(),
                x: pos.left,
                y: pos.top
            }
        }

        function getPosition($e) {
            return {
                x: $e.clientX,
                y: $e.clientY
            };
        }

        function addPoints(p1, p2, operator = 1) {
            return {
                x: p1.x + operator * p2.x,
                y: p1.y + operator * p2.y
            };
        }

        class Controller {
            constructor($element) {
                'ngInject';
                this.$element = $element;
            }

            $onInit() {
                setContainerProps();
                this.setSizes();
                this.setPosition();
            }

            registerPointer(pointer) {
                this.pointers.push(pointer);
            }

            setSizes() {
                this.sizes = {
                    width: this.$element.width(),
                    height: this.$element.height()
                };
            }

            setPosition() {
                this.position = {
                    x: parseInt(this.$element.css('left'), 10),
                    y: parseInt(this.$element.css('top'), 10)
                };
            }

            startMove($e) {
                let startOffset = _.mapKeys(this.$element.offset(), (v, k) => k === 'left' ? 'x' : 'y'),
                    mousePos = getPosition($e);
                this.startOffset = addPoints(startOffset, mousePos, -1);
                this.startPosition = addPoints(this.position, mousePos, -1);
                this.setSizes();
            }

            move($e) {
                let mousePos = getPosition($e),
                    pos = addPoints(this.startPosition, mousePos),
                    offset = addPoints(this.startOffset, mousePos),
                    correction = {x: 0, y: 0};

                _.each({x: 'width', y: 'height'}, (side, axis) => {
                    if (offset[axis] + this.sizes[side] > containerProps[side] + containerProps[axis]) {
                        correction[axis] = containerProps[side] + containerProps[axis] - offset[axis] - this.sizes[side];
                    }

                    if (offset[axis] < containerProps[axis]) {
                        correction[axis] = containerProps[axis] - offset[axis];
                    }
                });

                pos = addPoints(pos, correction);

                this.position = pos;
                this.$element.css({
                    left: this.position.x,
                    top: this.position.y
                });
            }

            stopMove() {
                this.startPosition = null;
                this.setPosition();
            }
        }


        return {
            restrict: 'AE',
            controller: Controller,
            scope: {},
            link: function () {

            }
        };
    });
};

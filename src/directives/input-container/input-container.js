module.exports = function (module) {
    require('./input-container.scss');

    module
        .directive('inputContainer', function () {
            return {
                restrict: 'A',
                link: function ($scope, $element) {
                    let $input = $element.find('input');

                    $input.on('focus', function () {
                        setContainerFocused(true);
                        inputCheckValue();
                    });

                    $input.on('blur', function () {
                        setContainerFocused(false);
                        inputCheckValue();
                    });

                    function inputCheckValue() {
                        $element.toggleClass('has-value', $input.val().length > 0);
                    }

                    function setContainerFocused(isFocused) {
                        $element.toggleClass('input-focused', isFocused);
                    }
                }
            };
        });
};

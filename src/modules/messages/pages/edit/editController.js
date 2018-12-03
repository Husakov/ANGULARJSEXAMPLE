module.exports = function (module) {

    class Controller {
        constructor(messagesMediator, messagesEditNavSections, $scope) {
            'ngInject';
            this.mediator = messagesMediator;
            this.sections = messagesEditNavSections;
            this.mediator.isPreview = false;
            this.mediator.init();

            $scope.$on('$destroy', () => this.mediator.destroy());
        }
    }

    module
        .controller('MessagesEditController', Controller);
};

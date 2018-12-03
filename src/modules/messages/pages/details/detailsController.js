module.exports = function (module) {

    class Controller {
        constructor(messagesMediator, messagesDetailsNavSections, messagesActions, $scope) {
            'ngInject';
            this.mediator = messagesMediator;
            this.mediator.isPreview = true;
            this.sections = messagesDetailsNavSections;

            this.mediator.init();

            $scope.$on('$destroy', () => this.mediator.destroy());
        }
    }

    module
        .controller('MessagesDetailsController', Controller);
};

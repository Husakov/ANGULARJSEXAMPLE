module.exports = function (module) {
    class Controller {
        constructor(conversationManager, $scope, Users, slidePanelManager, pubSub, inboxHelper, $state) {
            'ngInject';
            this.helper = inboxHelper;
            this.conversationManager = conversationManager;

            this.profilePanel = slidePanelManager.render({
                template: '<inbox-profile-panel user="$ctrl.model._mainParticipant"></inbox-profile-panel>',
                $scope: $scope.$new()
            });

            $scope.$on('updateContact', () => {
                Users.get({id: this.model._mainParticipant.id})
                    .$promise
                    .then(user => this.model._mainParticipant = user);
            });

            pubSub.onStateChanged((event, toState, toParams) => {
                this.setParams(toParams);
            }, $scope);
            this.setParams($state.params);
        }

        setParams(params) {
            this.helper.setParams(params);
            if (params.id) {
                this.openConversation(params.id)
            }
        }

        openConversation(id) {
            if (this.conversationId !== id) {
                this.conversationId = id;
                this.model = this.conversationManager.get(id);
            }
        }
    }

    module
        .controller('MessagesInboxController', Controller);
};

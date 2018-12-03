require('./topmenu.scss');

const templateUrl = require('./topmenu.html');

class Controller {
    constructor($scope, $element, Profile, slidePanelManager, auth, app) {
        'ngInject';

        this.app = app;
        this.auth = auth;
        this.$scope = $scope;
        this.Profile = Profile;

        this.isOpen = false;
        this.logoutClicked = false;

        Profile.get().$promise.then((user) => {
            this.currentUser = user;
            this.ready = true;
        });

        this.activityPanel = slidePanelManager.render({
            template: '<activity author-id="$ctrl.currentUser.id"></activity>',
            background: true,
            slideAppContainer: true,
            $scope: $scope.$new()
        });

        $scope.$watch('$ctrl.isOpen', () => {
            this.isOpen ? $element.addClass('opened') : $element.removeClass('opened');
        });
    }

    logout() {
        this.logoutClicked = true;
        this.auth.logout();
    }

    onlineStatus(value) {
        let is_away = this.currentUser && this.currentUser.is_away;

        if (arguments.length) {
            is_away = !value;
            this.Profile.setAwayStatus(is_away);
            this.currentUser.is_away = is_away;
        }

        return !is_away;
    }

    changeApp(id) {
        if (id !== this.currentUser.current_app_id) {
            this.app.setApp(id);
        }
    }
}

module.exports = angular.module('intercom.components.topmenu', [])
    .component('topmenu', {
        templateUrl: templateUrl,
        controller: Controller
    });


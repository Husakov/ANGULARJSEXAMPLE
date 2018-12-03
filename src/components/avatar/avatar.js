require('./avatar.scss');

class Controller {
    constructor($scope) {
        'ngInject'

        if (this.showStatus) {
            this.status = 'on';
            $scope.$watch(() => this.item.is_away, () => {
                this.setStatus();
            });
            this.setStatus();
        }
    }

    setStatus() {
        let user = this.item;
        if (user) {
            this.status = user.is_away ? 'away' : 'on';
        }
    }

    getImg() {
        if (!this.item || !this.item.avatar) {
            return null;
        }
        let avatar = this.item.avatar;
        let size = this.size;

        if (avatar.image_urls) {
            if (avatar.image_urls.square_25 || avatar.image_urls.square_50 || avatar.image_urls.square_128) {
                if (size < 26 && avatar.image_urls.square_25) {
                    return avatar.image_urls.square_25;
                } else if (size < 51 && avatar.image_urls.square_50) {
                    return avatar.image_urls.square_50;
                } else {
                    return avatar.image_urls.square_128;
                }
            } else {
                if (size < 25 && avatar.image_urls.mini) {
                    return avatar.image_urls.mini;
                } else if (size < 49 && avatar.image_urls.mini_x2) {
                    return avatar.image_urls.mini_x2;
                } else if (size < 74 && avatar.image_urls.normal) {
                    return avatar.image_urls.normal;
                } else if (size < 128 && avatar.image_urls.normal_x2) {
                    return avatar.image_urls.normal_x2;
                } else {
                    return avatar.image_urls.large;
                }
            }
        } else if (avatar.image_url) {
            return avatar.image_url;
        } else {
            return null;
        }
    }

    isAdmin() {
        return _.has(this.item, 'is_team');
    }

    isTeam() {
        return _.has(this.item, 'is_team') && this.item.is_team;
    }
}

module.exports = angular.module('intercom.components.avatar', [])
    .component('avatar', {
        templateUrl: require('./index.html'),
        controller: Controller,
        bindings: {
            item  : '=',
            showStatus: '=',
            size  : '=',
            linkDisabled: '=?'
        }
    });

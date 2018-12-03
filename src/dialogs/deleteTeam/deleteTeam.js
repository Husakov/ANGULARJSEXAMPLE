'use strict';

const templateUrl = require('./index.html');
const baseModalCtrl = require('../baseModalCtrl.js');
const overlayTemplate = require('./overlay.html');
const SearchHelper = require('./searchHelper.js');

require('./deleteTeam.scss');

class Controller extends baseModalCtrl {
    constructor($scope, options, conversationManager, $timeout){
        'ngInject';
        super($scope, options);

        this.assignSearch = new SearchHelper(options.teams, options.admins);
        this.ovarlayTmpl = overlayTemplate;
        this.conversationManager = conversationManager;
        this.$timeout = $timeout;

        this.params = {
                assignee_identifier: this.options.team.id,
                status: 'opened',
                limit: 15,
                skip: 0,
                sort: 'desc'
            };

        conversationManager.on('changedStatus', ($event, ids, status, assignee) => {

            let admin = this.options.currentUser,
                    title = '',
                    to;
            to = admin.id === assignee.id ? 'themselves' : assignee.name;
            title = `${admin.name} assigned this conversation to ${to}`;

            this.avilableToRemove = true;

            return this._showOverlay(admin, title, assignee);
        });

        conversationManager
            .query(this.params)
                .$promise
                .then((conversations) => 
                    this.convercations_ids = _.map(conversations, conversation => conversation.id))
    }

    _showOverlay(who, title, to) {
        this.overlay = {
            who,
            title,
            to
        };
        this.$timeout(() => {
            this.overlay = null;
        }, 2500);
    }

    changeStatus(assign) {
        this.conversationManager
            .changeStatus(this.convercations_ids, 'assignment', assign)
    }
}

module.exports = {
    name: 'deleteTeam',
    open: function ($uibModal, options) {
        let modalInstance = $uibModal.open({
            templateUrl: templateUrl,
            controller: Controller,
            controllerAs: '$ctrl',
            resolve: {
                options: function () {
                    return _.defaults({}, options, {
                        title: '',
                        body: ''
                    });
                }
            },
            windowClass: 'delete-team-dialog'
        });

        return modalInstance.result;
    }
};
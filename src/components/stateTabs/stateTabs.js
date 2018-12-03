'use strict';
let templateUrl = require('./index.html');
require('./state-tabs.scss');

class Controller {

    constructor($state) {
        'ngInject';
        this.$state = $state;
    }

    getCurrentTitle() {
        let currentTab = _.find(this.tabs, tab => this.$state.includes(tab.state));
        return currentTab ? currentTab.title : '';
    }
}

module.exports = angular.module('intercom.components.stateTabs', [])
    .component('stateTabs', {
        templateUrl,
        controller: Controller,
        bindings: {
            tabs: '<'
        }
    });

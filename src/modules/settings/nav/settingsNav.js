module.exports = function (module) {
    require('./settings-nav.scss');

    let templateUrl = require('./index.html');

    let categories = [
        {alias: 'general', name: 'General', icon: 'bars', active: false, hidden: false},
        {alias: 'personal', name: 'Personal Settings', icon: 'user', active: false, hidden: false},
        {alias: 'communication', name: 'Communication', icon: 'paper-plane', active: false, hidden: false},
        {alias: 'app-data', name: 'App Data', icon: 'database', active: false, hidden: false},
        {alias: 'installation', name: 'Installation', icon: 'folder-open', active: false, hidden: STAGE_OR_PROD},
        {alias: 'more', name: 'More Options', icon: 'ellipsis-h', active: false, hidden: STAGE_OR_PROD}
    ];
    let sections = [
        /* general */
        {alias: 'general', name: 'App Info', category: 'general', hidden: false},
        {alias: 'teammates', name: 'Teammates', category: 'general', hidden: false},
        {alias: 'billing', name: 'Billing', category: 'general', hidden: STAGE_OR_PROD},
        {alias: 'integrations', name: 'Integrations', category: 'general', hidden: STAGE_OR_PROD},

        /* personal */
        {alias: 'account', name: 'Account', category: 'personal', hidden: false},
        {alias: 'oauth-tokens', name: 'OAuth Tokens', category: 'personal', hidden: STAGE_OR_PROD},

        /* communication */
        {alias: 'messaging', name: 'Messaging', category: 'communication', hidden: false},
        {alias: 'app-messenger', name: 'Application Messenger', category: 'communication', hidden: false},
        {alias: 'appearance', name: 'Appearance', category: 'communication', hidden: false},
        {alias: 'email-templates', name: 'Email Templates', category: 'communication', hidden: STAGE_OR_PROD},
        {alias: 'email-addresses', name: 'Email Addresses', category: 'communication', hidden: STAGE_OR_PROD},

        /* app-data */
        {alias: 'tags-segments', name: 'Tags & Segments', category: 'app-data', hidden: false},
        {alias: 'attributes-events', name: 'Attributes & Events', category: 'app-data', hidden: STAGE_OR_PROD},
        {alias: 'imports', name: 'Imports', category: 'app-data', hidden: STAGE_OR_PROD},
        {alias: 'data-upkeep', name: 'Data Upkeep', category: 'app-data', hidden: STAGE_OR_PROD},

        /* installation */
        {alias: 'web', name: 'Web', category: 'installation', hidden: STAGE_OR_PROD},
        {alias: 'ios', name: 'iOS', category: 'installation', hidden: STAGE_OR_PROD},
        {alias: 'android', name: 'Android', category: 'installation', hidden: STAGE_OR_PROD},

        /* more */
        {alias: 'secure-mode', name: 'Secure Mode', category: 'more', hidden: STAGE_OR_PROD},
        {alias: 'oauth', name: 'OAuth', category: 'more', hidden: STAGE_OR_PROD},
        {alias: 'personal-access-token', name: 'Personal Access Token', category: 'more', hidden: STAGE_OR_PROD}
    ];

    class Controller {
        constructor($scope, $rootScope, $state) {
            'ngInject';
            let off = $rootScope.$on('$stateChangeSuccess', (event, toState) => {
                this.setActiveSection(toState.name);
            });
            $scope.$on('$destroy', off);

            this.categories = categories;
            this.sections = sections;

            this.setActiveSection($state.$current.name);
            this.setActiveCategory(_.find(this.categories, {alias: this.activeSection.category}));
        }

        setActiveCategory(category) {
            if (angular.isDefined(this.activeCategory)) {
                this.activeCategory.active = false;
            }
            this.activeCategory = category;
            this.activeCategory.active = true;
        }

        sectionIsActive(section) {
            return this.activeSection.alias === section.alias;
        }

        setActiveSection(stateName) {
            let sectionName = stateName.match(/[^.]+/g)[1] || _.first(this.sections).alias;

            this.activeSection = _.find(this.sections, {alias: sectionName});
        }
    }

    module
        .component('settingsNav', {
            templateUrl: templateUrl,
            controller: Controller,
            controllerAs: 'ctrl'
        });
};

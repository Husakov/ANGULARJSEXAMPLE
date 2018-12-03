function pageTemplate(folder, file = 'index') {
    return require(`./pages/${folder}/${file}.html`);
}

const templates = {
    steps: pageTemplate('steps')
};

module.exports = function (module) {
    module.config(function ($stateProvider, importImportTypesHelperProvider) {
        'ngInject';
        const baseState = 'import';

        $stateProvider
            .state(baseState, {
                data: {
                    permissions: {
                        only: 'isAuthorized',
                        redirectTo: 'login'
                    }
                },
                url: '/import',
                template: '<div class="import-container" ui-view></div>',
                redirectTo: function ($window, $q) {
                    $window.history.back();
                    return $q.reject();
                }
            })
            .state(`${baseState}.steps`, {
                url: `/{type: ${importImportTypesHelperProvider.registeredTypes.join('|')}}`,
                controller: 'ImportStepsController as $ctrl',
                templateUrl: templates.steps,
                redirectTo: `${baseState}.steps.step`
            })
            .state(`${baseState}.steps.step`, {
                url: `/step-:step`
            });
    });
};

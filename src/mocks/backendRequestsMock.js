'use strict';

require('angular-mocks');

module.exports = angular.module('intercom.mocks', [
    'ngMockE2E'
])
    .run(function ($httpBackend, CONFIG) {
        'ngInject';

        let baseUrl = CONFIG.apiUrl;

        $httpBackend
            .whenGET(baseUrl + '/settings')
            .respond(require('./generalSettings.json'));

        $httpBackend
            .whenPUT(baseUrl + '/settings')
            .respond(require('./generalSettings.json'));

        $httpBackend
            .whenDELETE(baseUrl + '/settings/general')
            .respond({
                status: 'ok'
            });

        $httpBackend.whenGET(/[\s\S]*/).passThrough();
        $httpBackend.whenPUT(/[\s\S]*/).passThrough();
        $httpBackend.whenPOST(/[\s\S]*/).passThrough();
        $httpBackend.whenDELETE(/[\s\S]*/).passThrough();
    });

var templateUrl = require('./users-segments.html');

require('./users-segments.scss');

module.exports = angular.module('intercom.components.usersSegments', [
    'ui.router',
    require('../../services/segments-srv.js').name
])

    .directive('usersSegments', function ($state, Segment) {
        'ngInject';
        class Controller {
            constructor() {
                let vm = this;

                vm.currentUser = vm.currentUser || { visible_segment_ids : []};
                vm.segments = [];
                vm.segmentAccordion = {
                    predefined : true,
                    custom: false
                };
                vm.test = false;

                Segment.filteredList({
                    is_company: vm.companyMode
                }).$promise.then(segments => {
                    vm.segments = segments;
                    vm.selectedSegment = _.find(vm.segments, {
                        id: $state.params.segmentId
                    });
                    vm.listState = vm.companyMode ? 'companies' : 'customers';
                });


                vm.segmentsOrder = (segment) => {
                    return segment.id;
                }
            }
        }

        return {
            restrict: 'E',
            templateUrl,
            controller: Controller,
            controllerAs: 'ctrl',
            scope: {
                companyMode: '='
            },
            bindToController: true
        };
    });

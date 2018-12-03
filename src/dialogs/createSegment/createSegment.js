const templateUrl = require('./index.html');

require('./createSegment.scss');

class Controller {
    constructor($state, $window, $scope, Segment, companyMode, segment) {
        'ngInject';

        this.$state = $state;
        this.$window = $window;
        this.$scope = $scope;
        this.Segment = Segment;

        this.companyMode = companyMode;
        this.segment = segment;
        this.mode = 'create';
        this.name = '';
    }

    onManageSegments() {
        const url = this.$state.href('settings.tags-segments');

        this.$window.open(url, '_blank');
    }

    _update() {
        this.Segment.clearCache();

        this.Segment.update({ id: this.segment.id }, _.omit(this.segment, [
            'app_id',
            'created_by_id',
            'is_editable',
            'count'
        ])).$promise.then(segment => {
            this.$scope.$close(segment);
        })
    }

    _create() {
        const segment = {
            name: this.name,
            is_company: this.companyMode,
            predicates: this.segment.predicates
        };

        this.Segment.clearCache();

        this.Segment.create({}, segment).$promise.then(segment => {
            this.$scope.$close(segment);
        })
    }

    close() {
        this.mode === 'create' ?
            this._create() :
            this._update();
    }

    cancel() {
        this.$scope.$dismiss();
    }
}

module.exports = {
    name: 'createSegment',
    open: function ($uibModal, companyMode, segment) {
        const modalInstance = $uibModal.open({
            templateUrl,
            controller: Controller,
            controllerAs: '$ctrl',
            windowClass: 'create-segment',
            resolve: {
                companyMode,
                segment
            }
        });

        return modalInstance.result;
    }
};

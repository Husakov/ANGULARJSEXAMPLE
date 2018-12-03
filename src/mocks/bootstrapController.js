require('./bootstrap.scss');

class Controller {
    constructor($scope) {
        'ngInject';
        $scope.oneAtATime = true;
    }
}

module.exports = Controller;

'use strict';

module.exports = class Dialogs {
    constructor() {
        'ngInject';
        this.dialogs = {};
    }

    register(options) {
        this.dialogs[options.name] = options.open;
        return this;
    }

    $get($uibModal) {
        'ngInject';

        _.each(this.dialogs, (val, key) => {
            this.dialogs[key] = _.bind(val, null, $uibModal);
        });

        return this.dialogs;
    }
};

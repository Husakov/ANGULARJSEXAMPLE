'use strict';

let templateUrl = require('./login.html');

require('./style.scss');

class Controller {
    constructor(auth, $state, notifier) {
        'ngInject';
        this.auth = auth;
        this.$state = $state;
        this.notifier = notifier;
        this.model = {};
    }

    login() {
        if (this.form.$valid && !this.form.$submitted) {
            this.form.$setSubmitted();
            this.auth.login(this.model)
                .then(() => {

                })
                .catch((err) => {
                    this.form.$setPristine();
                    if (err.message) {
                        this.notifier.error(err.message);
                    }
                });
        }
    }
}

module.exports = {
    templateUrl,
    controller: Controller
};

module.exports = class Step {
    constructor($element) {
        this.$element = $element;

        this.description = '';
        this.template = null;
        this.templateUrl = null;
        this.required = true;

        this.$element.addClass('step-component');
    }

    $onInit() {
        this.isReady = true;
        this.onReady({step: this});
    }

    validate() {
        return true;
    }

    next() {

    }

    init() {

    }
};

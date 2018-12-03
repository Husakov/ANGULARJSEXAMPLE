module.exports = function (module) {
    module.service('contactPredicatesHelper', class ContactPredicatesHelper {
        constructor($state) {
            'ngInject';
            this.$state = $state;
        }

        adaptDateToObject(date) {
            return {
                day: date.getUTCDate(),
                month: date.getUTCMonth(),
                year: date.getUTCFullYear()
            }
        }

        generateUrlForPredicate({
            attribute,
            value,
            type,
            comparison
        }, mode) {
            if (!attribute || !type || !comparison || !mode) return;

            return this.$state.href(
                'contacts.list.mode',
                {
                    mode,
                    predicates: angular.toJson([{
                        type,
                        attribute,
                        comparison,
                        value
                    }])
                },
                {
                    inherit: false,
                    reload: true
                }
            );
        }
    });
};

module.exports = function (mod) {
    mod.directive('textEditorMentionFixer', function (textEditorElementsHelper, Admin) {
        'ngInject';
        let admins = Admin.query(),
            className = textEditorElementsHelper.MENTION_CLASS,
            idRegExp = textEditorElementsHelper.MENTION_ID_REGEXP;

        function fixMentions(html) {
            if (html && idRegExp.test(html)) {
                let $div = angular.element('<div></div>');
                $div.html(html);
                $div.find(`.${className}`)
                    .each((i, el) => {
                        let $el = angular.element(el),
                            classNames = $el.attr('class'),
                            match = idRegExp.exec(classNames),
                            id = match && match[1],
                            admin = id && _.find(admins, {id});
                        if (admin) {
                            $el.replaceWith(textEditorElementsHelper.getMentionTemplate(admin));
                        } else if (id) {
                            $el.replaceWith(textEditorElementsHelper.getMentionTemplate({id, name: $el.text()}));
                        }

                    });
                html = $div.html();
            }
            return html;
        }

        return {
            restrict: 'A',
            require: '^ngModel',
            link: function ($scope, $element, $attrs, ngModel) {
                $attrs.$observe('textEditorMentionFixer', value => {
                    if (value) {
                        ngModel.$formatters.push(fixMentions);
                    } else {
                        _.pull(ngModel.$formatters, fixMentions);
                    }
                });
            }
        };
    });
};

module.exports = function (module) {

    const templates = (function () {
        const req = require.context('./sidebar-templates', true, /\.html$/);
        const regExp = /^\.\/(.*)\.html$/;
        const result = {};
        req.keys()
            .forEach(key => {
                result[key.replace(regExp, '$1')] = req(key);
            });
        return result;
    })();

    class Controller {
        constructor(messagesMediator, messagesEditNavSections) {
            'ngInject';
            this.templates = templates;
            this.mediator = messagesMediator;
            this.sections = messagesEditNavSections;
        }
    }

    module
        .controller('MessagesEditSidebarController', Controller);
};

module.exports = angular.module('riika.modules', [
    require('./contacts/contacts.module').name,
    require('./messages/messages.module').name,
    require('./import/import.module').name,
    require('./settings/settings.module').name
]);

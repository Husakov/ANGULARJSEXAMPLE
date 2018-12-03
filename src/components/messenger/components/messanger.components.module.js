module.exports = angular.module('intercom.components.messenger.components', [])
    .component('messengerMessage', require('./message/message'))
    .component('reply', require('./reply/reply'));
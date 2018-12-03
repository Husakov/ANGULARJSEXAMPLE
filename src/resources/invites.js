module.exports = function (module) {
    module
        .factory('Invites', (AuthResource) => {
            'ngInject';

            var mainInviteResource = AuthResource('invite/:token', {token: '@token'}, {
                makeInvite: {
                    method: 'POST',
                    url: 'invite'
                },
                reSendInvite: {
                    method: 'POST',
                    url: 'invite/:token/resend'
                }
            });

            return mainInviteResource

        });
};
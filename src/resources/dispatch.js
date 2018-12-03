module.exports = function (module) {
    module
        .factory('Dispatch', (AuthResource) => {
            'ngInject';

            const DispatchResource = AuthResource.decorate();

            return DispatchResource('newmessage/:id', {id: '@id'}, {
                query: {
                    method: 'GET',
                    isArray: true,
                    params: {
                        include_count: true
                    }
                },
                counts: {
                    url: 'newmessage/counts_detailed',
                    method: 'GET'
                },
                send: {
                    method: 'POST',
                    url: 'newmessage/:id/send'
                },
                sendToEmail: {
                    method: 'POST',
                    url: 'newmessage/send_test_message'
                },
                stats: {
                    method: 'GET',
                    url: 'newmessage/:id/messages',
                    isArray: true,
                    params: {
                        include_count: true
                    }
                },
                startLive: {
                    method:'POST',
                    url: 'newmessage/:id/start'
                },
                stopLive: {
                    method:'POST',
                    url: 'newmessage/:id/stop'
                },
                startLiveVersion: {
                    method:'POST',
                    url: 'newmessage/:id/variation/:index/start'
                },
                stopLiveVersion: {
                    method:'POST',
                    url: 'newmessage/:id/variation/:index/stop'
                },
                deleteVersion: {
                    method:'DELETE',
                    url: 'newmessage/:id/variation/:index'
                }
            });
        });
};

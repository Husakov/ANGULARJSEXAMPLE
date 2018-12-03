module.exports = function (mod) {
    mod
        .config(['RollbarProvider', function (RollbarProvider) {
            'ngInject';
            RollbarProvider.init({
                accessToken: ROLLBAR_ID,
                captureUncaught: true,
                payload: {
                    environment: ENV
                }
            });
        }]);
};

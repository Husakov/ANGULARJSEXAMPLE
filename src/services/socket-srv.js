const sailsIO = require('sails.io.js');
const socketIO = require('socket.io-client');

module.exports = function (module) {
    module
        .factory('socketSrv', (auth, app, $q, $http, $log, CONFIG) => {
            'ngInject';
            const initUrl = CONFIG.apiUrl + '/admin/socket_init';

            class SocketSrv {
                constructor() {
                    this.client = sailsIO(socketIO);
                    this.client.sails.autoConnect = false;
                    this.client.sails.environment = 'production';
                    this.client.sails.url = CONFIG.socketUrl;
                    this.client.sails.useCORSRouteToGetCookie = false;
                    this.client.sails.transports = ['polling'];
                    this.client.sails.headers = {
                        'X-Token': auth.getToken(),
                        'X-App': app.getAppId()
                    };
                    this.events = {};
                    this.connect();
                }

                connect() {
                    this.socket = this.client.sails.connect();
                    this.socket.on('connect', () => {
                        this.socket.get(initUrl, {}, () => {
                        });
                    });
                    this.socket.on('disconnect', () => {
                        this.socket.reconnect();
                    });
                }

                post(url, data, cb = () => {
                }) {
                    let deferred = $q.defer();
                    url = url.replace(CONFIG.socketUrl, '');
                    $log.info('post', data);
                    this.socket.post(url, data, function (resData, JWR) {
                        $log.info('post_response', resData);
                        cb(resData, JWR);
                        deferred.resolve(resData);
                    });
                    return deferred.promise;
                }
            }

            return new SocketSrv();
        });
};
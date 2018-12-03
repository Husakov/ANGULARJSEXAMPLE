module.exports = function (module) {

    let wallpapers = [
        {
            url: '',
            retinaUrl: '',
            name: 'none'
        },
        {
            url: require('../assets/images/backgrounds/light_wool.png'),
            retinaUrl: require('../assets/images/backgrounds/light_wool@2X.png'),
            name: 'light_wool'
        },
        {
            url: require('../assets/images/backgrounds/connect.png'),
            retinaUrl: require('../assets/images/backgrounds/connect@2X.png'),
            name: 'connect'
        },
        {
            url: require('../assets/images/backgrounds/foggy_birds.png'),
            retinaUrl: require('../assets/images/backgrounds/foggy_birds@2X.png'),
            name: 'foggy_birds'
        },
        {
            url: require('../assets/images/backgrounds/geometry.png'),
            retinaUrl: require('../assets/images/backgrounds/geometry@2X.png'),
            name: 'geometry'
        },
        {
            url: require('../assets/images/backgrounds/photography.png'),
            retinaUrl: require('../assets/images/backgrounds/photography@2X.png'),
            name: 'photography'
        },
        {
            url: require('../assets/images/backgrounds/square_bg.png'),
            retinaUrl: require('../assets/images/backgrounds/square_bg@2X.png'),
            name: 'square_bg'
        },
        {
            url: require('../assets/images/backgrounds/subtle_white_feathers.png'),
            retinaUrl: require('../assets/images/backgrounds/subtle_white_feathers@2X.png'),
            name: 'subtle_white_feathers'
        },
        {
            url: require('../assets/images/backgrounds/xv.png'),
            retinaUrl: require('../assets/images/backgrounds/xv@2X.png'),
            name: 'xv'
        }
    ];

    module
        .factory('MessangerSettings', (AuthResource) => {
            'ngInject';
            return AuthResource('app/messanger_settings');
        })
        .factory('MessangerAppearance', (AuthResource) => {
            'ngInject';
            let resource = AuthResource('app/appearance_settings');

            resource.wallpapers = function () {
                return wallpapers;
            };
            return resource;
        })
        .factory('GeneralSettings', function (AuthResource) {
            'ngInject';

            return AuthResource('app/general_settings', {}, {
                deleteApplication: {
                    method: 'DELETE',
                    url: 'app/:id'
                }
            });
        })
        .factory('MessagingSettings', function (AuthResource) {
            'ngInject';

            return AuthResource('app/messaging_settings');
        });
};
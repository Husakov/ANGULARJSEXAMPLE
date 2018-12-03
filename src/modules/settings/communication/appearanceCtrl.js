module.exports = class Controller {
    constructor(MessangerAppearance, notifier, IS_RETINA) {
        'ngInject';

        this.notifier = notifier;
        this.IS_RETINA = IS_RETINA;

        this.model = MessangerAppearance.get();

        this.fakeUserName = 'John Smith';

        this.wallpapers = MessangerAppearance.wallpapers();
    }

    updateAppDetails() {
        this.model.$save();
        this.generalAppForm.$setPristine();
        this.notifier.success('Your App settings have been updated');
    }

    getWallpaper() {
        let wallpaper = _.find(this.wallpapers, item => item.url === this.model.messenger_background);
        if (wallpaper) {
            return this.IS_RETINA ? wallpaper.retinaUrl : wallpaper.url;
        } else {
            return null;
        }
    }
};

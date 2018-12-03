const mod = angular.module('riika.components', [
    require('./stateTabs/stateTabs').name,
    require('./emojDropdown/emojDropdown').name,
    require('./giphyDropdown/giphyDropdown').name,
    require('./loader/loader').name,
    require('./draggable/draggable.module').name,
    require('./avatar/avatar.js').name,
    require('./ui-toggle/ui-toggle').name,
    require('./leaflet-map/leaflet-map').name,
    require('./topmenu/topmenu').name,
    require('./secondmenu/secondmenu').name,
    require('./typing/typing').name,
    require('./upload/upload.module').name,
    require('./scrollList/scrollList.module').name,
    require('./messenger/messenger.module').name,
    require('./tag-search/tag-search').name,
    require('./saved-replies-manager/saved-replies-manager').name,
    require('./slide-panel/slide-panel').name,
    require('./admin-team-search/adminTeamSearch').name,
    require('./contactDetails/contactDetails').name,
    require('./slides/slides.module').name,
    require('./users-filter/users-filter.module').name,
    require('./text-editor2/text-editor.module').name,
    require('./users-preview/users-preview.module').name,
    require('./activity/activity.module').name
]);

require('./list-search/list-search')(mod);

module.exports = mod;

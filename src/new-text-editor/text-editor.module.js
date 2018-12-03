require('angular');
require('angular-sanitize');
require('angular-animate');

require('./style.scss');

const mod = module.exports = angular
    .module('riika.textEditor', [
        'ngSanitize',
        require('angular-resource'),
        require('angular-cookies'),
        require('angular-ui-bootstrap'),
        require('angular-ui-router'),
        require('angular-local-storage'),

        require('../resources/base/resources.base.module').name,
        require('mnh-shared/dist/index.angular'),
        require('../components/text-editor2/text-editor.module').name,
        require('../components/emojDropdown/emojDropdown').name,
        require('../components/saved-replies-manager/saved-replies-manager').name
    ]);

require('../app.constants')(mod);
require('../resources/savedReply')(mod);
require('../resources/admin')(mod);
require('../resources/profile')(mod);
require('../services/app')(mod);
require('../services/auth')(mod);
require('../services/pubSub')(mod);
require('../services/dropdownHelper')(mod);
require('../services/emojis')(mod);
require('../filters/emojis')(mod);
require('../directives/ri-scrollbar/ri-scrollbar')(mod);
require('../directives/model-formatter')(mod);

mod
    .controller('BaseController', class BaseController {
        constructor() {
            this.model = [
                {
                    text: 'Base value',
                    align: 'left',
                    type: 'paragraph'
                }
            ];
        }

        setBlocks() {
            this.model = [{
                type: 'paragraph',
                text: 'Setted from controller'
            }];
        }
    });

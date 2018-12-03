module.exports = function (mod) {
    require('./video.scss');

    const popoverTemplateUrl = require('./popover.html');

    const httpRegExpPrefix = /^https?:\/\//i;
    const formatter = {
        videoUrl: {
            $parsers: [function (value) {
                if (!httpRegExpPrefix.test(value)) {
                    value = `http://${value}`;
                }
                return value;
            }]
        }
    };

    class Controller {
        constructor(mnhVideoUtils, $scope, $element, $templateCache, $timeout, $q) {
            'ngInject';
            this.videoUtils = mnhVideoUtils;
            this.$scope = $scope;
            this.$videoElement = $element.find('.mnh-m-video');
            this.$thumbElement = this.$videoElement.find('.mnh-m-video-item');
            this.popoverTemplate = $templateCache.get(popoverTemplateUrl);
            this.$timeout = $timeout;
            this.$q = $q;
            this.formatter = formatter;
            this.popover = null;

            this.videoUrl = '';

            $scope.$watch(() => this.videoUrl, () => this.setModel());
            $scope.$watch(() => this.model, () => this.commitModel(), true);
            $scope.$on('focus', () => {
                this.$videoElement.focus();
            });
        }

        $onInit() {
            if (this.container.injected) {
                this.$timeout(() => {
                    this.$videoElement.focus();
                    this.$videoElement.click();
                    this.container.$scope.$broadcast('inside');
                });
            }

            this.model = angular.merge(
                this.model || {},
                {
                    type: 'video',
                    provider: '',
                    id: ''
                },
                this.container.getModel()
            );
            this.setThumbUrl();
        }

        open($e) {
            if (this.popover) {
                this.popover.hide();
            }
            if ($e) {
                $e.preventDefault();
            }
            this.setVideoUrl();
            let $scope = this.$scope.$new();
            this.popover = this.editor.popover;
            this.popover.show(this.popoverTemplate, $scope, this.$videoElement);
            this.popover.onHide(() => {
                this.popover = null;
            }, $scope);
            this.$timeout(() => {
                this.popover.$container.find('input').eq(0).focus();
            }, 100);
        }

        close() {
            if (this.popover) {
                this.popover.hide();
            }
        }

        updatePopoverPosition() {
            _.defer(() => {
                if (this.popover) {
                    this.popover.updatePosition(this.$videoElement);
                }
            });
        }

        remove() {
            if (this.popover) {
                this.popover.hide();
            }
            this.container.remove();
            this.editor.emitter.emit('sync');
        }

        onKey($e) {
            switch ($e.keyCode) {
                case 8:
                case 46:
                    this.remove();
                    break;
                case 13:
                    this.open($e);
                    break;
                default:
                    break;
            }
        }

        onKeyInPopover($e) {
            switch ($e.keyCode) {
                case 27:
                    this.close();
                    this.$videoElement.focus();
                    break;
                default:
                    break;
            }
        }

        setVideoUrl() {
            let {provider, id} = this.model;
            if (provider && id) {
                let videoInfo = this.videoUtils.getInfoByProvider(provider, id);
                this.videoUrl = videoInfo.getVideoSrc();
            }
        }

        setThumbUrl() {
            let {provider, id} = this.model;
            if (provider && id) {
                let videoInfo = this.videoUtils.getInfoByProvider(provider, id);
                videoInfo.getThumbUrl()
                    .then(thumbUrl => {
                        this.$thumbElement.css('background-image', `url(${thumbUrl})`);
                    });
            }
        }

        setModel() {
            let {provider, id} = this.videoUtils.getInfoBySrc(this.videoUrl) || {};
            if (provider && id) {
                this.model.provider = provider;
                this.model.id = id;
                this.setThumbUrl();
            }
        }

        commitModel() {
            this.container.setModel(this.model);
        }
    }

    mod.component('teVideo', {
        controller: Controller,
        require: {
            editor: '^textEditor',
            container: '^te-component'
        },
        templateUrl: require('./index.html')
    });
};

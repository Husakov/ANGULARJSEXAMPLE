module.exports = function (mod) {

    mod.factory('TextEditorParser', function (mnhMessageUtils, mnhVideoUtils, emojis) {
        'ngInject';

        const {
            MessageParser,
            blockGenerators,
            contentGenerators,
            beforeBlockModerators
        } = mnhMessageUtils;

        class TEComponentBlockGenerator extends blockGenerators.BlockGenerator {
            generate($element) {
                return angular.fromJson(_.unescape($element.attr('data-model')));
            }
        }

        class TEComponentContentGeneratore extends contentGenerators.ContentGenerator {
            toHtml(block) {
                const model = _.escape(angular.toJson(block));
                return `<te-component data-model="${model}"></te-component>`;
            }
        }

        class TEVideoParserContentGenerator extends contentGenerators.ContentGenerator {
            toHtml(block) {
                const info = mnhVideoUtils.getInfoByProvider(block.provider, block.id);
                return info.getVideoSrc();
            }
        }

        class TEEmojBeforeBlockGenerator extends beforeBlockModerators.BeforeBlockModerator {
            prepare($container) {
                $container.html(emojis.toText($container.html()));
            }
        }

        return class TextEditorParser extends MessageParser {
            constructor(options) {
                const configs = {
                    contentGenerators: {
                        button: TEComponentContentGeneratore,
                        video: TEComponentContentGeneratore
                    },
                    blockGenerators: {
                        'te-component': TEComponentBlockGenerator
                    },
                    beforeBlockModerators: []
                        .concat(TEEmojBeforeBlockGenerator, beforeBlockModerators.defaultBeforeBlockModerators)
                };

                if (options.parseVideoUrls) {
                    configs.beforeBlockModerators.unshift(beforeBlockModerators.ParseVideoUrlsBeforeBlockModerator);
                    configs.contentGenerators.video = TEVideoParserContentGenerator;
                }
                super(configs);
            }
        };
    });
};

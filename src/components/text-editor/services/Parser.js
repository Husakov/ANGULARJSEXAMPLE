module.exports = function (module) {

    module
        .factory('TextEditorParser', function (mnhMessageUtils, textEditorElementsHelper, mnhVideoUtils) {
            'ngInject';

            const elementHelper = textEditorElementsHelper;
            const DATA_ATTR = elementHelper.dataParser.DATA_ATTR;
            const {
                MessageParser,
                contentGenerators,
                blockGenerators,
                beforeBlockModerators
            } = mnhMessageUtils;

            class TEButtonContentGenerator extends contentGenerators.ContentGenerator {
                toHtml(block) {
                    let isEmpty = block.text.length === 0,
                        title = !isEmpty ? block.text : undefined,
                        classes = !isEmpty ? '' : undefined;
                    return elementHelper.getButtonTemplate({
                        align: block.align,
                        href: block.linkUrl,
                        title,
                        classes
                    });
                }
            }

            class TEVideoContentGenerator extends contentGenerators.ContentGenerator {
                toHtml(block) {
                    return elementHelper.getVideoTemplate({
                        provider: block.provider,
                        id: block.id
                    });
                }
            }

            class TEVideoParserContentGenerator extends contentGenerators.ContentGenerator {
                toHtml(block) {
                    const info = mnhVideoUtils.getInfoByProvider(block.provider, block.id);
                    return info.getVideoSrc();
                }
            }

            class TEImgContentGenerator extends contentGenerators.ImageContentGenerator {
                toHtml(block) {
                    return elementHelper.getImageTemplate(block);
                }
            }

            class TEButtonBlockGenerator extends blockGenerators.BlockGenerator {
                generate($element) {
                    let $a = $element.find('a');
                    return {
                        type: 'button',
                        align: $element.css('text-align') || 'center',
                        text: !$a.hasClass('untouched') ? $a.text() : '',
                        linkUrl: $a.attr('href')
                    };
                }
            }

            class TEVideoBlockGenerator extends blockGenerators.BlockGenerator {
                generate($element) {
                    let $video = $element.find('.video-thumb'),
                        {data} = textEditorElementsHelper.getData($video),
                        {id, provider} = data || {};
                    return {
                        type: 'video',
                        provider,
                        id
                    };
                }
            }

            class TEImageWrapperBeforeBlockModerator extends beforeBlockModerators.BeforeBlockModerator {
                prepare($container) {
                    $container.find('.mnh-m-img-wrapper')
                        .each((i, el) => {
                            let $el = angular.element(el);
                            $el.replaceWith($el.find('img'));
                        });
                }
            }

            class TECleanerBeforeBlockModerator extends beforeBlockModerators.BeforeBlockModerator {
                prepare($container) {
                    $container.find('.rangySelectionBoundary').remove();
                    $container.find(`.${elementHelper.NEW_LINE_FIXER_CLASS}`).remove();
                    $container.find(`[${DATA_ATTR}]`).each((i, el) => el.removeAttribute(DATA_ATTR));
                }
            }

            return class TextEditorParser extends MessageParser {
                constructor(options) {
                    const configs = {
                        contentGenerators: {
                            button: TEButtonContentGenerator,
                            video: TEVideoContentGenerator,
                            image: TEImgContentGenerator
                        },
                        blockGenerators: {
                            '.mnh-m-btn-wrapper': TEButtonBlockGenerator,
                            '.mnh-m-video-wrapper': TEVideoBlockGenerator
                        },
                        beforeBlockModerators: [TECleanerBeforeBlockModerator, TEImageWrapperBeforeBlockModerator]
                            .concat(beforeBlockModerators.defaultBeforeBlockModerators)
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

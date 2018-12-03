module.exports = function (module) {
    module
        .factory('textEditorElementsHelper', function () {
            'ngInject';

            class DataParser {
                constructor() {
                    this.DATA_ATTR = 'abbr';
                }

                getDataStr() {
                    let data = angular.merge({}, ..._.toArray(arguments).reverse());
                    return angular.toJson(data).trim();
                }

                getDataObj(str) {
                    let data = {};
                    try {
                        data = angular.fromJson(_.unescape(str) || '{}') || {};
                    } catch (e) {
                        data = {};
                    }
                    return data;
                }

                setData($element, newData) {
                    let data = this.getDataStr(newData, this.getData($element));
                    if (data.length > 0) {
                        $element.attr(this.DATA_ATTR, _.escape(data));
                    }
                }

                getData($element) {
                    let str = $element.attr(this.DATA_ATTR);
                    return this.getDataObj(str);
                }

                getAttrStr() {
                    return `${this.DATA_ATTR}="${_.escape(this.getDataStr(..._.toArray(arguments)))}"`;
                }
            }

            class ElementsHelper {

                constructor() {
                    this.dataParser = new DataParser();
                    this.NOT_EDITABLE_ATTR = this.dataParser.getAttrStr({attributes: {contenteditable: 'false'}});
                    this.EDITABLE_ATTR = this.dataParser.getAttrStr({attributes: {contenteditable: 'true'}});

                    this.BUTTON_DEFAULT_TEXT = 'Add button text';
                    this.BUTTON_TEMPLATE = this.getButtonTemplate();
                    this.VIDEO_TEMPLATE = this.getVideoTemplate();
                    this.MENTION_CLASS = 'mention';
                    this.MENTION_ID_REGEXP = new RegExp(`${this.MENTION_CLASS}_(\\w+)`, 'g');

                    this.NEW_LINE_FIXER_CLASS = 'new-line-fixer';
                    this.ENTERED_LIST_ITEM_CLASS = 'entered-list-item';
                }

                setData($element, newData) {
                    this.dataParser.setData($element, newData);
                }

                getData($element) {
                    return this.dataParser.getData($element);
                }

                getImageTemplate({url, width, heigth} = {}) {
                    let wrapperClasses = `action-wrapper mnh-m-img-wrapper`,
                        elementClasses = `action-element skip-action`,
                        dataAttr = {
                            attributes: {
                                contenteditable: 'false',
                                tabindex: '2'
                            }
                        },
                    src = url ? `src="${url}"` : '',
                    sizes = width ? `width="${width}"` : '';
                    sizes += heigth ? ` heigth="${heigth}"` : '';
                    return `<div class="${wrapperClasses}" ${this.NOT_EDITABLE_ATTR}>` +
                        `<span class="action-trap" ${this.EDITABLE_ATTR}></span>` +
                        `<span class="${elementClasses}" ${this.dataParser.getAttrStr(dataAttr)}>` +
                        `<img ${src} ${sizes}>` +
                        `</span>` +
                        `<span class="action-after-trap" ${this.EDITABLE_ATTR}></span>` +
                        `</div>`;
                }

                getMentionTemplate(item) {
                    let className = this.MENTION_CLASS,
                        dataAttr = {
                        data: {
                            id: item.id
                        },
                        attributes: {
                            contenteditable: 'false'
                        }
                    };
                    return `<span class="${className} ${className}_${item.id}" ${this.dataParser.getAttrStr(dataAttr)}>${item.name}</span>`;
                }

                /**
                 *
                 * @param {Object} params
                 * @param {String} params.align
                 * @param {String} params.classes
                 * @param {String} params.title
                 * @param {String} params.href
                 * @returns {string}
                 */
                getButtonTemplate(params = {}) {
                    let {align = 'center', classes = 'untouched', title = this.BUTTON_DEFAULT_TEXT, href = ''} = params,
                        wrapperClasses = `mnh-m-btn-wrapper action-wrapper`,
                        buttomClasses = `mnh-m-btn mnh-m-btn-message action-element ${classes}`,
                        dataAttr = {
                            attributes: {
                                contenteditable: 'false',
                                tabindex: '2'
                            }
                        };
                    return `<div style="text-align: ${align};" class="${wrapperClasses}" ${this.NOT_EDITABLE_ATTR}>` +
                        `<span class="action-trap" ${this.EDITABLE_ATTR}></span>` +
                        `<a class="${buttomClasses}" href="${href}" ${this.dataParser.getAttrStr(dataAttr)}>${title}</a>` +
                        `<span class="action-after-trap" ${this.EDITABLE_ATTR}></span>` +
                        `</div>`;
                }

                /**
                 *
                 * @param {Object} params
                 * @param {String} params.provider
                 * @param {String} params.id
                 * @returns {string}
                 */
                getVideoTemplate(params = {}) {
                    let {provider, id} = params,
                        dataAttr = {
                            data: {id, provider},
                            attributes: {
                                contenteditable: 'false',
                                tabindex: '2'
                            }
                        };

                    return `<div class="mnh-m-video-wrapper action-wrapper" ${this.NOT_EDITABLE_ATTR}>` +
                        `<span class="action-trap" ${this.EDITABLE_ATTR}></span>` +
                        `<div class="mnh-m-video">` +
                        //element should contents any text node for normal work of text-angular
                        `<div class="action-element mnh-m-video-item video-thumb" ${this.dataParser.getAttrStr(dataAttr)}>video</div>` +
                        `</div>` +
                        `<span class="action-after-trap" ${this.EDITABLE_ATTR}></span>` +
                        `</div>`;
                }
            }

            return new ElementsHelper();
        });
};

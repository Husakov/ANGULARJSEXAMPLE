module.exports = function (module) {
    module
        .factory('messagesMessageRules', function (Profile, messagesMessageRulesDataHelper, mnhMessageUtils, emojis, $sce, $q) {
            'ngInject';
            const dataHelper = messagesMessageRulesDataHelper;

            const parser = new mnhMessageUtils.MessageParser();

            let currentUser = Profile.get();

            /**
             * @typedef {object} Change
             *
             * @property {String} prop
             * @property {any} value
             * @property {number} [versionIndex]
             * @property {Boolean} [isFromVersion]
             *
             */

            /**
             *
             * @param target
             * @param {Change} changes
             */
            function set(target, changes) {
                let prop = changes.prop;
                if (changes.isFromVersion) {
                    prop = `variations[${changes.versionIndex}].` + prop;
                }
                if (!angular.equals(_.get(target, prop), changes.value)) {
                    _.set(target, prop, changes.value);
                    return true;
                }
                return false;
            }

            function eachVersion(model, options, callback) {
                if (arguments.length > 2) {
                    model.variations.forEach((v, i) => callback(v, options.variations[i], i))
                } else {
                    callback = options;
                    model.variations.forEach(callback)
                }
            }

            /****** rules ******/

            function checkDefaultRule(prop, isFromVersion, value) {
                function check(target, prop) {
                    if (_.isEmpty(target[prop])) {
                        target[prop] = value;
                    }
                }

                return function checkDefaultAssign(model) {
                    if (isFromVersion) {
                        eachVersion(model, (v) => {
                            check(v, prop);
                        })
                    } else {
                        check(model, prop);
                    }
                }
            }

            function setTypeForOptions(model, options) {
                let isEmail = model.type === 'email';
                options.editor.isShowEmailEditor = isEmail;
                options.editor.isShowInAppEditor = !isEmail;
                options.editor.isShowStyleDropdown = !isEmail;
                options.hasSubject = isEmail;
            }

            function setMessageControlButtons(model, options) {
                options.showReportsButton = options.isManual && options.isLive || options.isAuto;
                options.showSendButton = options.isManual && !options.isLive;
                options.showEditButton = options.isManual && !options.isLive || options.isAuto;
                options.enabledEditButton = !options.isLive;
            }

            function checkLiveStatus(model, options) {
                let liveStates = ['live', 'scheduled', 'sent'],
                    isNotDraft = false,
                    isLive = false;
                eachVersion(model, options, (m, o) => {
                    o.isLive = liveStates.includes(m.state);
                    o.isDraft = m.state === 'draft';
                    isLive = isLive || o.isLive;
                    isNotDraft = isNotDraft || !o.isDraft;
                });
                options.isLive = isLive;
                options.isDraft = !isNotDraft;
            }

            function messageGoalOptions(model, options) {
                if (!options.goal) {
                    set(model, {
                        prop: 'message_goal',
                        value: {
                            predicates: []
                        }
                    });
                }
            }

            function targetTypeOptions(model, options) {
                options.enableTargetPage = options.isEmail ? false : options.enableTargetPage;
                if (!options.enableTargetPage) {
                    delete model.target_type;
                    delete model.target_match;
                }
            }

            function targetMatchOptions(model, options) {
                if (options.enableTargetPage && !model.target_type) {
                    model.target_type = options.targetTypes[1].type;
                }
            }

            function checkTargetPageOption(model, options) {
                if (options.isInApp && model.target_type === 'regex') {
                    try {
                        new RegExp(model.target_match);
                    } catch (e) {
                        return {message: 'Invalid regex in target match string', err: e};
                    }
                }
            }

            function manageUserRole(model, options) {
                options.isUser = model.user_role === 'user';
                options.isLead = model.user_role === 'lead';
                options.isVisitor = model.user_role === 'visitor';
            }

            function manageMessageTypes(model, options) {
                options.isEmail = model.type === 'email';
                options.isPush = model.type === 'push';
                options.isInApp = model.type === 'in-app';
            }

            function manageStyleTypes(model, options) {
                eachVersion(model, options, (v, o) => {
                    o.isBorderless = v.style === 'borderless';
                    o.isChat = v.style === 'chat';
                    o.isAnnouncement = v.style === 'small-announcement';
                    o.isPost = v.style === 'announcement';
                });
            }

            function manageAppearanceTypes(model, options) {
                eachVersion(model, options, (v, o) => {
                    o.isBadge = v.delivery_option === 'badge';
                    o.isSummary = v.delivery_option === 'summary';
                    o.isFull = v.delivery_option === 'full';
                });
            }

            function filterReplyTypes(model, options) {
                eachVersion(model, options, (v, o) => {
                    options.replyTypes = angular.copy(options.allReplyTypes)
                        .filter(type => {
                            let enabled;
                            switch (type.name) {
                                case 'reactions':
                                    enabled = !o.isChat && !o.isBorderless;
                                    break;
                                case 'email':
                                    enabled = options.isVisitor && !o.isAnnouncement && !o.isPost;
                                    break;
                                default:
                                    enabled = true;
                                    break;
                            }
                            return enabled;
                        });
                });

            }

            function manageReplyTypes(model, options) {
                eachVersion(model, options, (v, o) => {
                    o.replyIsText = v.reply_type === 'text' && options.replyTypes.filter(e => e.name === 'text').length > 0;
                    o.replyIsReactions = v.reply_type === 'reactions' && options.replyTypes.filter(e => e.name === 'reactions').length > 0;
                    o.replyIsEmail = v.reply_type === 'email' && options.replyTypes.filter(e => e.name === 'email').length > 0;
                });
            }

            function setDefaultReplyTypes(model, options) {
                eachVersion(model, (v) => {
                    v.reply_type = (v.reply_type && options.replyTypes.filter(e => e.name === v.reply_type).length > 0)
                        ? v.reply_type : options.replyTypes[0].name;
                });
            }

            function manageMessageType(model, options) {
                options.isAuto = model.message_type === 'auto';
                options.isManual = model.message_type === 'manual';

                options.isNew = !_.has(model, 'id');
            }

            function manageTabs(model, options) {
                options.optionTabs = angular.copy(options.allOptionTabs)
                    .filter(tab => {
                        let enabled;
                        switch (tab.alias) {
                            case 'stopdate':
                                enabled = options.isAuto;
                                break;
                            case 'target':
                                enabled = options.isInApp;
                                break;
                            case 'deliveryChanel':
                                enabled = false; // options.isInApp || options.isPush;
                                break;
                            case 'deliveryWindow':
                                enabled = options.isEmail || options.isPush;
                                break;
                            case 'unsubscribe':
                                enabled = options.isEmail;
                                break;
                            default:
                                enabled = true;
                                break;
                        }
                        return enabled;
                    });
            }

            function validateSelectionState(model) {
                if (!model.selection_state.included_ids || !model.selection_state.included_ids.length) {
                    if (!_.isEmpty(model.selection_state.predicates)) {
                        _.forEach(model.selection_state.predicates, predicate => {
                            if (predicate.is_company) {
                                predicate.attribute = 'company.' + predicate.attribute;
                            }
                            delete predicate.is_company;
                        });
                    }
                    delete model.selection_state.included_ids;
                } else {
                    delete model.selection_state.predicates;
                }
            }

            function showPredefinedUsersOption(model, options) {
                options.editor.predefinedUsers = model.selection_state.included_ids && model.selection_state.included_ids.length;
            }

            function unsubscribeLinkModel(model, options) {
                model.show_unsubscribe_link = model.type === 'email' ? options.show_unsubscribe_link_backup : false
            }

            function unsubscribeLinkOption(model, options) {
                options.show_unsubscribe_link_backup = model.show_unsubscribe_link;
            }

            function deliveryChannelOptions(model, options) {
                if (_.some(options.optionTabs, {alias: 'deliveryChanel'})) {
                    if (options.isInApp) {
                        options.deliveryChanelOptions = options.allDeliveryChannels
                            .filter(c => c.name !== 'email');
                    }
                    model.delivery_channel = options.deliveryChanelOptions[0].name;
                } else {
                    delete model.delivery_channel;
                }
            }

            function checkEmailTemplate(model, options) {
                if (options.isEmail) {
                    let templates = options.emailTemplates,
                        defaultId = _.find(templates, {id: 'plain'});
                    defaultId = defaultId ? defaultId.id : templates[0].id;
                    eachVersion(model, v => {
                        if (_.isEmpty(v.email_template_id)) {
                            v.email_template_id = defaultId;
                        }
                    });
                } else {
                    eachVersion(model, v => {
                        delete v.email_template_id;
                    });
                }
            }

            function deliveryWindowEnabled(model, options) {
                if (options.deliveryWindow.enabled) {
                    model.delivery_window = {};
                } else {
                    delete model.delivery_window;
                }
            }

            function deliveryWindowDays(model, options) {
                const deliveryWindow = options.deliveryWindow;
                if (deliveryWindow.enabled) {
                    model.delivery_window.days = Object.keys(deliveryWindow.days)
                        .filter(k => deliveryWindow.days[k]);
                }
            }

            function deliveryWindowTime(model, options) {
                const deliveryWindow = options.deliveryWindow;
                if (deliveryWindow.enabled) {
                    let maxMinutes = 24 * 60,
                        start = timeToMinutes(deliveryWindow.start_time),
                        end = timeToMinutes(deliveryWindow.end_time);
                    if (start >= maxMinutes) {
                        start = maxMinutes - 1;
                        deliveryWindow.start_time = minutesToTime(start);
                    }
                    if (start >= end) {
                        end = start + 1;
                        deliveryWindow.end_time = minutesToTime(end);
                    }

                    model.delivery_window.start_time = start;
                    model.delivery_window.end_time = end;
                }
            }

            function timeToMinutes(time) {
                return time.getHours() * 60 + time.getMinutes();
            }

            function minutesToTime(minutes) {
                let time = new Date(1970, 0, 1, 12, 0);
                time.setHours(Math.floor(minutes / 60));
                time.setMinutes(minutes - Math.floor(minutes / 60) * 60);
                return time;
            }

            function editorPreviewType(model, options) {
                options.editor.previewType.isDesktop = options.editor.previewType.currentType === 'desktop'
            }

            function managePreviewType(model, options) {
                if (options.isPush) {
                    options.previewTypes.find(type => type.name === 'desktop').disabled = true;
                    options.editor.previewType.isDesktop = false;
                    if (options.editor.previewType.currentType === 'desktop') {
                        options.editor.previewType.currentType = 'ios';
                    }
                } else {
                    options.previewTypes.find(type => type.name === 'desktop').disabled = false;
                    editorPreviewType(model, options);
                }
            }

            function setMessageBody(model, options) {
                eachVersion(model, options, (v, o) => {
                    o.messageBody = $sce.trustAsHtml(emojis.toImage(parser.toHtml(v.json_blocks), 24));
                });
            }

            function validateDeliveryWindowBeforeSave(model, options) {
                const deliveryWindow = options.deliveryWindow;
                if (deliveryWindow.enabled) {
                    if (model.delivery_window.days.length === 0) {
                        return {message: 'You should set correct data in Delivery Window options'};
                    }
                }
            }

            /****** ***** ******/

            const modelRules = {
                message_type: [manageMessageType],
                state: [checkLiveStatus],
                type: [
                    manageMessageTypes, manageUserRole, setTypeForOptions, manageTabs, managePreviewType,
                    unsubscribeLinkModel, deliveryChannelOptions, checkEmailTemplate, setMessageControlButtons
                ],
                version: {
                    from_id: [checkDefaultRule('from_id', true, currentUser.id)],
                    assign_to_id: [checkDefaultRule('assign_to_id', true, currentUser.id)],
                    style: [checkDefaultRule('style', true, 'chat'), manageStyleTypes, filterReplyTypes, setDefaultReplyTypes, manageReplyTypes],
                    delivery_option: [checkDefaultRule('delivery_option', true, 'full'), manageAppearanceTypes],
                    reply_type: [checkDefaultRule('reply_type', true, 'full'), filterReplyTypes, manageReplyTypes],
                    email_template_id: [checkEmailTemplate],
                    json_blocks: [setMessageBody],
                    state: [checkLiveStatus]
                },
                target_match: [targetMatchOptions],
                selection_state: [validateSelectionState, showPredefinedUsersOption],
                show_unsubscribe_link: [unsubscribeLinkOption]
            };

            const optionsRules = {
                editor: {
                    isShowEmailEditor: [setTypeForOptions],
                    previewType: {
                        currentType: [editorPreviewType]
                    }
                },
                goal: [messageGoalOptions],
                deliveryWindow: {
                    enabled: [deliveryWindowEnabled, deliveryWindowDays, deliveryWindowTime],
                    days: [deliveryWindowDays],
                    start_time: [deliveryWindowTime],
                    end_time: [deliveryWindowTime]
                },
                version: {}
            };

            const beforeSaveRules = [
                checkTargetPageOption, targetTypeOptions,
                validateDeliveryWindowBeforeSave
            ];
            const beforeSendRules = [];

            /****** ***** ******/

            function checkRule(rules, model, options) {
                if (angular.isArray(rules)) {
                    rules.forEach(rule => rule(model, options));
                } else if (angular.isObject(rules)) {
                    Object.keys(rules)
                        .forEach(key => checkRule(rules[key], model, options));
                }
            }

            return {
                /**
                 *
                 * @param {object} model
                 * @param {object} options
                 * @param {Change} change
                 */
                setModelValue(model, options, change) {
                    let target = change.isFromVersion ? modelRules.version : modelRules,
                        rules = _.get(target, change.prop, []);

                    if (set(model, change)) {
                        rules.forEach(rule => rule(model, options, change));
                    }
                },
                /**
                 *
                 * @param {object} model
                 * @param {object} options
                 * @param {Change} change
                 */
                setOptionsValue(model, options, change) {
                    let target = change.isFromVersion ? optionsRules.version : optionsRules,
                        rules = _.get(target, change.prop, []);

                    if (set(options, change)) {
                        rules.forEach(rule => rule(model, options, change));
                    }
                },
                getNewModel(data) {
                    return angular.merge({
                        state: 'draft',
                        type: 'email',
                        display_until: null,
                        selection_state: {
                            predicates: []
                        },
                        variations: [this.getNewVersion()],
                        message_goal: {
                            predicates: []
                        }
                    }, data);
                },
                getNewVersion(origin = {}) {
                    return angular.merge({
                        reply_type: 'text',
                        state: 'draft',
                        json_blocks: []
                    }, origin);
                },
                getNewOptionsVersion(origin = {}) {
                    return angular.merge({
                        messageBody: ''
                    }, origin);
                },
                getOptions(model) {
                    let previewTypes = dataHelper.get('previewTypes'),
                        appearances = dataHelper.get('appearances'),
                        platforms = dataHelper.get('platforms'),
                        daysOfWeek = dataHelper.get('daysOfWeek'),
                        messageTypes = dataHelper.get('types');

                    return {
                        styleTypes: dataHelper.get('styleTypes'),
                        allStyleTypes: dataHelper.get('styleTypes'),
                        replyTypes: dataHelper.get('replyTypes'),
                        allReplyTypes: dataHelper.get('replyTypes'),
                        allDeliveryChannels: dataHelper.get('channels'),
                        messageTypes: messageTypes.filter(t => t.name !== 'push').filter(t => !(model.user_role === 'visitor' && t.name === 'email')),
                        allMessageTypes: messageTypes,
                        allOptionTabs: dataHelper.get('optionTabs'),
                        platforms: platforms,
                        previewTypes: previewTypes,
                        allPreviewTypes: previewTypes,
                        emailTemplates: dataHelper.get('emailTemplates'),
                        appearances: appearances,
                        allAppearances: appearances,
                        hasVersions: model.message_type !== 'manual',
                        goal: false,
                        variations: model.variations.map(() => this.getNewOptionsVersion()),
                        editor: {
                            editorName: 'messageEditor',
                            previewType: {
                                currentType: 'desktop'
                            }
                        },
                        targetTypes: dataHelper.get('targetTypes'),
                        deliveryWindow: (() => {
                            let delivery_window = model.delivery_window,
                                defTime = 10 * 60,
                                start = delivery_window && delivery_window.start_time || defTime,
                                end = delivery_window && delivery_window.end_time || defTime + 60;
                            return {
                                enabled: false,
                                days: _.zipObject(daysOfWeek, daysOfWeek.map(k => delivery_window && delivery_window.days.includes(k))),
                                start_time: minutesToTime(start),
                                end_time: minutesToTime(end)
                            }
                        })()
                    };
                },
                runRules(model, options) {
                    return dataHelper.ready
                        .then(() => {
                            checkRule(modelRules, model, options);
                            checkRule(optionsRules, model, options);
                        });
                },
                beforeSave(model, options) {
                    for (let i = 0, len = beforeSaveRules.length, ruleRejection; i < len; i++) {
                        ruleRejection = beforeSaveRules[i](model, options);
                        if (ruleRejection) {
                            return $q.reject(ruleRejection);
                        }
                    }
                    return $q.resolve();
                },
                beforeSend(model, options) {
                    for (let i = 0, len = beforeSendRules.length, ruleRejection; i < len; i++) {
                        ruleRejection = beforeSendRules[i](model, options);
                        if (ruleRejection) {
                            return $q.reject(ruleRejection);
                        }
                    }
                    return $q.resolve();
                }
            };
        });
};

module.exports = function (module) {
    module
        .factory('Profile', function (AuthResource) {
            'ngInject';

            let resource = AuthResource('me', {}, {
                    updateProfile: {
                        url: 'admin/profile',
                        method: 'POST'
                    },
                    update: {
                        url: 'admin/:id',
                        method: 'PUT'
                    },
                    uploadAvatar: {
                        url: 'admin/upload_avatar',
                        method: 'POST',
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined}
                    },
                    changePassword: {
                        url: 'admin/change_password',
                        method: 'POST'
                    },
                    changeEmail: {
                        url: 'admin/change_email',
                        method: 'POST'
                    }
                }),
                user = resource.get();

            function sync() {
                return user.$get();
            }

            function update(model) {
                return resource.update({id: user.id}, _.assign({}, user, model))
                    .$promise
                    .then(() => {
                        return sync();
                    });
            }

            resource.save = update;

            return {
                get: function () {
                    return user;
                },
                sync: function () {
                    return sync();
                },
                update: function (model) {
                    return update(model);
                },
                uploadAvatar: function (file) {
                    let fd = new FormData();
                    fd.append('image', file);
                    resource.uploadAvatar({}, fd);
                },
                updatePassword: function (model) {
                    return resource.changePassword(model);
                },
                changeEmail: function (model) {
                    return resource.changeEmail(model);
                },
                setAwayStatus: function (is_away) {
                    return update({is_away});
                }
            };
        })
        .factory('ProfileVisibilities', function (Profile, Admin, Segment, Tags, $q) {
            'ngInject';

            function getVisibilities(visibleArr = [], records) {
                if (records.length > 0) {
                    records
                        .forEach(r => {
                            if (r.enabled) {
                                visibleArr.push(r.id);
                            } else {
                                _.pull(visibleArr, r.id);
                            }
                        });

                    visibleArr = _.uniq(visibleArr);
                }
                return visibleArr;
            }

            return {
                get: function (type, params) {
                    let visibleProp = 'visible_segment_ids',
                        result = [],
                        list;
                    switch (type) {
                        case 'contacts':
                            list = Segment.query(_.assign({is_company: false}, params));
                            break;
                        case 'companies':
                            list = Segment.query(_.assign({is_company: true}, params));
                            break;
                        case 'tags':
                            list = Tags.query(params);
                            visibleProp = 'visible_tag_ids';
                            break;
                        default:
                            break;
                    }

                    result.$promise = $q.all([Profile.get().$promise, list.$promise, Admin.allAdmins().$promise])
                        .then((promises) => {
                            let [user, records, admins] = promises,
                                visible = user[visibleProp];
                            _.each(records, (rec) => {
                                rec.enabled = _.includes(visible, rec.id);
                                rec.creator = _.findWhere(admins, {id: rec.created_by_id});
                            });

                            result.push.apply(result, records);

                            if (records.total_count) {
                                result.total_count = records.total_count;
                            }

                            return result;
                        });

                    return result;
                },
                save: function (type, records) {
                    return Profile.get().$promise
                        .then((user) => {
                            let result,
                                ids;

                            switch (type) {
                                case 'segments':
                                    ids = getVisibilities(user.visible_segment_ids, records);
                                    result = Admin.updateVisibleSegments({segment_ids: ids});
                                    break;
                                case 'tags':
                                    ids = getVisibilities(user.visible_tag_ids, records);
                                    result = Admin.updateVisibleTags({tag_ids: ids});
                                    break;
                                default:
                                    break;
                            }
                            return result.$promise;
                        })
                        .then(() => {
                            return Profile.sync();
                        });
                }
            };
        })
        .factory('ProfileNotifications', function (AuthResource) {
            'ngInject';

            return AuthResource('admin/notification_settings');
        })
        .factory('ProfileConversation', function (AuthResource, Profile) {
            'ngInject';
            let me = Profile.get();

            class ProfileConversation {
                constructor() {
                    this.$promise = me.$promise
                        .then(() => {
                            this.sync();
                            return this;
                        });
                }

                get() {
                    return this;
                }

                $save() {
                    return Profile.update({
                        assign_conversations_on_reply: this.assign_conversations_on_reply
                    })
                        .then(() => {
                            this.sync();
                            return this.$promise;
                        });
                }

                sync() {
                    this.assign_conversations_on_reply = me.assign_conversations_on_reply;
                }
            }

            return new ProfileConversation();
        });
};

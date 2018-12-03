module.exports = function (module) {
    module
        .factory('MessagesReportsHelper', function (Dispatch) {
            'ngInject';

            const sections = [
                {
                    id: 'sent',
                    key: 'sent_count',
                    title: 'Sent',
                    inverted: false,
                    invertedId: 'not_opened'
                },
                {
                    id: 'opened',
                    key: 'open_count',
                    title: 'Opened',
                    inverted: false,
                    invertedId: 'not_opened'
                },
                {
                    id: 'clicked',
                    key: 'click_count',
                    title: 'Clicked',
                    inverted: false,
                    invertedId: 'not_clicked'
                },
                {
                    id: 'replied',
                    key: 'reply_count',
                    title: 'Replied',
                    inverted: false,
                    invertedId: 'not_replied'
                },
                {
                    id: 'unsubscribed',
                    key: 'unsubscribe_count',
                    title: 'Unsubscribed',
                    inverted: false,
                    invertedId: 'not_opened'
                },
                {
                    id: 'bounced',
                    key: 'bounce_count',
                    title: 'Bounced',
                    inverted: false,
                    invertedId: 'not_opened'
                },
                {
                    id: 'hit_goal',
                    key: 'goal_count',
                    title: 'Hit Goal',
                    inverted: false,
                    invertedId: 'not_hit_goal'
                },
                {
                    id: 'not_opened',
                    key: 'not_opened_count',
                    title: 'Did not open',
                    inverted: true,
                    invertedId: 'opened'
                },
                {
                    id: 'not_clicked',
                    key: 'not_clicked_count',
                    title: 'Did not click',
                    inverted: true,
                    invertedId: 'clicked'
                },
                {
                    id: 'not_replied',
                    key: 'not_replied_count',
                    title: 'Did not reply',
                    inverted: true,
                    invertedId: 'replied'
                },
                {
                    id: 'not_hit_goal',
                    key: 'not_hit_goal_count',
                    title: 'Did not hit goal',
                    inverted: true,
                    invertedId: 'hit_goal'
                }
            ];

            class ReportsHelper {
                constructor(model) {
                    this.model = model;
                    this.sections = sections.map(
                        s => {
                            s = angular.copy(s);
                            s.stats = model.get('variations')
                                .map(v => v.stats && v.stats[s.key]);
                            return s;
                        }
                    );
                }

                getStatCount(id) {
                    let index = this.model.currentVersionIndex,
                        section = _.find(this.sections, {id});
                    return _.get(section, `stats[${index}]`, 0);
                }

                getUsers(sectionId, {limit, skip}) {
                    return Dispatch.stats({
                        id: this.model.get('id'),
                        action: sectionId,
                        variant: this.model.currentVersionIndex,
                        limit,
                        skip
                    });
                }
            }

            return ReportsHelper;
        });
};

/*
    "sent_count": 0,
    "open_count": 0,
    "open_count_total": 0,
    "reply_count": 0,
    "response_count": 0,
    "click_count": 0,
    "click_count_total": 0,
    "unsubscribe_count": 0,
    "bounce_count": 0,
    "goal_count": 0,
    "spam_count": 0,
*/

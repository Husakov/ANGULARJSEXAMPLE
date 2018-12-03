module.exports = function (mod) {

    mod.factory('contactDetailsSections', function (attributesHelper, $q) {
        'ngInject';

        let allSections = [
            {
                name: 'user-details',
                icon: 'laptop',
                title: 'Details',
                items: [
                    {
                        name: 'email',
                        title: 'Email',
                        description: 'The email address assigned to a user or lead',
                        icon: 'at',
                        editable: true,
                        placeholder: 'Add Email'
                    },
                    {
                        name: 'phone',
                        title: 'Phone',
                        description: 'A person\'s phone number',
                        icon: 'at',
                        editable: true,
                        placeholder: 'Add Phone'
                    },
                    {
                        name: 'user_id',
                        title: 'User Id',
                        description: 'A number identifying a person (applies to both users and leads)',
                        icon: 'hashtag'
                    },
                    {
                        name: 'last_request_at',
                        title: 'Last Seen',
                        description: 'The last day a person visited your site or app.',
                        icon: 'calendar-check-o',
                        type: 'date'
                    },
                    {
                        name: 'remote_created_at',
                        title: 'First Seen',
                        description: 'The first day a person visited your site or app.',
                        icon: 'calendar-check-o',
                        type: 'date'
                    },
                    {
                        name: 'created_at',
                        title: 'Signed Up',
                        description: 'The day a person first signed up for your product.',
                        icon: 'calendar-check-o',
                        type: 'date'
                    },
                    {
                        name: 'last_contacted_at',
                        title: 'Last Contacted',
                        description: 'The last day you or a teammate contacted a person.',
                        icon: 'calendar-check-o',
                        type: 'date'
                    },
                    {
                        name: 'last_heard_from_at',
                        title: 'Last Heard from',
                        description: 'The last day a person contacted you via a message or email.',
                        icon: 'calendar-check-o',
                        type: 'date'
                    },
                    {
                        name: 'session_count',
                        title: 'Web sessions',
                        description: 'The number of times a user has visited your site or app.',
                        icon: 'line-chart',
                        type: 'integer'
                    },
                    {
                        name: 'browser_locale',
                        title: 'Browser Language',
                        description: 'The language set by the browser a person is using.',
                        icon: 'globe'
                    },
                    {
                        name: 'language_override',
                        title: 'Language Override',
                        description: 'A preferred language setting for a person, used by the Intercom Messenger even if their browser settings change.',
                        icon: 'globe'
                    },
                    {
                        name: 'user_agent_data.name',
                        title: 'Browser',
                        description: 'The browser a person is using.',
                        icon: 'laptop'
                    },
                    {
                        name: 'user_agent_data.version',
                        title: 'Browser Version',
                        description: 'The precise version of the browser a person is using.',
                        icon: 'laptop'
                    },
                    {
                        name: 'user_agent_data.os',
                        title: 'OS',
                        description: 'The operating system a person is using.',
                        icon: 'laptop'
                    },
                    {
                        name: 'unsubscribed_from_emails',
                        title: 'Unsubscribed from emails',
                        description: 'Is the user unsubscribed from all emails?',
                        icon: 'envelope-o',
                        type: 'boolean'
                    },
                    {
                        name: 'marked_email_as_spam',
                        title: 'Marked Email as Spam',
                        description: 'Has a person marked an email from your team as spam?',
                        icon: 'envelope-o',
                        type: 'boolean'
                    },
                    {
                        name: 'has_hard_bounce',
                        title: 'Has an email sent from your team to a person bounced?',
                        description: 'Has Hard Bounce',
                        icon: 'envelope-o',
                        type: 'boolean'
                    }
                ]
            },
            {
                name: 'company-details',
                icon: 'laptop',
                title: 'Account info',
                items: [
                    {
                        name: 'remote_company_id',
                        title: 'Company ID',
                        description: 'A number identifying a company (applies to both users and leads)',
                        icon: 'exchange'
                    },
                    {
                        name: 'last_request_at',
                        title: 'Company last seen',
                        description: 'The last day a company visited your site or app.',
                        icon: 'calendar',
                        type: 'date'
                    },
                    {
                        name: 'remote_created_at',
                        title: 'Company created at',
                        description: 'The day a company was added to Riika.',
                        icon: 'calendar',
                        type: 'date'
                    },
                    {
                        name: 'user_count',
                        title: 'Users',
                        description: 'The number of people in a company who are signed up and logged in to your product.',
                        icon: 'users',
                        type: 'integer'
                    },
                    {
                        name: 'session_count',
                        title: 'Web Sessions',
                        description: 'All visits from anyone in a company to your product\'s site or app.',
                        icon: 'line-chart',
                        type: 'integer'
                    },
                    {
                        name: 'plan_id',
                        title: 'Plan',
                        description: '',
                        icon: 'briefcase'
                    },
                    {
                        name: 'monthly_spend',
                        title: 'Monthly Spend',
                        description: 'The monthly revenue you receive from a company.',
                        icon: 'credit-card'
                    }
                ]
            },
            {
                name: 'custom',
                icon: 'exchange',
                title: 'Custom',
                items: []
            },
            {
                name: 'mobile',
                icon: 'mobile',
                title: 'Mobile',
                items: []
            },
            {
                name: 'last-viewed',
                icon: 'info-circle',
                title: 'Last Viewed',
                items: [
                    {
                        name: 'last_visited_url',
                        title: 'Last viewed url',
                        description: 'The last url a person was viewed on your site or app.',
                        icon: 'globe'
                    }
                ]
            },
            {
                name: 'segments',
                icon: 'pie-chart',
                title: 'Segments',
                type: 'list',
                property: 'visibleSegments',
                visibilityProperty: 'visible_segment_ids'
            },
            {
                name: 'tags',
                icon: 'tag',
                title: 'Tags',
                type: 'list',
                property: 'visibleTags',
                visibilityProperty: 'visible_tag_ids',
                addLabel: 'Add tag'
            },
            {
                name: 'events',
                icon: 'calendar-check-o',
                title: 'Events',
                type: 'accordion',
                items: [
                    {
                        name: 'count',
                        title: 'Count',
                        description: '',
                        icon: 'line-chart'
                    },
                    {
                        name: 'createdAt',
                        title: 'First time',
                        description: '',
                        icon: 'calendar-check-o',
                        type: 'date'
                    },
                    {
                        name: 'mostRecentAt',
                        title: 'Most Recen',
                        description: '',
                        icon: 'calendar-check-o',
                        type: 'date'
                    }
                ]
            },
            {
                name: 'companies',
                icon: 'building',
                title: 'Companies',
                type: 'accordion',
                items: [
                    {
                        name: 'id',
                        title: 'Company ID',
                        description: 'A number identifying a company (applies to both users and leads)',
                        icon: 'hashtag'
                    },
                    {
                        name: 'lastSeenAt',
                        title: 'Company last seen',
                        description: 'The last day a company visited your site or app.',
                        icon: 'calendar-check-o',
                        type: 'date'
                    },
                    {
                        name: 'createdAt',
                        title: 'Company created at',
                        description: 'The day a company was added to Riika.',
                        icon: 'calendar-check-o',
                        type: 'date'
                    }
                ]
            },
            {
                name: 'admin-profile',
                icon: 'user',
                title: 'Profile',
                items: [
                    {
                        name: 'name',
                        title: 'User name',
                        description: '',
                        icon: 'user'
                    },
                    {
                        name: 'email',
                        title: 'Email',
                        description: 'The email address assigned to a user or lead',
                        icon: 'at'
                    },
                    {
                        name: 'last_active_at',
                        title: 'Last Active',
                        description: 'The last day a person was active on your site or app.',
                        icon: 'calendar-check-o'
                    },
                    {
                        name: 'job_title',
                        title: 'Job title',
                        description: '',
                        icon: 'briefcase'
                    },
                    {
                        name: 'biography',
                        title: 'Introduction',
                        description: '',
                        icon: 'quote-left'
                    },
                    {
                        name: 'twitter',
                        title: 'Twitter',
                        description: '',
                        icon: 'twitter'
                    },
                    {
                        name: 'linkedin',
                        title: 'LinkedIn',
                        description: '',
                        icon: 'linkedin'
                    }
                ]
            },
            {
                name: 'admin-teams',
                icon: 'calendar-check-o',
                title: 'Teams',
                type: 'teams',
                property: 'teams'
            }
        ];

        let sections = {
            users: getSections(['user-details', 'custom', 'mobile', 'last-viewed', 'segments', 'tags', 'events', 'companies']),
            companies: getSections(['company-details', 'segments', 'tags', 'events']),
            admins: getSections(['admin-profile', 'admin-teams'])
        };

        return {
            getSectionsByMode
        };

        function getSectionsByMode(mode = 'users') {
            let modeSections = angular.copy(sections[mode]),
                customSection = _.find(modeSections, (section) => section.name === 'custom'),
                mobileSection = _.find(modeSections, (section) => section.name === 'mobile');

            if (customSection || mobileSection) {
                return attributesHelper.getAttributesByCategories(mode)
                    .then(categories => {
                        if (categories.customAttributes && customSection) {
                            customSection.items = categories.customAttributes.attributes;
                        }
                        if (categories.mobileAttributes && mobileSection) {
                            mobileSection.items = categories.mobileAttributes.attributes;
                        }
                        return modeSections;
                    });
            } else {
                return $q.resolve(modeSections);
            }
        }

        function getSections(names) {
            return allSections.filter(s => names.includes(s.name));
        }
    });
};

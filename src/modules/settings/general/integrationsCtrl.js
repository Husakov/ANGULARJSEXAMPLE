require('./integrations.scss');

module.exports = class Controller {
    constructor() {
        'ngInclude';

        this.items = [
            {
                key: 'facebook',
                title: 'Facebook',
                logoClass: 'facebook-logo',
                subtitle: 'Answer Facebook messages from your Team Inbox',
                description: 'Pull Facebook messages into Intercom and show users’ Facebook conversations in the Intercom Messenger. Works with our Support or Acquire products.'
            },
            {
                key: 'twitter',
                title: 'Twitter',
                logoClass: 'twitter-logo',
                subtitle: 'Answer Twitter messages from your Team Inbox',
                description: 'See and reply to Twitter Direct Messages from your Intercom Inbox. Works with our Support or Acquire products.'
            },
            {
                key: 'mailchimpImport',
                title: 'Mailchimp Import',
                logoClass: 'mailchimp-logo',
                subtitle: 'Import your Mailchimp users to Intercom',
                description: 'Import your Mailchimp users to Intercom to build profiles and start personal conversations.'
            },
            {
                key: 'mailchimpSync',
                title: 'Mailchimp Sync',
                logoClass: 'mailchimp-logo',
                subtitle: 'Connect to Mailchimp to keep your mailing lists in sync',
                description: 'Keep your mailing lists in sync between Mailchimp and Intercom.'
            },
            {
                key: 'stripe',
                title: 'Stripe',
                logoClass: 'stripe-logo',
                subtitle: 'Import your Stripe users and attributes',
                description: 'Import your Stripe users and instantly create attributes from their Stripe data (like their price plan, monthly balance and more).'
            },
            {
                key: 'sparkpost',
                title: 'Sparkpost',
                logoClass: 'sparkpost-logo',
                subtitle: 'Here should be some subtitle',
                description: 'Here should be some description'
            }
        ];

        this.activeItem = this.items[0];

    }

    integrate(item, e) {
        e.stopPropagation();
    }

    toggle(key) {
        this.activeItem = this.activeItem !== key ? key : '';
    }
};

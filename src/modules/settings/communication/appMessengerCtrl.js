module.exports = class Controller {
    constructor(notifier, MessangerSettings, currentUser, $state) {
        'ngInject';
        this.tabs = [
            {
                state: 'settings.app-messenger.team-intro',
                title: 'Team Intro'
            },
            {
                state: 'settings.app-messenger.office-hours',
                title: 'Office Hours & Response Time'
            },
            {
                state: 'settings.app-messenger.other-settings',
                title: 'Other Settings'
            }
        ];

        this.currentUser = currentUser;

        this.notifier = notifier;
        this.$state = $state;
        this.resource = MessangerSettings;

        this.responseTime = [
            {name: 'Show automatic response time', value: -1},
            {name: 'Typically replies in a few minutes', value: 0},
            {name: 'Typically replies in a few hours', value: 1},
            {name: 'Typically replies in a day', value: 2}
        ];
        this.days = [
            'everyday',
            'weekdays',
            'weekends',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday'
        ];

        this.model = MessangerSettings.get();
        this.model.$promise
            .then(() => {
                this.getFromModel();
            });
    }

    whiteListGS() {
        return (val) => {
            if (angular.isDefined(val)) {
                this.parsed_allowed_domains = _.compact(_.map(val.split(';'), _.trim));
            }
            return _.get(this, 'parsed_allowed_domains', []).join(';');
        };
    }

    showResponseGS() {
        return (val) => {
            if (angular.isDefined(val)) {
                this.custom_response_delay_enabled = val !== -1;
                this.custom_response_delay = val;
            }
            return this.custom_response_delay;
        };
    }

    addOtherLanguage() {
        this.otherLangs.push({
            'locale_id': '',
            'name': '',
            'user_welcome_message': '',
            'visitor_welcome_message': 'Have a question? Chat with us',
            'is_permitted': true
        });
    }

    enableSaveBtn() {
        this.appMessengerSettingsForm.$dirty = true;
    }

    addOfficeHour() {
        this.office_hours.push({
            period: 'everyday',
            start_time: 540,
            end_time: 1440
        });
        this.enableSaveBtn();
    }

    removeOfficeHour(i) {
        this.office_hours.splice(i,1);
        this.enableSaveBtn();
    }

    //for office hours
    generateDayPeriods() {
       let offset = 30,
           end_time = 1470;
       return Array.from(new Array(end_time / offset)).map((_, index)=> index*offset);
    }

    removeOtherLanguage(index) {
        this.otherLangs.splice(index, 1);
        this.appMessengerSettingsForm.$setDirty();
    }

    showLang(code) {
        if (code === undefined || code === '') {
            return '- Select language -';
        }
        let lang = _.filter(this.available_locales, (e) => e.locale_id === code);
        return lang[0].name;
    }

    checkCharacters() {
        return this.defLangObject.user_welcome_message.length > 160 ||
            this.otherLangs.find((item) => item.user_welcome_message.length > 160 || item.locale_id === '');
    }

    makeDefault(index, code) {
        this.defLangObject = this.otherLangs.splice(index, 1)[0];
        this.defaultsCode = code;
    }

    checkDefaultLang(oldLang, lang) {
        let otherLang = this.otherLangs.map((item) => item.locale_id);
        if (otherLang.indexOf(lang) !== -1) {
            this.defaultsCode = oldLang;
        } else {
            this.defLangObject.locale_id = this.defaultsCode;
            this.defLangObject.name = this.showLang(this.defaultsCode);
        }
    }

    checkOtherLang(current, lang, index) {
        let defaultLang = this.defaultsCode;
        let otherLang = this.otherLangs.map((item) => item.locale_id);
        otherLang.splice(index, 1);
        if (lang === defaultLang || (otherLang.indexOf(lang) !== -1)) {
            this.otherLangs[index].locale_id = current;
        } else {
            this.otherLangs[index].name = this.showLang(this.otherLangs[index].locale_id);
        }
    }

    setToModel() {
        let data = this.model;
        data.widget_audio_enabled = this.widget_audio_enabled;
        data.parsed_allowed_domains = this.parsed_allowed_domains;
        data.custom_response_delay_enabled = this.custom_response_delay_enabled;
        data.custom_response_delay = this.custom_response_delay;
        data.office_hours = this.office_hours;

        this.defLangObject.is_permitted = true;
        data.supported_locales = angular.copy(this.otherLangs);
        data.supported_locales.unshift(this.defLangObject);
        data.default_locale = this.defaultsCode; // readonly
    }

    getFromModel() {
        let data = this.model;
        this.widget_audio_enabled = data.widget_audio_enabled;
        this.parsed_allowed_domains = data.parsed_allowed_domains;
        this.custom_response_delay = data.custom_response_delay_enabled ? data.custom_response_delay : -1;
        this.available_locales = data.available_locales;
        this.office_hours = data.office_hours;

        this.defLangObject = angular.copy(data.supported_locales[0]);
        this.defaultsCode = data.default_locale;
        this.defLang = this.defaultsCode;
        this.otherLangs = angular.copy(data.supported_locales);
        this.otherLangs.shift();
    }

    updateModel() {
        this.setToModel();
        this.model.$save()
            .then(() => {
                this.getFromModel();
                this.notifier.info('Your settings have been saved.');
            })
    }
};

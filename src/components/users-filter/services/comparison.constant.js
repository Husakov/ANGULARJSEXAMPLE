module.exports = function (mod) {
    const trails = {
        ago: 'Days Ago'
    };

    mod
        .constant('COMPARISONS', {
            string: [
                {name: 'eq', title: 'is', input: 'text'},
                {name: 'ne', title: 'is not', input: 'text'},
                {name: 'starts_with', title: 'starts with', input: 'text'},
                {name: 'ends_with', title: 'ends with', input: 'text'},
                {name: 'contains', title: 'contains', input: 'text'},
                {name: 'not_contains', title: 'does not contain', input: 'text'},
                {name: 'unknown', title: 'is unknown'},
                {name: 'known', title: 'has any value'}
            ],
            boolean: [
                {name: 'eq', title: 'is true', value: true},
                {name: 'eq', title: 'is false', value: false},
                {name: 'unknown', title: 'is unknown'},
                {name: 'known', title: 'has any value'}
            ],
            date: [
                {group: 'relative', name: 'eq', title: 'exactly', input: 'number', trail: trails.ago},
                {group: 'relative', name: 'lt', title: 'more than', input: 'number', trail: trails.ago},
                {group: 'relative', name: 'gt', title: 'less than', input: 'number', trail: trails.ago},
                {group: 'absolute', name: 'eq', title: 'on', input: 'date'},
                {group: 'absolute', name: 'lt', title: 'before', input: 'date'},
                {group: 'absolute', name: 'gt', title: 'after', input: 'date'},
                {group: 'absolute', name: 'unknown', title: 'is unknown'},
                {group: 'absolute', name: 'known', title: 'has any value'}
            ],
            number: [
                {name: 'eq', title: 'is', input: 'number'},
                {name: 'ne', title: 'is not', input: 'number'},
                {name: 'gt', title: 'greater than', input: 'number'},
                {name: 'lt', title: 'less than', input: 'number'},
                {name: 'unknown', title: 'is unknown'},
                {name: 'known', title: 'has any value'}
            ],
            dropdown: [
                {name: 'eq', title: 'is', input: true},
                {name: 'ne', title: 'is not', input: true}
            ],
            mode: [
                {name: 'visitor', title: 'visitor'},
                {name: 'lead', title: 'lead'},
                {name: 'user', title: 'user'}
            ]
        });
};

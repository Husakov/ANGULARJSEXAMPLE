const mod = module.exports = {};

mod.recipientsTypes = [
    {
        value: 'users',
        viewValue: 'users',
        description: 'Users with an existing account'
    },
    {
        value: 'visitors',
        viewValue: 'leads',
        description: 'Leads who may create an account later'
    }
];

mod.fileHelp = `Your .csv file should at least contain each person’s email address.<br><br>\
                            Other import attributes include user id, full names, and joining dates.`;

mod.tagsHelp = `Tags let you group a set of people together.<br><br>\
                    Each import is automatically tagged and you can also add additional tags here.`;

mod.dataTypes = [
    {
        title: 'Text',
        name: 'string',
        key: 'String'
    },
    {
        title: 'Date',
        name: 'date',
        key: 'Date'
    },
    {
        title: 'Number',
        name: 'integer',
        key: 'Number'
    },
    {
        title: 'Boolean',
        name: 'boolean',
        key: 'Boolean'
    }
];

mod.assignSteps = {
    users: [
        {
            title: 'Email address',
            question: 'Which column contains your user\'s email address?',
            description: 'An email address is required for each user stored',
            name: 'email',
            dataType: mod.dataTypes[0],
            isRequired: true
        },
        {
            title: 'User ID',
            question: 'Which column contains user IDs?',
            description: 'Importing user IDs lets you easily find specific users.',
            name: 'id',
            dataType: mod.dataTypes[0]
        },
        {
            title: 'Full names',
            question: 'Which column contains your users\' full names?',
            description: 'Importing full names lets you create more personal messages.',
            name: 'name',
            dataType: mod.dataTypes[0]
        },
        {
            title: 'Signup date',
            question: 'Which column contains the date the user signed up on?',
            description: 'Importing signed up dates lets you easily target segments of users.',
            name: 'signup_date',
            dataType: mod.dataTypes[1]
        },
        {
            title: 'Phone number',
            question: 'Which column contains your users\' phone numbers?',
            description: 'Importing phone numbers lets you easily target segments of users.',
            name: 'phone',
            dataType: mod.dataTypes[0]
        },
        {
            question: 'Which additional columns would you like to import?',
            description: 'Additional columns will be imported as custom attributes',
            isCustom: true
        }
    ],
    visitors: [
        {
            title: 'Email address',
            question: 'Which column contains your user\'s email address?',
            description: 'An email address is required for each user stored',
            name: 'email',
            dataType: mod.dataTypes[0],
            isRequired: true
        },
        {
            title: 'Full names',
            question: 'Which column contains your users’ full names?',
            description: 'Importing full names lets you create more personal messages.',
            name: 'name',
            dataType: mod.dataTypes[0]
        },
        {
            question: 'Which additional columns would you like to import?',
            description: 'Additional columns will be imported as custom attributes',
            isCustom: true
        }
    ]
};

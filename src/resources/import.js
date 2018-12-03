module.exports = module => {
    module.factory('Import', (AuthResource) => {
        'ngInject';

        const CSV = AuthResource('csv_import/:id', {id: '@id'}, {
            upload: {
                method: 'POST',
                transformRequest: function (file) {
                    let fd = new FormData();
                    fd.append('file', file);
                    return fd;
                },
                headers: {'Content-Type': undefined}
            },
            assignColumns: {
                url: 'csv_import/:id/column_assignments',
                method: 'PUT'
            },
            setTags: {
                url: 'csv_import/:id/tags',
                method: 'PUT'
            },
            launch: {
                url: 'csv_import/:id/launch',
                method: 'POST'
            }
        });

        return {
            CSV
        };
    })
};

module.exports = module => {
    module.factory('Export', AuthResource => {
        'ngInject';

        return AuthResource('csv_export', {}, {
            csvExport: {
                method: 'POST'
            },
            csvExportCheck: {
                method: 'GET',
                url: 'csv_export/:id',
                cancellable: true,
                params: {
                   id: '@id'
                }
            }
        });
    });
};

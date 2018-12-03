module.exports = function (module) {
    const ImportType = require('./ImportType');

    module
        .config(function (importImportTypesHelperProvider) {
            'ngInject';

            class CsvImport extends ImportType {
                constructor() {
                    super({
                        name: 'csv',
                        icon: 'fa fa-cloud-upload',
                        title: 'CSV',
                        description: 'Import a CSV file of your users or leads into MNH.',
                        steps: [
                            'importCsvRecipientsStep',
                            'importCsvCsvMapStep',
                            'importCsvTagsStep'
                        ]
                    });
                }
            }

            importImportTypesHelperProvider.register('csv', new CsvImport())
        });
};

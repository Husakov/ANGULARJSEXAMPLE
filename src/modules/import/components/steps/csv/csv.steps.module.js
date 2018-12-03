module.exports = function (module) {
    require('./RecipientsStep/RecipientsStep')(module);
    require('./CsvMapStep/csvMapStep.module')(module);
    require('./TagsStep/TagsStep')(module);
};

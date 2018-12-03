module.exports = function (module) {
    require('./CsvMapStep')(module);
    require('./column')(module);
    require('./manager')(module);
    require('./helper')(module);
};

module.exports = function (module) {
    require('./StepWalker')(module);
    require('./steps-manager')(module);
};

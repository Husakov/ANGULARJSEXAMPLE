module.exports = function (module) {
    module
        .provider('importImportTypesHelper', function () {
            'ngInject';

            class StepsHelperProvider {
                constructor() {
                    this.types = {};
                    this.registeredTypes = [];
                }

                register(type, importType) {
                    this.types[type] = importType;
                    this.registeredTypes.push(type);
                }

                $get() {
                    return new StepsHelper(this);
                }
            }

            class StepsHelper {
                constructor(provider) {
                    this.provider = provider;
                    this.types = provider.types;
                }

                getType(type) {
                    if (this.types[type]) {
                        return this.types[type];
                    } else {
                        return null;
                    }
                }
            }

            return new StepsHelperProvider();
        });
};

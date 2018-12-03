module.exports = class ImportType {
    constructor({name, icon, title, description, steps}) {
        angular.merge(this, {
            name,
            icon,
            title,
            description,
            steps
        });
    }
};

'use strict';

module.exports = class AssignSearch {
    constructor(teams, admins) {

        this.adminsList = admins;
        this.teamsList = teams;
        this.searchString = '';
        
        this.input('')
    }
    
    input(text) {
        if (arguments.length) {
            let filter = el => el.name && el.name.toLowerCase().includes(text.toLowerCase());
            this.searchString = text;
            this.admins = this.adminsList.filter(filter);
            this.teams = this.teamsList.filter(filter);
        }
        return this.searchString;
    }
}

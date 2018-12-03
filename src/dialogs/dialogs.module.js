'use strict';

const confirmDialog = require('./confirm/confirm');
const profileNotesDialog = require('./profileNotes/profileNotes');
const exportListDialog = require('./exportList/exportList');
const editInvite = require('./editInvite/editInvite');
const editTeam = require('./editTeam/editTeam');
const dropAdmin = require('./dropAdmin/dropAdmin');
const createSegment = require('./createSegment/createSegment');
const editAttribute = require('./editAttribute/editAttribute');
const imageViewer = require('./imageViewer/imageViewer');
const deleteTeam = require('./deleteTeam/deleteTeam');
const CSVExport = require('./CSVExport/CSVExport');

module.exports = angular.module('intercom.dialogs', [])
    .provider('dialogs', require('./dialogs'))
    .config(function (dialogsProvider) {
        dialogsProvider
            .register(confirmDialog)
            .register(profileNotesDialog)
            .register(exportListDialog)
            .register(editInvite)
            .register(editTeam)
            .register(dropAdmin)
            .register(createSegment)
            .register(editAttribute)
            .register(imageViewer)
            .register(createSegment)
            .register(deleteTeam)
            .register(CSVExport);
    });

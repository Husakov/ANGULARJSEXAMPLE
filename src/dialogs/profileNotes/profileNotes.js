require('./profile-notes.scss');

let templateUrl = require('./index.html');

class Controller {
    constructor(modelId, Notes) {
        'ngInject';
        this.modelId = modelId;
        this.Notes = Notes;

        this.updateNotes();
    }

    addNote(text) {
        if (!text) {
            return;
        }

        let note = {
            body: text,
            model_id: this.modelId,
            is_company: false
        };

        this.Notes.save(note).$promise
            .then(() => {
                this.noteText = '';
                this.isNote = false;
                this.updateNotes();
            });
    }

    editNote(note, text) {
        note.text = text;
        note.edited = true;
        note.editTime = _.now();
    }


    updateNotes() {
        this.notes = this.Notes.preparedQuery({model_id: this.modelId});
    }
}

module.exports = {
    name: 'profileNotes',
    open: function ($uibModal, modelId) {
        let modalInstance = $uibModal.open({
            templateUrl: templateUrl,
            controller: Controller,
            controllerAs: 'ctrl',
            resolve: {
                modelId: () => modelId
            }
        });

        return modalInstance.result;
    }
};

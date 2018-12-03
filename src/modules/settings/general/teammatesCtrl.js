require('./teammates.scss');

module.exports = class Controller {
    constructor(dialogs, notifier, $timeout, Invites, Admin, Profile, Team) {
        'ngInject';

        this.dialogs = dialogs;
        this.notifier = notifier;
        this.$timeout = $timeout;
        this.Invites = Invites;
        this.Team = Team;
        this.Admin = Admin;

        this.currentUser = Profile.get();
        this.invitesList = Invites.query();

        this.clearAndLoadData();

        this.selectedAdmin = {};
        this.selectedTeam = null;

        this.checkedItems = [];
    }

    clearAndLoadData() {
        this.Admin.clearCache();
        this.Team.clearCache();
        this.Admin.query().$promise
            .then((adminsList) => {
                this.admins = adminsList;
                this.Team.allTeams().$promise
                    .then((data) => {
                        this.teams = data;
                        this.teamsToMember();
                        this.reloadSelectedTeam();
                    });
            });
    }

    toggleElement(item) {
        let isChecked = this.checkedItems.indexOf(item) > -1;
        if (isChecked) {
            _.pull(this.checkedItems, item);
        } else {
            this.checkedItems.push(item);
        }
        this.hasChecked = this.checkedItems.length > 0;
        item.checked = !isChecked;
    }

    reloadSelectedTeam() {
        if (this.selectedTeam) {
            this.teams.forEach(team => {
                if (team.id == this.selectedTeam.id) {
                    this.openTeam(team);
                }
            })
        }
    }

    teamsToMember() {
        this.admins.forEach(admin => {
            admin.teams = [];
            this.teams.forEach(team => {
                if (team.member_ids.includes(admin.id)) {
                    admin.teams.push(team);
                }
            })
        });
    }

    openTeam(team) {
        this.selectedTeam = angular.copy(team);
    }

    openAdminsWithInvites() {
        this.selectedTeam = null;
    }

    onSelectMember(team, admin) {
        this.Team.addMember({id: team.id}, {admin: admin.id}).$promise
            .then(() => {
                this.clearAndLoadData();
                this.notifier.info('The user "' + admin.name + '" is added to "' + team.name + '" team');
            });
    }

    removeMember(team, member) {
        this.dialogs
            .confirm({
                title: 'Remove User',
                body: `Are you sure you want to remove this user from "${team.name}" team?`,
                closeText: 'Remove User'
            })
            .then(() => {
                this.Team.removeMember({id: team.id}, {admin: member.id}).$promise
                    .then(() => {
                        this.notifier.info('The user is removed from "' + team.name + '" team');
                        this.clearAndLoadData();
                    });
            });
    }

    openDropAdmin(admin) {
        this.dialogs.dropAdmin(admin);
    }

    openSendInvite(inviteMail) {
        if (inviteMail) {
            let invitation = {
                email: inviteMail,
                creatingInvite: true,
                role: 'full_access',
                description: 'full_access',
                can_access_settings_and_billing: true,
                can_export_data: true,
                can_send_messages: true
            };
            this.dialogs.editInvite(invitation)
                .then(invite => {
                    this.invitesList.push(invite);
                });
        } else {
            this.dialogs.editInvite()
                .then(invite => {
                    this.invitesList.push(invite);
                });
        }
    }
    
    openPermissionsManagement(user, invite) {
        if (this.currentUser.id !== user.id) {
            this.dialogs.editInvite(user)
                .then(changedUser => {
                if (invite) {
                    _.each(this.invitesList, (user) => {
                        if (user.invite_token === changedUser.invite_token) {
                            user.role = changedUser.role;
                            user.description = changedUser.description;
                            user.can_access_settings_and_billing = changedUser.can_access_settings_and_billing;
                            user.can_export_data = changedUser.can_export_data;
                            user.can_send_messages = changedUser.can_send_messages;
                            this.notifier.info('Permissions for ' + (user.name || user.email) + ' has been changed.');
                        }
                    });
                }
            });
        }
    }

    openCreateTeam() {
        this.dialogs.editTeam()
            .then((team) => {
                this.clearAndLoadData();
                this.openTeam(team);
            });
    }

    openEditTeam() {
        this.dialogs.editTeam(this.selectedTeam)
            .then(() => {
                this.clearAndLoadData();
            });
    }

    openDeleteTeam() {
        let deletedTeamName = this.selectedTeam.name,
            body = `You’re about to delete this team in Riika. ` +
            `Assign existing conversations, replies and assignment rules from "${deletedTeamName}"`;

        this.dialogs
            .deleteTeam({
                title: `Delete "${deletedTeamName}" team`,
                body: body,
                team: this.selectedTeam,
                closeText: 'Delete Team',
                currentUser: this.currentUser,
                teams: this.teams,
                admins: this.admins
            })
            .then(() => {
                return this.selectedTeam.$delete();
            })
            .then(() => {
                this.clearAndLoadData();
                this.openAdminsWithInvites();
                this.notifier.info(`The "${deletedTeamName}" was removed`);
            });
    }

    openDeleteMembers() {
        this.dialogs
            .confirm({
                title: 'Delete members',
                body: `You’re about to delete members from ${this.selectedTeam.name}`,
                closeText: 'Delete members'
            })
            .then(() => {
                this.checkedItems.forEach(item => {
                    _.pull(this.selectedTeam.members, item);
                    _.pull(this.selectedTeam.member_ids, item.id);
                });
            })
            .then(() => {
                this.Team.update(this.selectedTeam).$promise
                    .then(() => {
                        this.clearAndLoadData();
                        this.notifier.info('The members are removed from "' + this.selectedTeam.name + '" team');
                    });
            });
    }

    openRevokeManagement(invite) {
        this.dialogs
            .confirm({
                title: 'Delete Invite',
                body: `Are you sure you want to delete the invite for ${invite.email}?`,
                closeText: 'Delete Invite'
            })
            .then(() => {
                this.Invites.delete({token: invite.invite_token})
                    .$promise
                    .then(() => {
                        this.notifier.info('The invite to ' + invite.email + ' has been deleted');
                        _.remove(this.invitesList, {email: invite.email});
                    });
            });
    }

    resendInvite(invite) {
        this.Invites.reSendInvite({token: invite.invite_token})
            .$promise
            .then(()=> {
                this.notifier.info('The invite to ' + invite.email + ' has been resent');
            });
    }

    adminInTeamFilter() {
        return (admin) => {
            return !_.some(_.get(this.selectedTeam, 'members', []), {id: admin.id});
        };
    }
};

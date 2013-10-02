(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.teamboard.TeamBoardCard', {
        alias: 'widget.rallyteamboardcard',
        extend: 'Rally.ui.cardboard.Card',
        requires: [
            'Rally.apps.teamboard.TeamBoardUtil',
            'Rally.ui.cardboard.plugin.CardContentLeft',
            'Rally.util.User'
        ],

        inheritableStatics: {
            getFetchFields: function() {
                return ['FirstName', 'LastName', 'Role'];
            }
        },

        setupPlugins: function(){
            this.plugins.push({
                ptype: 'rallycardcontentleft',
                getCardHeader: function(){
                    var record = this.card.getRecord();

                    var name = record.get('FirstName') && record.get('LastName') ? record.get('FirstName') + ' ' + record.get('LastName') : record.get('_refObjectName');
                    var role = record.get('Role') === 'None' ? '' : record.get('Role');

                    return '<table class="card-header">' +
                            '<tr>' +
                            '<td>' +
                            '<img src="' + Rally.util.User.getProfileImageUrl(40, record.get('_ref')) + '">' +
                            '</td>' +
                            '<td class="card-header-spacer"></td>' +
                            '<td class="card-header-user-info">' +
                            '<div class="team-member-name">' + Rally.apps.teamboard.TeamBoardUtil.linkToAdminPage(record, name) + '</div>' +
                            '<div class="team-member-role">' + role + '</div>' +
                            '</td>' +
                            '</tr>' +
                            '</table>';
                }
            });
        }
    });

})();
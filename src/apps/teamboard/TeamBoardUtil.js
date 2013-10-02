(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.teamboard.TeamBoardUtil', {
        requires: [
            'Rally.nav.DetailLink'
        ],
        singleton: true,

        linkToAdminPage: function(record, text, subPage){
            if(!Rally.environment.getContext().getPermissions().isWorkspaceOrSubscriptionAdmin()){
                return text;
            }

            return Rally.nav.DetailLink.getLink({
                record: record,
                showHover: false,
                subPage: subPage,
                text: text
            });
        }
    });

})();
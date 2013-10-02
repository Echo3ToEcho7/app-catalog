(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.teamboard.TeamBoardApp', {
        extend: 'Rally.app.App',
        requires: [
            'Rally.apps.teamboard.TeamBoardCard',
            'Rally.apps.teamboard.TeamBoardColumn',
            'Rally.apps.teamboard.TeamBoardProjectRecordsLoader',
            'Rally.apps.teamboard.TeamBoardSettings',
            'Rally.apps.teamboard.TeamBoardUtil',
            'Rally.ui.cardboard.CardBoard',
            'Rally.ui.cardboard.plugin.Scrollable'
        ],

        statics: {
            ATTRIBUTES_VISIBLE_TO_WS_NON_ADMIN_USERS: ['ObjectID', 'EmailAddress', 'Phone', 'UserName', 'DisplayName', 'FirstName', 'MiddleName', 'LastName', 'Disabled', 'Role', 'Department', 'OfficeLocation', 'CostCenter', 'LoginName']
        },

        config: {
            defaultSettings: {
                cardFields: 'OfficeLocation,Phone'
            }
        },

        cls: 'team-board-app',
        settingsScope: 'workspace',

        launch: function() {
            Rally.apps.teamboard.TeamBoardProjectRecordsLoader.load(this.getSetting('teamOids'), this._onTeamsLoaded, this);
        },

        getSettingsFields: function() {
            return Rally.apps.teamboard.TeamBoardSettings.getFields();
        },

        _showNoDataMessage: function(msg){
            this.add({
                xtype: 'component',
                cls: 'no-data',
                html: '<p>' + msg + '</p>'
            });
        },

        _onTeamsLoaded: function(teams) {
            if (teams.length === 0) {
                this._showNoDataMessage('You do not have access to any of the teams chosen to be shown in this app');
                this._publishComponentReady();
                return;
            }

            this.add(this._getCardboardConfig(teams));
        },

        _getCardboardConfig: function(teams) {
            return {
                xtype: 'rallycardboard',
                attribute: 'TeamMemberships',
                cardConfig: {
                    xtype: 'rallyteamboardcard',
                    fields: Ext.Array.filter(this.getSetting('cardFields').split(','), function(field){
                        return Rally.environment.getContext().getPermissions().isWorkspaceOrSubscriptionAdmin() ||
                                Ext.Array.contains(this.self.ATTRIBUTES_VISIBLE_TO_WS_NON_ADMIN_USERS, field);
                    }, this)
                },
                context: this.getContext(),
                columns: Ext.Array.map(teams, function(team) {
                    return {
                        xtype: 'rallyteamcolumn',
                        columnHeaderConfig: {
                            xtype: 'rallycardboardcolumnheader',
                            headerTpl: Rally.apps.teamboard.TeamBoardUtil.linkToAdminPage(team, team.get('_refObjectName'), 'users')
                        },
                        value: team.get('_ref')
                    };
                }, this),
                listeners: {
                    load: this._onBoardLoad,
                    toggle: this._publishContentUpdated,
                    recordupdate: this._publishContentUpdatedNoDashboardLayout,
                    recordcreate: this._publishContentUpdatedNoDashboardLayout,
                    scope: this
                },
                plugins: [
                    {
                        ptype: 'rallyscrollablecardboard',
                        containerEl: this.getEl()
                    }
                ],
                readOnly: !Rally.environment.getContext().getPermissions().isWorkspaceOrSubscriptionAdmin(),
                storeConfig: {
                    filters: [
                        {
                            property: 'Disabled',
                            operator: '=',
                            value: 'false'
                        }
                    ],
                    sorters: [{
                        direction: 'ASC',
                        property: 'FirstName'
                    }]
                },
                types: ['User']
            };
        },

        _onBoardLoad: function(){
            this._publishContentUpdated();
            this._publishComponentReady();
        },

        _publishComponentReady: function() {
            if (Rally.BrowserTest) {
                Rally.BrowserTest.publishComponentReady(this);
            }
        },

        _publishContentUpdated: function() {
            this.fireEvent('contentupdated');
        },

        _publishContentUpdatedNoDashboardLayout: function() {
            this.fireEvent('contentupdated', {dashboardLayout: false});
        }
    });

})();
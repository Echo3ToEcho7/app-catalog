(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.teamboard.TeamBoardSettings', {
        requires: [
            'Rally.ui.picker.FieldPicker',
            'Rally.ui.picker.MultiObjectPicker'
        ],
        singleton: true,

        getFields: function(){
            return [this._getTeamsPickerConfig(), this._getFieldPickerConfig()];
        },

        _getTeamsPickerConfig: function(){
            return {
                xtype: 'rallymultiobjectpicker',
                alwaysExpanded: true,
                availableTextLabel: 'Available Teams',
                fieldLabel: 'Teams',
                pickerCfg: {
                    style: {
                        border: '1px solid #DDD',
                        'border-top': 'none'
                    },
                    height: 248,
                    shadow: false
                },
                margin: '10px 0 265px 0',
                maintainScrollPosition: true,
                modelType: 'Project',
                name: 'teamOids',
                pickerAlign: 'tl-bl',
                selectedTextLabel: 'Selected Teams',
                selectionKey: 'ObjectID',
                width: 300
            };
        },

        _getFieldPickerConfig: function(){
            var config = {
                xtype: 'rallyfieldpicker',
                fieldLabel: 'Card Fields',
                name: 'cardFields',
                modelTypes: ['User']
            };
            if(!Rally.environment.getContext().getPermissions().isWorkspaceOrSubscriptionAdmin()){
                config.fieldWhiteList = Rally.apps.teamboard.TeamBoardApp.ATTRIBUTES_VISIBLE_TO_WS_NON_ADMIN_USERS;
            }

            return config;
        }
    });

})();
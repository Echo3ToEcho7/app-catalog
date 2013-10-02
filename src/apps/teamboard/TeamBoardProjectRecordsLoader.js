(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.teamboard.TeamBoardProjectRecordsLoader', {
        requires: [
            'Rally.data.QueryFilter',
            'Rally.data.WsapiDataStore'
        ],
        singleton: true,

        load: function(teamOids, callback, scope){
            var config = {
                model: 'Project',
                sorters: ['Name']
            };

            if(teamOids){
                config.filters = Rally.data.QueryFilter.or(Ext.Array.map(teamOids.toString().split(','), function(teamOid) {
                    return {
                        property: 'ObjectID',
                        operator: '=',
                        value: teamOid
                    };
                }));
            }else{
                config.pageSize = 25;
            }

            var store = Ext.create('Rally.data.WsapiDataStore', config);
            store.load({
                callback: callback,
                scope: scope
            });
            return store;
        }
    });

})();
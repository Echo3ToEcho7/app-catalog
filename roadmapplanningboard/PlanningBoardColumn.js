(function () {
    var Ext;

    Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.roadmapplanningboard.PlanningBoardColumn', {
        extend: 'Rally.ui.cardboard.Column',
        alias: 'widget.planningboardcolumn',
        mixins: {
            maskable: 'Rally.ui.mask.Maskable'
        },
        requires: ['Rally.apps.roadmapplanningboard.plugin.OrcaColumnDropController', 'Rally.apps.roadmapplanningboard.OrcaColumnDropTarget'],
        config: {
            stores: [],
            lowestPIType: undefined,
            dropControllerConfig: {
                ptype: 'orcacolumndropcontroller'
            },
            cardConfig: {
                showIconsAndHighlightBorder: true,
                showPlusIcon: false,
                showColorIcon: true,
                showGearIcon: true,
                showReadyIcon: false,
                showBlockedIcon: false
            }
        },

        initComponent: function () {
            this.callParent(arguments);
            return this.on('beforerender', function () {
                var cls;

                cls = 'planning-column';
                this.getContentCell().addCls(cls);
                return this.getColumnHeaderCell().addCls(cls);
            }, this, {
                single: true
            });
        },

        getStores: function () {

            if (!this.planRecord || !this.planRecord.data.features.length) {
                return [];
            }

            var filters = [];

            _.each(this.planRecord.data.features, function(feature) {
                filters.push({
                    property: 'ObjectID',
                    operator: '=',
                    value: feature.id    
                });
            });

            return [ 
                Ext.create('Rally.data.WsapiDataStore', {
                    model: this.lowestPIType,
                    autoLoad: true,
                    fetch: ['Value','FormattedID', 'Owner','Name', 'PreliminaryEstimate', 'DisplayColor'],
                    filters: Rally.data.QueryFilter.or(filters)
                })
            ];
        },

        isMatchingRecord: function () {
            return true;
        },

        _getProgressBarHtml: function () {
            return '<div></div>';
        },

        findCardInfo: function (searchCriteria, includeHiddenCards) {
            var card, index, _i, _len, _ref;

            searchCriteria = searchCriteria.get && searchCriteria.get('ObjectID') ? searchCriteria.get('ObjectID') : searchCriteria;
            _ref = this.getCards(includeHiddenCards);
            for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
                card = _ref[index];
                if (card.getRecord().get('ObjectID') === searchCriteria || card.getEl() === searchCriteria || card.getEl() === Ext.get(searchCriteria)) {
                    return {
                        record: card.getRecord(),
                        index: index,
                        card: card
                    };
                }
            }
            return null;
        },

        destroy: function () {
            var plugin, _i, _len, _ref;

            _ref = this.plugins;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                plugin = _ref[_i];
                if (plugin !== null) {
                    plugin.destroy();
                }
            }
            return this.callParent(arguments);
        }
    });

}).call(this);

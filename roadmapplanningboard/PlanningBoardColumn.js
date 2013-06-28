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
            dropControllerConfig: {
                ptype: 'orcacolumndropcontroller'
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
            return this.stores;
        },
        isMatchingRecord: function () {
            return true;
        },
        _getProgressBarHtml: function () {
            return '<div></div>';
        },
        _queryForData: function () {
            this.callParent(arguments);
            if (!this.stores || !this.stores.length) {
                return this._allCardsReady();
            }
        },
        findCardInfo: function (searchCriteria, includeHiddenCards) {
            var card, index, _i, _len, _ref;

            searchCriteria = searchCriteria.get && searchCriteria.get('id') ? searchCriteria.get('id') : searchCriteria;
            _ref = this.getCards(includeHiddenCards);
            for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
                card = _ref[index];
                if (card.getRecord().get('id') === searchCriteria || card.getEl() === searchCriteria || card.getEl() === Ext.get(searchCriteria)) {
                    return {
                        record: card.getRecord(),
                        index: index,
                        card: card
                    };
                }
            }
            return null;
        },
        _createCard: function (record, cardConfig) {
            var card;

            card = this.callParent(arguments);
            card.popoverPlugin = undefined;
            return card;
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

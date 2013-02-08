(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Portfolio Hierarchy App
     * View and rearrange PIs and their user stories
     */
    Ext.define('Rally.apps.portfoliohierarchy.PortfolioHierarchyApp', {
        extend: 'Rally.app.App',
        requires: [
            'Rally.ui.tooltip.PercentDoneToolTip',
            'Rally.data.util.PortfolioItemHelper',
            'Rally.ui.notify.Notifier',
            'Rally.data.QueryFilter'
        ],

        layout: 'auto',

        items:[
            {
                xtype:'container',
                itemId:'header',
                cls:'header'
            },
            {
                xtype:'container',
                itemId:'bodyContainer'
            }
        ],

        appName: 'Portfolio Hierarchy',

        cls: 'portfolio-hierarchy-app',

        launch: function() {

            Rally.data.util.PortfolioItemHelper.loadTypeOrDefault({
                typeRef: this.getSetting('type'),
                context: this.getContext().getDataContext(),
                defaultToLowest: false,
                success: this.addTreeForType,
                scope: this
            });
        },

        _drawHeader: function(){
            var header = this.down('#header');
            header.add(this._buildHelpComponent());
            header.add(this._buildFilterInfo());
        },

        addTreeForType: function(record){

            this.typeName = record.get('Name');
            this._drawHeader();

            var tree = this.buildTreeForType(record);
            this.down('#bodyContainer').add(tree);
        },

        buildTreeForType: function(typeRecord){
            var me = this;

            var filters = [];
            if (this.getSetting('query')) {
                try {
                  filters.push(Rally.data.QueryFilter.fromQueryString(this.getSetting('query')));
                } catch (e) {
                    Rally.ui.notify.Notifier.showError({
                        message: e.message
                    });
                }
            }

            return Ext.create('Rally.ui.tree.PortfolioTree', {
                stateful: true,
                stateId: this.getAppId() + 'rallyportfoliotree',
                topLevelModel: typeRecord.get('TypePath'),
                topLevelStoreConfig: {
                    filters: filters,
                    context: this.getContext().getDataContext()
                },
                childItemsStoreConfigForParentRecordFn: function(){
                    return {
                        context: {
                            project: undefined,
                            workspace: me.getContext().getDataContext().workspace
                        }
                    };
                },
                emptyText: '<p>No portfolio items of this type found.</p>' +
                           '<p>Click the gear to set your project to match the location of your portfolio items or to filter further by type.</p>'
            });
        },

        _buildHelpComponent:function () {
            return Ext.create('Ext.Component', {
                cls:Rally.util.Test.toBrowserTestCssClass('portfolio-hierarchy-help-container'),
                renderTpl: Rally.util.Help.getIcon({
                    id: 268
                })
            });
        },

        _buildFilterInfo: function(){
            return Ext.create('Rally.ui.tooltip.FilterInfo', {
                projectName: this.getSetting('project') && this.getContext().get('project').Name || 'Following Global Project Setting',
                typeName: this.typeName,
                scopeUp: this.getSetting('projectScopeUp'),
                scopeDown: this.getSetting('projectScopeDown'),
                query: this.getSetting('query')
            });
        }

    });
})();

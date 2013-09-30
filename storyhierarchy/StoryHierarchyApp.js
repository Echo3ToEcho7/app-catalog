(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * Story Hierarchy App
     * View and rearrange user stories
     */
    Ext.define('Rally.apps.storyhierarchy.StoryHierarchyApp', {
        extend: 'Rally.app.App',
        
        requires: [
            'Rally.ui.tree.UserStoryTree',
            'Rally.util.Help',
            'Rally.util.Test'
        ],

        alias: 'widget.storyhierarchyapp',

        layout: 'auto',

        appName: 'Story Hierarchy',

        cls: 'story-hierarchy-app',

        mixins: {
            messageable: 'Rally.Messageable'
        },

        items: [
            {
                xtype:'container',
                itemId:'header',
                cls:'header'
            }
        ],

        launch: function() {
            Rally.data.ModelFactory.getModel({
                type: 'userstory',
                success: function(model){
                    this._drawTree(model);
                },
                scope: this
            });
        },

        _drawTree: function(model){
            var me = this;

            this.add({
                xtype: 'rallyuserstorytree',
                stateful: true,
                stateId: this.getAppId() + 'rallyuserstorytree',
                topLevelStoreConfig: {
                    filters: [this._buildQueryFilter(model)],
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
                listeners: {
                    initialload: this._onTreeInitialLoad,
                    scope: this
                }
            });

            this._drawHeader();
        },

        _onTreeInitialLoad: function() {
            if (Rally.BrowserTest) {
                Rally.BrowserTest.publishComponentReady(this);
            }
        },

        _buildQueryFilter: function(model) {
            var queryFilter = Ext.create('Rally.data.QueryFilter', {
                property: 'Parent',
                operator: '=',
                value: 'null'
            });

            if(model.getField('PortfolioItem')){
                queryFilter = queryFilter.and({
                    property: 'PortfolioItem',
                    operator: '=',
                    value: 'null'
                 });
            }

            if (this.getSetting('query')) {
                try {
                    queryFilter = queryFilter.and(Rally.data.QueryFilter.fromQueryString(this.getSetting('query')));
                } catch (e) {
                    Rally.ui.notify.Notifier.showError({
                        message: e.message
                    });
                }
            }

            return queryFilter;
        },

        _drawHeader: function(){
            var header = this.down('#header');
            header.add(this._buildHelpComponent());
            header.add(this._buildFilterInfo());
        },

        _buildHelpComponent:function (config) {
            return Ext.create('Ext.Component', Ext.apply({
                cls:Rally.util.Test.toBrowserTestCssClass('story-hierarchy-help-container') + ' rally-help-icon',
                renderTpl: Rally.util.Help.getIcon({
                    id: 269
                })
            }, config));
        },

        _buildFilterInfo: function(){
            return Ext.create('Rally.ui.tooltip.FilterInfo', {
                settings: this.getSettings(),
                projectName: this.getSetting('project') && this.getContext().get('project').Name || 'Following Global Project Setting',
                scopeUp: this.getSetting('projectScopeUp'),
                scopeDown: this.getSetting('projectScopeDown'),
                query: this.getSetting('query')
            });
        }

    });
})();

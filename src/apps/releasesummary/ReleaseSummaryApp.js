(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.releasesummary.ReleaseSummaryApp', {
        extend: 'Rally.app.TimeboxScopedApp',
        alias: 'widget.releasesummaryapp',
        componentCls: 'releasesummary',
        requires: ['Rally.ui.grid.Grid'],
        scopeType: 'release',
        comboboxConfig: {
            itemId: 'box',
            fieldLabel: 'Release:',
            labelWidth: 70,
            width: 300
        },

        launch: function() {
            this.add(
                {
                    xtype: 'container',
                    itemId: 'releaseInfo',
                    tpl: [
                        '<div class="releaseInfo"><p><b>About this release: </b><br />',
                        '<p class="release-notes">{notes}</p>',
                        'Additional information is available <a href="{detailUrl}" target="_top">here.</a></p></div>'
                    ]
                }, 
                {
                    xtype: 'container',
                    itemId: 'stories',
                    items: [{
                        xtype: 'label',
                        itemId: 'story-title',
                        componentCls: 'gridTitle',
                        text: 'Stories:'
                    }]
                }, 
                {
                    xtype: 'container',
                    itemId: 'defects',
                    items: [{
                        xtype: 'label',
                        itemId: 'defect-title',
                        text: 'Defects:',
                        componentCls: 'gridTitle'
                    }]
                }
            );
            this.callParent(arguments);
        },

        onScopeChange: function() {
            if(!this.models) {
                 Rally.data.ModelFactory.getModels({
                    types: ['UserStory', 'Defect'],
                    success: function(models) {
                        this.models = models;
                        this._buildGrids();
                        this._loadReleaseDetails();
                    },
                    scope: this
                });
             } else {
                this._refreshGrids();
                this._loadReleaseDetails();
            }
        },

        _loadReleaseDetails: function() {
            var release = this.getContext().getTimeboxScope().getRecord();
            var releaseModel = release.self;

            releaseModel.load(Rally.util.Ref.getOidFromRef(release), {
                fetch: ['Notes'],
                success: function(record) {
                    this.down('#releaseInfo').update({
                        detailUrl: Rally.nav.Manager.getDetailUrl(release),
                        notes: record.get('Notes')
                    });
                },
                scope: this    
            });
        },

        _buildGrids: function() {
            var storyStoreConfig = this._getStoreConfig({
                model: this.models.UserStory,
                listeners: {
                    load: this._onStoriesDataLoaded,
                    scope: this
                }
            });
            this.down('#stories').add(this._getGridConfig({
                itemId: 'story-grid',
                model: this.models.UserStory,
                storeConfig: storyStoreConfig
            }));

            var defectStoreConfig = this._getStoreConfig({
                 model: this.models.Defect,
                 listeners: {
                    load: this._onDefectsDataLoaded,
                    scope: this
                }
            });
            this.down('#defects').add(this._getGridConfig({
                itemId: 'defect-grid',
                model: this.models.Defect,
                storeConfig: defectStoreConfig
            }));
        },

        _getStoreConfig: function(storeConfig) {
            return Ext.apply({
                autoLoad: true,
                fetch: ['FormattedID', 'Name', 'ScheduleState'],
                // filters: [
                //     {
                //         property: 'Release',
                //         operator: '=',
                //         value: this.getContext().getTimeboxScope().getRecord().get('_ref')
                //     }
                // ],
                filters: [this.getContext().getTimeboxScope().getQueryFilter()],
                sorters: [{
                    property: 'FormattedID',
                    direction: 'ASC'
                }],
                pageSize: 25
            }, storeConfig);
        },


        _getGridConfig: function(config) {
            return Ext.apply({
                xtype: 'rallygrid',
                componentCls: 'grid',
                columnCfgs: [
                    {text: 'ID', dataIndex: 'FormattedID', xtype: 'templatecolumn',
                        tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')}, 
                    {text: 'Name', dataIndex: 'Name', flex: 3}, 
                    {text: 'Schedule State', dataIndex: 'ScheduleState', flex: 1}
                ]
            }, config);
        },

        _refreshGrids: function() {
            var filter = [this.getContext().getTimeboxScope().getQueryFilter()];
            this.down('#defect-grid').filter(filter, true, true);
            this.down('#story-grid').filter(filter, true, true);
            return filter;
        },

        _onStoriesDataLoaded: function (store) {
            this.down('#story-title').update('Stories: ' + store.getTotalCount());
            this._storiesLoaded = true;
            this._fireReady();
        },

        _onDefectsDataLoaded: function (store) {
            this.down('#defect-title').update('Defects: ' + store.getTotalCount());
            this._defectsLoaded = true;
            this._fireReady();
        },

        _fireReady: function() {
            if(Rally.BrowserTest && this._storiesLoaded && this._defectsLoaded && !this._readyFired) {
                this._readyFired = true;
                debugger;
                Rally.BrowserTest.publishComponentReady(this);
            }
        }

        // Uncomment these lines to allow printing when pasting the app into Custom HTML

        //getOptions: function() {
        //    return [
        //        {
        //            text: 'Print',
        //            handler: this._onButtonPressed,
        //            scope: this
        //        }
        //    ];
        //},

        //_onButtonPressed: function() {
        //    var release = this.getContext().getTimeboxScope().getRecord().get('Name');
        //    var title = release, options;

        //    var css = document.getElementsByTagName('style')[0].innerHTML;
        //    
        //    options = "toolbar=1,menubar=1,scrollbars=yes,scrolling=yes,resizable=yes,width=1000,height=500";
        //    
        //    var printWindow;
        //    if (Ext.isIE) {
        //        printWindow = window.open();
        //    } else {
        //        printWindow = window.open('', title, options);
        //    }

        //    var doc = printWindow.document;

        //    var stories = this.down('#stories');
        //    var defects = this.down('#defects');
        //    var releaseinfo = this.down('#releaseInfo');

        //    doc.write('<html><head>' + '<style>' + css + '</style><title>' + title + '</title>');

        //    doc.write('</head><body class="landscape">');
        //    doc.write('<p style="font-family:Arial,Helvetica,sans-serif;margin:5px">Release: ' + release + '</p><br />');
        //    doc.write(releaseinfo.getEl().dom.innerHTML + stories.getEl().dom.innerHTML + defects.getEl().dom.innerHTML);
        //    doc.write('</body></html>');
        //    doc.close();

        //    this._injectCSS(printWindow);

        //    if (Ext.isSafari) {
        //        var timeout = setTimeout(function() {
        //            printWindow.print();
        //        }, 500);
        //    } else {
        //        printWindow.print();
        //    }

        //},

        //// source code to get the Rally CSS
        //_injectContent: function(html, elementType, attributes, container, printWindow){
        //    elementType = elementType || 'div';
        //    container = container || printWindow.document.getElementsByTagName('body')[0];

        //    var element = printWindow.document.createElement(elementType);

        //    Ext.Object.each(attributes, function(key, value){
        //        if (key === 'class') {
        //            element.className = value;
        //        } else {
        //            element.setAttribute(key, value);
        //        }
        //    });

        //    if(html){
        //        element.innerHTML = html;
        //    }

        //    return container.appendChild(element);
        //},

        //_injectCSS: function(printWindow){
        //    Ext.each(Ext.query('link'), function(stylesheet){
        //            this._injectContent('', 'link', {
        //            rel: 'stylesheet',
        //            href: stylesheet.href,
        //            type: 'text/css'
        //        }, printWindow.document.getElementsByTagName('head')[0], printWindow);
        //    }, this);
        //}
    });

})();
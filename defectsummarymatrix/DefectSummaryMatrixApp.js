(function() {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('Rally.apps.defectsummarymatrix.DefectSummaryMatrixApp', {
        extend: 'Rally.app.TimeboxScopedApp',
        componentCls: 'app',
        appName: 'Defect Summary Matrix',
        scopeType: 'release',

        comboboxConfig: {
            fieldLabel: 'Release ',
            labelAlign: 'right',
            labelWidth: 30,
            labelPad: 15,
            growToLongestValue: true,
            margin: '10px 0',
            minWidth: 230,
            padding: '0 0 0 5px'
        },

        clientMetrics: [
            {
                method: '_onMatrixCellClicked',
                defaultUserAction: 'matrix cell clicked'
            }
        ],

        initComponent: function() {
            this.callParent(arguments);
            this.mon(this, 'render', function() {
                this.setLoading(true);
            }, this );

            Rally.data.ModelFactory.getModel({
                type:'Defect',
                success: this._onDefectModelRetrieved,
                scope: this
            });
        },

        addContent: function(scope) {
            this._hideComponentIfNeeded(this.defectGridHeader);
            this._hideComponentIfNeeded(this.defectGrid);

            this.releaseFilter = this.context.getTimeboxScope().getQueryFilter();
            if (this.allDefectStore) {
                this.allDefectStore.clearFilter(true);
                this.allDefectStore.filter(this.releaseFilter);
            } else {
                this._initializeAllDefectStore();
            }
        },

        onScopeChange: function(scope) {
            if (this.matrixGrid) {
                this.matrixGrid.setLoading(true);
            }
            this.addContent(scope);
        },

        onNoAvailableTimeboxes: function() {
            this.setLoading(false);
        },

        _onDefectModelRetrieved: function(model) {
            this.defectModel = model;

            this._extractAllowedValues(model, ['State', 'Priority']).then({
                success: function(allowedValues) {
                    this.states = allowedValues.State;
                    this.priorities = allowedValues.Priority;
                    this._initializeAllDefectStore();
                },
                scope: this
            });
        },

        _extractAllowedValues: function(defectModel, fieldNames) {
            var result = {};
            var deferred = Ext.create('Deft.Deferred');

            _.each(fieldNames, function(fieldName) {
                defectModel.getField(fieldName).getAllowedValueStore().load({
                    callback: function(records, operation, success) {
                        var allowedValues = _.map(records, function(record) {
                            var value = record.get('StringValue');
                            return value === '' ? 'None' : value;
                        });

                        result[fieldName] = allowedValues;

                        if(_.keys(result).length === fieldNames.length) {
                            deferred.resolve(result);
                        }
                    }
                });
            });

            return deferred.promise;
        },

        _hideComponentIfNeeded: function(component) {
            if (component) {
                component.hide();
            }
        },

        _showComponentIfNeeded: function(component) {
            if (component && component.isHidden()) {
                component.show();
            }
        },

        _initializeAllDefectStore: function() {
            if (this.releaseFilter && this.defectModel) {
                this.allDefectStore = Ext.create('Rally.data.WsapiDataStore', {
                    model: this.defectModel,
                    fetch: ['State','Priority'],
                    autoLoad: true,
                    limit: Infinity,
                    context: this.getContext().getDataContext(),
                    filters: this.releaseFilter,
                    listeners: {
                        load: this._onAllDefectStoreLoaded,
                        scope: this
                    }
                });
            }
        },

        _onAllDefectStoreLoaded: function(store, records, successful, eOpts) {
            this._initializeMatrixTable();
            this._populateMatrixTable(records);
            this._createPriorityRecords(records);
            this._updateMatrixGrid();
            this.setLoading(false);
        },

        _initializeMatrixTable: function() {
            this.matrixTable = [];
            Ext.each(this.priorities, function(priority, pIndex) {
                this.matrixTable[pIndex] = [];
                Ext.each(this.states, function(state, sIndex) {
                    this.matrixTable[pIndex][sIndex] = 0;
                }, this);
            }, this);
        },

        _populateMatrixTable: function(defectRecords) {
            var priorityIndex, stateIndex;
            Ext.each(defectRecords, function(record) {
                priorityIndex = this._determinePriorityIndex(record.get('Priority'));
                stateIndex = this._determineStateIndex(record.get('State'));
                this.matrixTable[priorityIndex][stateIndex]++;
            }, this);
        },

        _determinePriorityIndex: function(value) {
            return this.priorities.indexOf(value);
        },

        _determineStateIndex: function(value) {
            return this.states.indexOf(value);
        },

        _createPriorityRecords: function(defectRecords) {
            var currentRecord,
                rowTotal,
                numDefects,
                colTotals = new Array(this.states);
            this.priorityRecords = [];

            Ext.each(this.states, function(state, sIndex) {
                colTotals[sIndex] = 0;
            });

            Ext.each(this.matrixTable, function(stateArray, priorityIndex){
                currentRecord = {Priority: this.priorities[priorityIndex]};
                rowTotal = 0;
                Ext.each(stateArray, function(numDefects, stateIndex) {
                    currentRecord[this.states[stateIndex]] = this._createDetailLink(numDefects);
                    rowTotal += numDefects;
                    colTotals[stateIndex] += numDefects;
                }, this);
                currentRecord.RowTotal = this._createDetailLink(rowTotal);
                this.priorityRecords.push(currentRecord);
            }, this);

            currentRecord = {Priority: 'Total'};
            Ext.each(this.states, function(state, sIndex) {
                currentRecord[state] = this._createDetailLink(colTotals[sIndex]);
            }, this);
            currentRecord.RowTotal = this._createDetailLink(defectRecords.length);

            this.priorityRecords.push(currentRecord);
        },

        _updateMatrixGrid: function() {
            var newMatrixGridStore = this._createMatrixGridStore();

            if (this.matrixGrid) {
                this.matrixGrid.getView().bindStore(newMatrixGridStore);
                this.matrixGrid.setLoading(false);
            } else {
                this._createMatrixGrid(newMatrixGridStore);
            }
        },

        _createMatrixGridStore: function() {
            return Ext.create('Rally.data.custom.Store', {
                data: this.priorityRecords,
                pageSize: this.priorityRecords.length
            });
        },

        _createMatrixGrid: function(store) {
            this.matrixGrid = this.add(Ext.create('Rally.ui.grid.Grid', {
                store: store,
                showPagingToolbar: false,
                sortableColumns: false,
                columnCfgs: this._buildColumns(),
                listeners: {
                    cellclick: this._onMatrixCellClicked,
                    scope: this
                }
            }));
        },

        _buildColumns: function() {
            var columns = [
                {
                  text: "",
                  dataIndex: 'Priority',
                  flex: 0.4
                }
            ];

            Ext.each(this.states, function(state) {
                columns.push({
                    text: state,
                    dataIndex: state,
                    flex: 0.3
                });
            });


            columns.push({
                text: "Total",
                dataIndex: 'RowTotal',
                flex: 0.3
            });

            return columns;
        },

        _createDetailLink: function(count) {
            return "<a href='#' onclick='return false;'>" + count + "</a>";
        },

        _onMatrixCellClicked: function(table, td, cellIndex, record, tr, rowIndex, e, eOpts) {
            cellIndex--;
            if (cellIndex >= 0) {
                this._updateDefectGrid(rowIndex, cellIndex);
            }
        },

        _updateDefectGrid: function(priorityIndex, stateIndex) {
            var priority = this.priorities[priorityIndex],
                state = this.states[stateIndex],
                allPriorities = (typeof priority === "undefined"),
                allStates = (typeof state === "undefined"),
                newTitle = this._determineDefectGridTitle(priority, state, allPriorities, allStates),
                newFilters = this._createNewDefectFilters(priority, state, allPriorities, allStates);

            if (this.defectGrid) {
                this._changeDefectGridTitleAndFilters(newTitle, newFilters);
            } else {
                this._createDefectGrid(newTitle, newFilters);
            }
        },

        _createDefectGrid: function(title, filters) {
            this.defectGridHeader = this.add({
                xtype: 'component',
                itemId: 'defectGridHeader',
                html: title,
                style: {
                    padding: '20px 0 6px 0',
                    width: '100%',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }
            });
            this.defectGrid = this.add({
                xtype: 'rallygrid',
                itemId: 'defectGrid',
                model: this.defectModel,
                storeConfig: {
                    filters: filters
                },
                autoLoad: false,
                columnCfgs:['FormattedID', 'Name', 'State', 'Priority', 'Owner'],
                limit: Infinity,
                enableEditing: false,
                margin: '0 0 10px 0'
            });
        },

        _changeDefectGridTitleAndFilters: function(newTitle, newFilters) {
            this.defectGridHeader.update(newTitle);
            this.defectGrid.getStore().clearFilter(true);
            this.defectGrid.getStore().filter(newFilters);

            this._showComponentIfNeeded(this.defectGridHeader);
            this._showComponentIfNeeded(this.defectGrid);
        },

        _createNewDefectFilters: function(priority, state, allPriorities, allStates) {
            var newFilters = [this.releaseFilter];

            if (!allPriorities) {
                newFilters.push({
                    property: 'Priority',
                    value: priority
                });
            }
            if (!allStates) {
                newFilters.push({
                    property: 'State',
                    value: state
                });
            }

            return newFilters;
        },

        _determineDefectGridTitle: function(priority, state, allPriorities, allStates) {
            if (!allStates && !allPriorities) {
                if (priority === 'None') {
                    return state + ' Defects Without a Priority';
                } else {
                    return state + ' ' + priority + ' Defects';
                }
            } else if (allStates && allPriorities) {
                return 'All Defects';
            } else if (allPriorities) {
                return 'All ' + state + ' Defects';
            } else if (allStates) {
                if (priority === 'None') {
                    return 'All Defects Without a Priority';
                } else {
                    return 'All ' + priority + ' Defects';
                }
            }

            return '';
        }
    });
})();

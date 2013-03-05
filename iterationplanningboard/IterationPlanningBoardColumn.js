(function() {
    var Ext = window.Ext4 || window.Ext;

    /**
     * @private
     *
     * Should this be a generic 'TimeboxColumn' class in rui?
     *
     * A column that is ideal for iteration (and soon, release) planning. It will render the iteration's start
     * and end dates in the header.
     *
     *     columnConfig: {
     *         xtype: 'iterationplanningboardappplanningcolumn',
     *         records: [iterationRecord]
     *     }
     *
     * And for releases:
     *
     *     columnConfig: {
     *         xtype: 'iterationplanningboardappplanningcolumn',
     *         records: [releaseRecord],
     *         startDateField: 'ReleaseStartDate',
     *         endDatefield: 'ReleaseEndDate'
     *     }
     *
     */
    Ext.define('Rally.apps.iterationplanningboard.IterationPlanningBoardColumn', {
        extend: 'Rally.ui.cardboard.Column',
        alias: 'widget.iterationplanningboardappplanningcolumn',

        config: {
            /**
             * @cfg {String}
             * The name of the field inside the record that stores the start date
             */
            startDateField: 'StartDate',

            /**
             * @cfg {String}
             * The name of the field inside the record that stores the end date
             */
            endDateField: 'EndDate',

            /**
             * @cfg {Rally.domain.WsapiModel[]}
             * The timebox records (Iteration or Release) for this column
             */
            timeboxRecords: [],

            /**
             * @cfg {Boolean}
             * Used to determine if this column represents the current timebox (iteration/release)
             */
            currentTimebox: false
        },

        cls: 'column',

        requires: [
            'Ext.XTemplate'
        ],

        constructor: function(config) {
            this.mergeConfig(config);
            this.config.value = Rally.util.Ref.getRelativeUri(this._getTimeboxRecord());
            this.config.displayValue = this._getTimeboxRecord().get('Name');

            this.callParent([this.config]);
        },

        initComponent: function() {
            this.callParent(arguments);
            this.on('beforecarddroppedsave', this._onBeforeCardDrop, this);

            this.on('afterrender', function() {
                var cls = 'planning-column';
                if (this.currentTimebox) {
                    cls += ' current-timebox';

                }
                this.getContentCell().addCls(cls);
                this.getColumnHeaderCell().addCls(cls);
            }, this, {single: true});
        },

        getStoreFilter: function(model) {
            var modelName = this._getTimeboxRecord().self.displayName;
            return [
                {
                    property: modelName + ".Name",
                    value: this._getTimeboxRecord().get('Name')
                },
                {
                    property: modelName + "." + this.startDateField,
                    value: Rally.util.DateTime.toIsoString(this._getTimeboxRecord().get(this.startDateField))
                },
                {
                    property: modelName + "." + this.endDateField,
                    value: Rally.util.DateTime.toIsoString(this._getTimeboxRecord().get(this.endDateField))
                }
            ];
        },

        isMatchingRecord: function(record) {
            return Ext.Array.some(this.timeboxRecords, function(timeboxRecord) {
                return Rally.util.Ref.getOidFromRef(record.get('Iteration')) === timeboxRecord.get('ObjectID');
            });
        },

        getHeaderTpl: function() {
            this.headerTpl = this.headerTpl || Ext.create('Ext.XTemplate',
                '<div class="ellipsis columnTitle" title="{columnTitle}">{columnTitle}</div>',
                '<div class="timeboxDates">{formattedStartDate} - {formattedEndDate}</div>',
                '{progressBarHtml}'
            );

            return this.headerTpl;
        },

        getHeaderTplData: function() {
            return {
                columnTitle: this.getDisplayValue() || this.getValue(),
                formattedStartDate: this._getFormattedDate(this.startDateField),
                formattedEndDate: this._getFormattedDate(this.endDateField),
                progressBarHtml: this._getProgressBarHtml()
            };
        },

        _getFormattedDate: function(fieldName) {
            return Rally.util.DateTime.formatWithNoYearWithDefault(this._getTimeboxRecord().get(fieldName));
        },

        _getTimeboxRecord: function() {
            return this.timeboxRecords[0];
        },

        _onBeforeCardDrop: function(column, card) {
            var cardProjectRef = Rally.util.Ref.getRelativeUri(card.getRecord().get('Project'));
            if (cardProjectRef !== Rally.util.Ref.getRelativeUri(column.context.getProject())) {

                if (!Ext.Array.some(this.timeboxRecords, function(timeboxRecord) {
                    return cardProjectRef === Rally.util.Ref.getRelativeUri(timeboxRecord.get('Project'));
                })) {
                    card.getRecord().set('Project', column.context.getProject()._ref);
                }
            }
        },

        _getProgressBarHtml: function() {
            var totalPointCount = this._getTotalPointCount();
            var plannedVelocity = this._getPlannedVelocity();
            var tpl = Ext.create('Rally.ui.renderer.template.progressbar.TimeboxProgressBarTemplate', {
                height: '14px',
                width: '80%'
            });
            var html = tpl.apply({
                percentDone: totalPointCount / plannedVelocity,
                amountComplete: totalPointCount,
                total: plannedVelocity
            });

            return html === '' ? html : '<div class="progress-bar-background">' + html + '</div>';
        },

        _getTotalPointCount: function() {
            var sum = 0;
            Ext.Array.each(this.getCards(true), function(card) {
                var planEstimate = card.getRecord().get('PlanEstimate');
                if (Ext.isNumber(planEstimate)) {
                    sum += planEstimate;
                }
            });
            return sum;
        },

        _getPlannedVelocity: function() {
            var sum = 0;
            Ext.Array.each(this.timeboxRecords, function(timeboxRecord) {
                var plannedVelocity = timeboxRecord.get('PlannedVelocity');
                if (Ext.isNumber(plannedVelocity)) {
                    sum += plannedVelocity;
                }
            }, this);
            return sum;
        }
    });
})();

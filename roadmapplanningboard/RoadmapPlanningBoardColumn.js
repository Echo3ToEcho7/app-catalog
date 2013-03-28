(function(){
    var Ext = window.Ext4 || window.Ext;
    var twentyfourHoursInMilliseconds = 86400000;

    /**
     * A column for timeframes, filters Features by start and end planned end date.
     */
    Ext.define('Rally.apps.roadmapplanningboard.RoadmapPlanningBoardColumn', {
        extend: 'Rally.ui.cardboard.Column',
        alias: 'widget.roadmapplanningboardcolumn',
        
        config: {
            startDate: undefined,
            endDate: undefined,
            capacity: undefined
        },

        initComponent: function () {
            this.callParent(arguments);
            this.addCls('roadmapPlanningBoardColumn');

            this.mon(this, 'beforecarddroppedsave', this.onBeforeCardDroppedSave, this);
        },

        getHeaderTpl: function() {
            this.headerTpl = this.headerTpl || Ext.create('Ext.XTemplate',
                '<div class="ellipsis columnTitle" title="{columnTitle}">{columnTitle}</div>',
                '<div class="timeboxDates"><tpl if="formattedStartDate && formattedEndDate">{formattedStartDate} - {formattedEndDate}</tpl>&nbsp;</div>',
                '{progressBarHtml}'
            );

            return this.headerTpl;
        },

        getHeaderTplData: function() {
            return {
                columnTitle: this.getColumnHeader().getHeaderValue() || this.getValue(),
                formattedStartDate: this._getFormattedDate(this.startDate),
                formattedEndDate: this._getFormattedDate(this.endDate),
                progressBarHtml: this._getProgressBarHtml()
            };
        },

        _getFormattedDate: function(date) {
            if(date){
                return Ext.Date.format(date, 'M j');
            }
        },

        getStoreFilter: function () {
            var filters = [];
            if (this.getEndDate()) {
                filters.push({
                    property: 'PlannedEndDate',
                    operator: ">=",
                    value: Ext.Date.format(this.getStartDate(), 'c')
                },
                {
                    property: 'PlannedEndDate',
                    operator: '<=',
                    value: Ext.Date.format(this._getEndOfDay(this.getEndDate()), 'c')
                });
            } else {
                filters.push({
                    property: 'PlannedEndDate',
                    operator: "=",
                    value: 'null'
                });
            }

            return filters;
        },

        isMatchingRecord: function(record) {
            
            if(this.getEndDate()){
                return record.get('PlannedEndDate') >= this.getStartDate() && record.get('PlannedEndDate') <= this._getEndOfDay(this.getEndDate());
            } else {
                return !record.get('PlannedEndDate');
            }
        },

        /**
         * Add 24 hours to the date
         * @private
         */
        _getEndOfDay: function(date){
            return new Date(+date + twentyfourHoursInMilliseconds);
        },

        /**
         * Save the planned start and end date of the record
         */
        onBeforeCardDroppedSave: function (column, card, type) {

            card.record.set({
                PlannedStartDate: column.getStartDate() || 'null',
                PlannedEndDate: column.getEndDate() || 'null'
            });
        },

        _getProgressBarHtml: function() {
            var tpl = Ext.create('Rally.ui.renderer.template.progressbar.TimeboxProgressBarTemplate', {
                height: '14px',
                width: '80%'
            });
            var html = tpl.apply({
                percentDone: this.getCards().length / this.capacity,
                amountComplete: this.getCards().length,
                total: this.capacity
            });

            return html === '' ? html : '<div class="progress-bar-background">' + html + '</div>';
        }
    });

})();
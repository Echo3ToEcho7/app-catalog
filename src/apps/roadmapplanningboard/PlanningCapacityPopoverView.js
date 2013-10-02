(function () {
    var Ext, me;

    Ext = window.Ext4 || window.Ext;

    me = null;

    Ext.define('Rally.apps.roadmapplanningboard.PlanningCapacityPopoverView', {
        extend: 'Rally.ui.popover.Popover',
        alias: 'widget.capacitypopover',
        requires: ['Rally.apps.roadmapplanningboard.PlanningCapacityPopoverController'],
        controller: 'Rally.apps.roadmapplanningboard.PlanningCapacityPopoverController',
        modal: false,
        placement: 'bottom',
        shouldHidePopoverOnBodyClick: true,
        shouldHidePopoverOnIframeClick: true,
        cls: 'roadmap-planning-popover',
        chevronPrefixCls: 'roadmap-planning-popover-chevron',
        items: [
            {
                layout: {
                    type: 'table',
                    align: 'center',
                    columns: 2
                },
                defaults: {
                    hideTrigger: true,
                    minValue: 0,
                    maxLength: 4,
                    enforceMaxLength: true,
                    maxLengthText: '',
                    maxValue: 9999,
                    maxText: '',
                    allowDecimals: false,
                    checkChangeBuffer: 300,
                    validator: function () {
                        return me.getController().validateRange();
                    }
                },
                items: [
                    {
                        xtype: 'component',
                        html: 'Planned Capacity Range',
                        cls: 'popover-label',
                        colspan: 2
                    },
                    {
                        xtype: 'numberfield',
                        itemId: 'low-capacity-field',
                        fieldLabel: 'Low',
                        labelAlign: 'left',
                        labelWidth: 30,
                        labelPad: 0,
                        name: 'lowCapacity',
                        width: '80px',
                        padding: '-1 8 -5 0',
                        msgTarget: 'capacity-validation-error'
                    },
                    {
                        xtype: 'numberfield',
                        itemId: 'high-capacity-field',
                        fieldLabel: 'High',
                        labelAlign: 'left',
                        labelWidth: 34,
                        labelPad: 0,
                        name: 'highCapacity',
                        width: '86px',
                        padding: '-1 0 -5 8',
                        msgTarget: 'capacity-validation-error'
                    }
                ]
            },
            {
                xtype: 'component',
                autoEl: 'div',
                id: 'capacity-validation-error',
                cls: ['x-form-error-msg', 'form-error-msg-field'],
                hidden: true
            }
        ],
        initComponent: function () {
            this.callParent(arguments);
            me = this;
            this.enableBubbleOnNumberFields('blur');
            return this.enableBubbleOnNumberFields('validitychange');
        },
        enableBubbleOnNumberFields: function (eventName) {
            this.getHighCapacityField().enableBubble(eventName);
            this.getLowCapacityField().enableBubble(eventName);
            return this.down().enableBubble(eventName);
        },
        getLowCapacityField: function () {
            return this.down('#low-capacity-field');
        },
        getHighCapacityField: function () {
            return this.down('#high-capacity-field');
        }
    });

}).call(this);

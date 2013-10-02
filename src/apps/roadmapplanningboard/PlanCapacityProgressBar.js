(function () {
    var Ext = window.Ext4 || window.Ext;
    Ext.define('Rally.apps.roadmapplanningboard.PlanCapacityProgressBar', {
        extend: 'Rally.ui.renderer.template.progressbar.ProgressBarTemplate',
        alias: 'widget.PlanCapacityProgressBar',
        config: {
            width: '75%',
            height: '14px',
            percentFullColors: {
                blue: '#35B2E4 ',
                green: '#8AC651',
                red: '#fc5f5e'
            },
            calculateColorFn: function (values) {
                if (values.total < values.low) {
                    return this.percentFullColors.blue;
                }
                if (values.total <= values.high) {
                    return this.percentFullColors.green;
                }
                return this.percentFullColors.red;
            },
            generateLabelTextFn: function (values) {
                return "" + values.total + " of " + values.high;
            }
        }
    });

}).call(this);

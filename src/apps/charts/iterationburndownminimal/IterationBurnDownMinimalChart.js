(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define("Rally.apps.charts.iterationburndownminimal.IterationBurnDownMinimalChart", {
            requires: [
                "Rally.ui.chart.Chart"
            ],

            chartComponentConfig: {
                xtype: "rallychart",
                itemId: "iterationburndownminimalchart",

                chartColors: ["#005eb8", "#666666", "#8dc63f" ],

                chartConfig: {
                     chart: {
                         zoomType: 'xy',
                         alignTicks: false,
                         animation: false
                     },
                     plotOptions: { series: {animation: false}},
                     legend: { enabled: true },
                     title: { text: null },
                     xAxis: {
                         tickmarkPlacement: 'on',
                         tickInterval: 1
                     },
                     yAxis: [
                         {
                             title: { text: null },
                             min: 0,
                             labels: { style: { color: "#005eb8" } }
                         },
                         {
                            title: { text: null },
                            min: 0,
                            labels: { style: { color: "#8dc63f" } },
                            opposite: true
                         }
                     ]
                },
                chartData: {
                    categories: [ ],
                    series: [
                        {
                            name: "To Do",
                            type: "column",
                            data: [  ],
                            tooltip: { valueDecimals: 1, valueSuffix: ' Hours' }
                        },
                        {
                            name: "Ideal",
                            type: "line",
                            dashStyle: "Solid",
                            data: [ ],
                            marker : {
                                enabled : true,
                                radius : 3
                            },
                            tooltip: { valueDecimals: 1, valueSuffix: ' Hours' }
                        },
                        {
                            name: "Accepted",
                            type: "column",
                            data: [ ],
                            yAxis: 1,
                            tooltip: { valueDecimals: 1, valueSuffix: ' Points' }
                        }
                    ]
                }
            }
        });
}());

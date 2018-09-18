$(function() {
    var revenuePieElement = d3.select('#revenue-pie-chart svg')
    var pieRevenueGraph;

    nv.addGraph(function() {
        pieRevenueGraph = nv.models.pieChart()
                .x(function(d) {
                    return d.label
                })
                .y(function(d) {
                    return d.value
                })
                .showLabels(true)
                .noData("Retrieving data...")
                .color(['#FE5F55', '#628395'])
        revenuePieElement
                .datum([])
                .call(pieRevenueGraph)

        return pieRevenueGraph
    }, function() {
        $.getJSON('http://localhost:3000/report/manager/dashboard-revenue?hotel_uuid=e9584c89-8451-4cae-b004-17ffb77f33a5', function(res) {
            
            revenuePieElement.datum(res.data.pieChartRevenueArray);
            pieRevenueGraph.update();

        });
    });




    var revenueStackedElement = d3.select('#revenue-stacked-bar-chart svg')
    var stackedBarRevenueGraph;


    // var revenueStackedData;

    $.getJSON('http://localhost:3000/report/manager/dashboard-revenue?hotel_uuid=e9584c89-8451-4cae-b004-17ffb77f33a5', function(res) {        
        // revenueStackedData =

        nv.addGraph(function() {
            var stackedBarRevenueGraph = nv.models.multiBarChart()
              .duration(350)
              .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
              .rotateLabels(0)      //Angle to rotate x-axis labels.
              .showControls(true)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
              .groupSpacing(0.1)    //Distance between each group of bars.
              .color(['#FE5F55', '#628395']);
        
            stackedBarRevenueGraph.xAxis
                .tickFormat(function(d) { 
                    return d3.time.format('%d-%b-%y')(new Date(d)) 
                })
        
            stackedBarRevenueGraph.yAxis
                .tickFormat(d3.format(',.1f'));
        
            revenueStackedElement
                .datum(res.data.stackedChartRevenueArray)
                .call(stackedBarRevenueGraph);
        
            nv.utils.windowResize(stackedBarRevenueGraph.update);
        
            return stackedBarRevenueGraph;
        });
    });



    var occupancyElement = d3.select('#occupancy-bar-chart svg')

    $.getJSON('http://localhost:3000/report/manager/dashboard-occupancy?hotel_uuid=e9584c89-8451-4cae-b004-17ffb77f33a5', function(res) {
        console.log(res);

        nv.addGraph(function() {
            var chart = nv.models.discreteBarChart()
                .x(function(d) { return d3.time.format('%d-%b-%y')(new Date(d.date)) })
                .y(function(d) { return d.roomsSold / d.totalRooms  })
                .rotateLabels(-45)
                .showValues(true)
                .color(['#23B5D3'])
                .duration(250);

            occupancyElement
                .datum(res.data)
                .call(chart);

            nv.utils.windowResize(chart.update);
            return chart;
        });
   }) 
})
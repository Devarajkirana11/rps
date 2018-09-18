$(function () {
    var hotelUuid = $('#hotel-uuid').val();
    var metric = $('#metric-toggle').val();

    var url = '/dashboard/manager/bookings?hotel_uuid=' + hotelUuid + '&metric=' + metric;

    function parseNum(num, dec) {
        return parseFloat(num).toFixed(dec);
    }

    function formatDate(type, date) {
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];

        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();

        switch (type) {
            case 'month':
                return "MTD " + monthNames[monthIndex].substring(0, 3) + "'" + year.toString().substr(-2);

                break;

            case 'week':
                return "WS " + day + " " + monthNames[monthIndex].substring(0, 3) + "'" + year.toString().substr(-2);

                break;

            case 'day':
                return day + " " + monthNames[monthIndex].substring(0, 3) + "'" + year.toString().substr(-2);

                break;
        }
    }

    updateData(url);

    $('#metric-toggle').on('change', function () {
        var metric = $('#metric-toggle').val();
        var url = '/dashboard/manager/bookings?hotel_uuid=' + hotelUuid + '&metric=' + metric;

        updateData(url);
    })

    function updateData(url) {
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            cache: false,
            success: function (res) {

                // OVERALL DATA VARIABLES
                var overallBookings = res.data.overallStats.bookings;
                var overallRoomsSold = res.data.overallStats.roomsSold;
                var overallAvgStay = res.data.overallStats.avgStay;
                var overallRoomNights = res.data.overallStats.roomNights;

                // SUMMARY TABLE DATA VARIABLE
                var summaryTable = res.data.summary;

                // CHART DATA VARIABLES
                var monthlyChartData = res.data.trends.monthly;
                var weeklyChartData = res.data.trends.weekly;
                var dailyChartData = res.data.trends.daily;
                var sourceData = res.data.source;

                // ELEMENTS FOR OVERALL STATS
                var $overallBookings = $('.overall-bookings-container');
                var $overallRoomsSold = $('.overall-rooms-sold-container');
                var $overallAvgStay = $('.overall-avg-stay-container');
                var $overallRoomNights = $('.overall-room-nights-container');

                // ELEMENTS FOR SUMMARY TABLE
                var $summaryTable = $('.summary-table');

                // BEGIN OVERALL BOOKINGS
                $overallBookings
                    .find('.overall-bookings')
                    .html(overallBookings.overallBookings);

                $overallBookings
                    .find('.overall-source')
                    .html('');

                $.each(overallBookings.sourceBookings, function (i, e) {
                    $overallBookings
                        .find('.overall-source')
                        .append(
                        '<div class="row">' +
                        '<div class="col-xs-6 text-left"><small class="text-uppercase">' + e.source + '</small></div>' +
                        '<div class="col-xs-6 text-right"><h4 class="m-n fw-semi-thk text-black">' + e.totalBookings + '</h4></div>' +
                        '</div>'
                        )
                });
                // END OVERALL BOOKINGS


                // BEGIN OVERALL ROOMS SOLD
                $overallRoomsSold
                    .find('.overall-rooms-sold')
                    .html(overallRoomsSold.overallRoomsSold);

                $overallRoomsSold
                    .find('.overall-source')
                    .html('');

                $.each(overallRoomsSold.sourceRoomsSold, function (i, e) {
                    $overallRoomsSold
                        .find('.overall-source')
                        .append(
                        '<div class="row">' +
                        '<div class="col-xs-6 text-left"><small class="text-uppercase">' + e.source + '</small></div>' +
                        '<div class="col-xs-6 text-right"><h4 class="m-n fw-semi-thk text-black">' + e.totalRoomsSold + '</h4></div>' +
                        '</div>'
                        )
                });
                // END OVERALL ROOMS SOLD


                // BEGIN AVG STAY
                $overallAvgStay
                    .find('.overall-avg-stay')
                    .html(parseNum(overallAvgStay.overallAvgStay, 2));

                $overallAvgStay
                    .find('.overall-source')
                    .html('');

                $.each(overallAvgStay.sourceAvgStay, function (i, e) {
                    $overallAvgStay
                        .find('.overall-source')
                        .append(
                        '<div class="row">' +
                        '<div class="col-xs-6 text-left"><small class="text-uppercase">' + e.source + '</small></div>' +
                        '<div class="col-xs-6 text-right"><h4 class="m-n fw-semi-thk text-black">' + parseNum(e.avgStay, 2) + '</h4></div>' +
                        '</div>'
                        )
                });
                // END AVG STAY

                // BEGIN ROOM NIGHTS
                $overallRoomNights
                    .find('.overall-room-nights')
                    .html(parseNum(overallRoomNights.overallRoomNights, 2));

                $overallRoomNights
                    .find('.overall-source')
                    .html('')

                $.each(overallRoomNights.sourceRoomNights, function (i, e) {
                    $overallRoomNights
                        .find('.overall-source')
                        .append(
                        '<div class="row">' +
                        '<div class="col-xs-6 text-left"><small class="text-uppercase">' + e.source + '</small></div>' +
                        '<div class="col-xs-6 text-right"><h4 class="m-n fw-semi-thk text-black">' + parseNum(e.roomNightsPerDay, 2) + '</h4></div>' +
                        '</div>'
                        )
                });
                // END ROOM NIGHTS


                // BEGIN SUMMARY TABLE
                $summaryTable
                    .find('tbody')
                    .html('');

                $.each(summaryTable, function (i, e) {
                    $summaryTable
                        .find('thead')
                        .html('<tr class="table-header-row"><th></th></tr>');

                    $.each(e, function (key, arr) {
                        var headerVal;

                        // Change Headers
                        if (key == 'booking') {
                            headerVal = 'Bookings'
                        }

                        if (key == 'roomsSold') {
                            headerVal = 'Rooms Sold'
                        }

                        if (key == 'avgStay') {
                            headerVal = 'Avg Stay'
                        }

                        if (key == 'roomNights') {
                            headerVal = 'Room Nights Per Day'
                        }

                        $summaryTable
                            .find('tbody')
                            .append('<tr class="' + key + '"><td>' + headerVal + '</td></tr>')

                        $.each(arr, function (index, obj) {
                            var value;

                            // Parse Number
                            if (key == 'avgStay') {
                                value = parseNum(obj.value, 2)
                            } else {
                                value = obj.value
                            }

                            var formattedDate;

                            if (obj.class == 'month') {
                                formattedDate = formatDate('month', new Date(obj.key))
                            }

                            if (obj.class == 'week') {
                                formattedDate = formatDate('week', new Date(obj.key))
                            }

                            if (obj.class == 'day') {
                                formattedDate = formatDate('day', new Date(obj.key))
                            }

                            $summaryTable
                                .find('.table-header-row')
                                .append('<th class="' + obj.class + ' text-black">' + formattedDate + '<br><small class="text-uppercase fs-xs fw-lgt">' + obj.class + '</small></th>')

                            $summaryTable
                                .find('.' + key)
                                .append('<td class="' + obj.class + '">' + value + '</td>')
                        });
                    });
                })
                // END SUMMARY TABLE

                // BEGIN MONTHLY CHART
                var monthlyChartElement = d3.select('#monthly-chart svg');
                var monthlyChart;


                nv.addGraph(function () {
                    monthlyChart = nv.models.discreteBarChart()
                        .margin({ top: 50, right: 25, bottom: 25, left: 25 })
                        .x(function (d) { return d.label })    //Specify the data accessors.
                        .y(function (d) { return d.value })
                        .showValues(true)       //...instead, show the bar value right on top of each bar.
                        .rotateLabels(0)
                        .showYAxis(false)
                        .duration(350)
                        .color(['#70BBDA'])
                        .valueFormat(d3.format(',.0d'));

                    // monthlyChart.yAxis
                    // .tickFormat(d3.format(',.0d'));

                    monthlyChartElement
                        .datum(monthlyChartData)
                        .call(monthlyChart);

                    nv.utils.windowResize(monthlyChart.update);

                    return monthlyChart;
                })
                // END MONTHLY CHART


                // BEGIN WEEKLY CHART
                var weeklyChartElement = d3.select('#weekly-chart svg');
                var weeklyChart;


                nv.addGraph(function () {
                    weeklyChart = nv.models.discreteBarChart()
                        .margin({ top: 50, right: 25, bottom: 25, left: 25 })
                        .x(function (d) { return Date.parse(d.label) })    //Specify the data accessors.
                        .y(function (d) { return d.value })
                        .showValues(true)       //...instead, show the bar value right on top of each bar.
                        .rotateLabels(0)
                        .showYAxis(false)
                        .duration(350)
                        .color(['#70BBDA'])
                        .valueFormat(d3.format(',.0d'));;

                    weeklyChart.xAxis
                        .tickFormat(function (d) {
                            return d3.time.format("%d %b'%y")(new Date(d))
                        });

                    weeklyChartElement
                        .datum(weeklyChartData)
                        .call(weeklyChart);

                    nv.utils.windowResize(weeklyChart.update);

                    return weeklyChart;
                })
                // END WEEKLY CHART


                // BEGIN DAILY CHART
                var dailyChartElement = d3.select('#daily-chart svg');
                var dailyChart;


                nv.addGraph(function () {
                    dailyChart = nv.models.discreteBarChart()
                        .margin({ top: 25, right: 25, bottom: 75, left: 25 })
                        .x(function (d) { return d.label })    //Specify the data accessors.
                        .y(function (d) { return d.value })
                        .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
                        .showValues(true)       //...instead, show the bar value right on top of each bar.
                        .rotateLabels(-45)
                        .showYAxis(false)
                        .duration(350)
                        .color(['#70BBDA'])
                        .valueFormat(d3.format(',.0d'));;

                    dailyChart.xAxis
                        .tickFormat(function (d) {
                            return d3.time.format("%d %b'%y")(new Date(d))
                        });


                    // dailyChart.yAxisTickFormat(d3.format(',.0d'));

                    // dailyChartElement
                    //     .datum(dailyChartData)
                    //     .call(dailyChart);

                    d3.select('#daily-chart svg').datum(eval("dailyChartData")).transition().duration(500).call(dailyChart);
                    d3.selectAll("#daily-chart svg .nv-bar")
                        .style("fill", function (d, i) {
                            console.log(d);
                            return Date.parse(d.label) > Date.parse(new Date()) ? "#e5a1a1" : "#70BBDA";
                        });

                    nv.utils.windowResize(dailyChart.update);

                    return dailyChart;
                })
                // END DAILY CHART

                // BEGIN SOURCE AREA
                nv.addGraph(function () {
                    var chart = nv.models.stackedAreaChart()
                        .margin({ top: 0, right: 25, bottom: 25, left: 25 })
                        .useInteractiveGuideline(true)
                        .x(function (d) { return d[0] })
                        .y(function (d) { return d[1] })
                        .controlLabels({ stacked: "Stacked" })
                        .color(['#70BBDA', '#F11351', '#4A7F91', '#95546C'])
                        .showYAxis(false)
                        .duration(300);

                    chart.xAxis.tickFormat(function (d) { return d3.time.format("%d %b'%y")(new Date(d)) });
                    chart.yAxis.tickFormat(d3.format(',.4f'));

                    chart.style('expand');

                    chart.legend.vers('furious');

                    d3.select('#source-area svg')
                        .datum(sourceData)
                        .transition().duration(1000)
                        .call(chart)
                        .each('start', function () {
                            setTimeout(function () {
                                d3.selectAll('#source-area svg *').each(function () {
                                    if (this.__transition__)
                                        this.__transition__.duration = 1;
                                })
                            }, 0)
                        });

                    nv.utils.windowResize(chart.update);
                    return chart;
                });

                // END SOURCE AREA

                // // BEGIN LINE
                nv.addGraph(function () {
                    var chart = nv.models.lineChart()
                        .margin({ top: 0, right: 25, bottom: 25, left: 25 })
                        .x(function (d) { return d[0] })
                        .y(function (d) { return d[1] })
                        .showYAxis(false)
                        .useInteractiveGuideline(true)
                    // .valueFormat(d3.format(',.0d'));

                    chart.xAxis
                        .tickFormat(function (d) {
                            return d3.time.format("%d %b'%y")(new Date(d))
                        });

                    chart.yAxis
                        .tickFormat(d3.format(',.2f'));

                    d3.select('#source-line svg')
                        .datum(sourceData)
                        .call(chart);

                    nv.utils.windowResize(chart.update);

                    return chart;
                });
                // // END LINE


            },
            error: function (res) {
                console.log(res);
            }
        })
    }
})
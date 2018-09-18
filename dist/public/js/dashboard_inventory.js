$(function () {
    var hotelUuid = $('#hotel-uuid').val();
    var metric = $('#metric-toggle').val();

    var url = '/dashboard/manager/inventory?hotel_uuid=' + hotelUuid + '&metric=' + metric;

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
        var url = '/dashboard/manager/inventory?hotel_uuid=' + hotelUuid + '&metric=' + metric;

        updateData(url);
    })

    function updateData(url) {
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            cache: false,
            success: function (res) {

                console.log(res);

                // OVERALL DATA VARIABLES
                var overallRoomNights = res.data.overallStats.totalRoomNights;
                var overallRoomsSold = res.data.overallStats.totalRoomsSold;
                var overallAvailableRooms = res.data.overallStats.availableRooms;
                var overallOccupancy = res.data.overallStats.occupancy;

                // SUMMARY TABLE DATA VARIABLE
                var summaryTable = res.data.summary;

                // CHART DATA VARIABLES
                var monthlyChartData = res.data.trends.monthly;
                var weeklyChartData = res.data.trends.weekly;
                var dailyChartData = res.data.trends.daily;
                var sourceData = res.data.source;

                // ELEMENTS FOR OVERALL STATS
                var $overallRoomNights = $('.overall-room-nights-container');
                var $overallRoomsSold = $('.overall-rooms-sold-container');
                var $overallAvailableRooms = $('.overall-available-rooms-container');
                var $overallOccupancy = $('.overall-occupancy-container');

                // ELEMENTS FOR SUMMARY TABLE
                var $summaryTable = $('.summary-table');

                // BEGIN OVERALL BOOKINGS
                $overallRoomNights
                    .find('.overall-room-nights')
                    .html(overallRoomNights);
                // END OVERALL BOOKINGS


                // BEGIN OVERALL ROOMS SOLD
                $overallRoomsSold
                    .find('.overall-rooms-sold')
                    .html(overallRoomsSold);
                // END OVERALL ROOMS SOLD


                // BEGIN AVG STAY
                $overallAvailableRooms
                    .find('.overall-available-rooms')
                    .html(overallAvailableRooms);
                // END AVG STAY

                // BEGIN ROOM NIGHTS
                $overallOccupancy
                    .find('.overall-occupancy')
                    .html(parseNum(overallOccupancy * 100, 2) + ' %');
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
                        if (key == 'roomNights') {
                            headerVal = 'Room Nights'
                        }

                        if (key == 'roomsSold') {
                            headerVal = 'Rooms Sold'
                        }

                        if (key == 'availableRooms') {
                            headerVal = 'Available Rooms'
                        }

                        if (key == 'occupancy') {
                            headerVal = 'Occupancy'
                        }

                        $summaryTable
                            .find('tbody')
                            .append('<tr class="' + key + '"><td>' + headerVal + '</td></tr>')

                        $.each(arr, function (index, obj) {
                            var value;

                            // Parse Number
                            if (key == 'occupancy') {
                                value = parseNum(obj.value * 100, 2) + ' %'
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

                    dailyChartElement
                        .datum(dailyChartData)
                        .call(dailyChart);

                    nv.utils.windowResize(dailyChart.update);

                    return dailyChart;
                })
                // END DAILY CHART
            },
            error: function (res) {
                console.log(res);
            }
        })
    }
})
$(function () {
    var hotelUuid = $('#hotel-uuid').val();
    var start = moment().subtract(7, 'days');
    var end = moment();

    // Date Range
    function cb(start, end) {
        $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    }

    $('#reportrange').daterangepicker({
        startDate: start,
        endDate: end,
        maxDate: end.clone().add(3, 'months'),
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);

    cb(start, end);



    // Update data for the dashboard
   // var startDate = moment().subtract(7, 'days').format('DD-MM-YYYY');
   // var endDate = moment().subtract(1, 'days').format('DD-MM-YYYY');
   var startDate = start.format('DD-MM-YYYY');
   var endDate = end.format('DD-MM-YYYY');

    var url = '/dashboard/manager/overview?hotel_uuid=' + hotelUuid + '&start_date=' + startDate + '&end_date=' + endDate


    function updateData(url) {
        $.ajax({
            url: url,
            method: 'GET',
            cache: false,
            success: function (res) {
                var metricStats = res.data.metricStats;
                var roomTypeStats = res.data.roomTypeStats;
                var sourceStats = res.data.sourceStats;

                var element_realized = "#rooms-realized svg";
                var data_realized = roomTypeStats.roomsRealized;

                var element_occupancy = "#rooms-occupancy svg";
                var data_occupancy = roomTypeStats.roomsOccupancy;

                var $totalRoomNights = $('.total-room-nights');
                var $totalRoomsSold = $('.total-rooms-sold');
                var $occupancy = $('.occupancy');
                var $totalRevenue = $('.total-revenue');
                var $adr = $('.adr');
                var $revPar = $('.rev-par');
                var currencyHTML = "";
                //var currencyHTML = '<small class="text-uppercase fs-sm text-black">' + metricStats.currency + '</small>';
                

                draw_roomsRealized(element_realized, data_realized);
                draw_roomsOccupancy(element_occupancy, data_occupancy);

                if(metricStats === undefined) {
                    metricStats = {
                        "totalRoomNights": 'No Data',
                        "roomsSold": 'No Data',
                        "occupancy": 'No Data',
                        "totalRevenue": 'No Data',
                        "adr": 'No Data',
                        "revpar": 'No Data',
                        "currency": ''
                    }
                }

                $totalRoomNights.html(metricStats.totalRoomNights);
                $totalRoomsSold.html(metricStats.roomsSold);
                $occupancy.html(parseFloat((metricStats.occupancy).toString()).toFixed(2) + '%');
                $totalRevenue.html(parseFloat((metricStats.totalRevenue).toString()).toFixed(2) + ' ' + currencyHTML);
                $adr.html(parseFloat((metricStats.adr).toString()).toFixed(2) + ' ' + currencyHTML);
                $revPar.html(parseFloat((metricStats.revpar).toString()).toFixed(2) + ' ' + currencyHTML);

                // $sourceStatsWalkIn.find('.source-name').html(element.source);
                // $sourceStatsWalkIn.find('.source-revenue').html(element.totalAmount);
                // $sourceStatsWalkIn.find('.source-rooms-sold').html(element.roomsSold);
                // $sourceStatsWalkIn.find('.source-adr').html(element.adr);


                $.each(res.data.bookingSource, function (index, element) {
                    $('.source-stats').append('<div class="col-md-4">' +
                        '<div class="source-stats-container">' +
                        '<div class="source-name-container">' +
                        '<p class="source-name">' + element.source + '</p>' +
                        '</div>' +
                        '<div class="source-content-container">' +
                        '<div class="source-revenue-container">' +
                        '<h1 class="fw-thk text-black">' + parseFloat(element.totalAmount).toFixed(2) + ' <small class="text-uppercase fs-sm text-black">' + metricStats.currency + '</small> ' + '</h1>' +
                        '<small class="text-uppercase">Revenue earned</small>' +
                        '</div>' +
                        '<div class="row m-sm-b">' +
                        '<div class="col-md-6 text-left">' +
                        '<small class="text-uppercase">Rooms Sold</small>' +
                        '</div>' +
                        '<div class="col-md-6 text-right">' +
                        '<h4 class="m-n fw-semi-thk text-black">' + parseFloat(element.roomsSold).toFixed(0) + '</h4>' +
                        '</div>' +
                        '</div>' +
                        '<div class="row">' +
                        '<div class="col-md-6 text-left">' +
                        '<small class="text-uppercase">ADR</small>' +
                        '</div>' +
                        '<div class="col-md-6 text-right">' +
                        '<h4 class="m-n fw-semi-thk text-black">' + parseFloat(element.adr).toFixed(2) + ' <small class="text-uppercase fs-sm text-black">' + metricStats.currency + '</small> </h4>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>');
                })
            },
            error: function (result) {
                console.log(result);
            }
        });
    }



    updateData(url);

    function draw_roomsRealized(element, data) {
        var roomsRealizedElement = d3.select(element)
        var roomsRealizedChart;

        nv.addGraph(function () {
            roomsRealizedChart = nv.models.multiBarChart()
                .margin({ top: 50, right: 25, bottom: 25, left: 40 })
                .duration(350)
                .reduceXTicks(true)   //If 'false', every single x-axis tick label will be rendered.
                // .staggerLabels(true)
                // .showValues(true)
                // .showYAxis(false)
                .rotateLabels(0)      //Angle to rotate x-axis labels.
                .showControls(false)   //Allow user to switch between 'Grouped' and 'Stacked' mode.
                .groupSpacing(0.1)    //Distance between each group of bars.
                .color(['#FE5F55', '#628395']);



            roomsRealizedElement
                .datum(data)
                .call(roomsRealizedChart);

            nv.utils.windowResize(roomsRealizedChart.update);

            return roomsRealizedChart;
        })
    }




    function draw_roomsOccupancy(element, data) {
        var roomsOccupancyElement = d3.select(element);
        var roomsOccupancyChart;


        nv.addGraph(function () {
            roomsOccupancyChart = nv.models.discreteBarChart()
                .margin({ top: 50, right: 25, bottom: 25, left: 25 })
                .x(function (d) { return d.label })    //Specify the data accessors.
                .y(function (d) { return d.value * 100 })
                .showYAxis(false)
                // .staggerLabels(true)    //Too many bars and not enough room? Try staggering labels.
                .showValues(true)       //...instead, show the bar value right on top of each bar.
                .rotateLabels(0)
                .duration(350);

            roomsOccupancyElement
                .datum(data)
                .call(roomsOccupancyChart);

            nv.utils.windowResize(roomsOccupancyChart.update);

            return roomsOccupancyChart;
        })
    }


    $('#reportrange').on('apply.daterangepicker', function (ev, picker) {
        var startDate = picker.startDate.format('DD-MM-YYYY')
        var endDate = picker.endDate.format('DD-MM-YYYY')

        var url = '/dashboard/manager/overview?hotel_uuid=' + hotelUuid + '&start_date=' + startDate + '&end_date=' + endDate;

        $('.source-stats').html('');

        updateData(url);
    });
})
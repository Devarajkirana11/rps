var HotelNida = angular.module('HotelNIDA', ['ngSanitize']);
HotelNida.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});
HotelNida.factory('NidaFactory', ['$http', '$rootScope', function ($http, $rootScope) {
    var nidafactory = {
        ajaxcall: function (method, url, data) {
            data = (data == null ? JSON.stringify({}) : JSON.stringify(data));
            $rootScope.loading = true;
            return new Promise(function (resolve, reject) {
                $http({
                    method: method,
                    url: url,
                    data: data,
                    headers: { 'Content-Type': 'application/json' },
                }).then(function (result) {
                    resolve(result);
                }, function (data) {
                    reject(data);
                }).finally(function () {
                    $rootScope.loading = false;
                });
            });
        }
    }
    return nidafactory;
}]);

HotelNida.filter('removeSpaces', [function () {
    return function (string) {
        if (!angular.isString(string)) {
            return string;
        }
        return string.replace(/[^a-zA-Z0-9]/g, '');
    };
}]);


HotelNida.controller('NIDAController', ['$scope', '$http', '$filter', '$rootScope', 'NidaFactory', '$sce', '$compile', function ($scope, $http, $filter, $rootScope, NidaFactory, $sce) {
    var optionsArray = new Array();
    $scope.pagedata = {};
    $rootScope.sessionexits = 0;
    $scope.searchdata = {};
    $scope.baseURL = '/';
    //$scope.guestsData={adults:["1"],kids:["0"]}; required in future.
    $scope.searchdata.totalAdults = 1;
    $scope.searchdata.totalkids = 0;
    $scope.searchdata.totalRooms = 1;
    $scope.searchdata.guests = Number($scope.searchdata.totalAdults) + Number($scope.searchdata.totalkids) + " Guest(s), " + $scope.searchdata.totalRooms + " Room(s) ";
    $scope.validation_msg = "";
    $scope.setResult = 0;
    $scope.rates = {};
    $scope.blog = new Array();
    $scope.pageMode = 'create';
    $scope.hotelError = '';

    $('#location-dropdown').select2({ placeholder: "location" });

    /* init action as soon as home page loads */
    $scope.init = function (mode) {
        $scope.pageMode = mode;
        NidaFactory
            .ajaxcall('GET', $scope.baseURL + 'hotel_manager/getAllHotelsToFrontend', null)
            .then(result => {
                $('body').addClass('loaded');
                if (result.data.success) {
                    result.data.data.forEach(hotel => {
                        var option = {};
                        option['country'] = hotel._country_id + ', ' + hotel._city_id;
                        option['locality'] = hotel._nida_stay_name;
                        option['hotel_id'] = hotel._hotel_id;
                        option['countryID'] = hotel.countryID;
                        optionsArray.push(option);
                    })
                    $scope.pagedata.localities = optionsArray;
                    if (mode == 'edit') {
                        var query = $scope.getQueryParams(document.location.search);
                        //console.log('hotel_id in global param',hotel_id)
                        var place = (query.place === undefined ? hotel_id : query.place);
                        optionsArray.forEach((option, index) => {
                            if (option.hotel_id == place) {
                                $scope.searchdata.place = optionsArray[index];
                                $scope.searchdata.countryID = optionsArray[index]['countryID'];

                            }
                        })
                    } else {
                        $scope.searchdata.place = optionsArray[1];
                        $scope.searchdata.countryID = optionsArray[1]['countryID'];
                    }
                    $scope.setDateRangeDyanmically('load');
                    $scope.$apply();
                } else {
                    console.log(result.data.message);
                }
            })
            .catch(err => {
                console.log(err);
            })
        if(typeof country_page_id == 'undefined') {
            $scope.blogfun();
        }
    };
    $scope.search = function () {
        if ($scope.searchdata.place === undefined) {
            $scope.validation_msg = 'Please select your location';
        } else if ($scope.searchdata.check_in === undefined) {
            $scope.validation_msg = 'Please choose your check in date';
        } else if ($scope.searchdata.check_out === undefined) {
            $scope.validation_msg = 'Please choose your check out date';
        } else if ($scope.searchdata.totalAdults === 0) {
            $scope.validation_msg = 'Please choose no of guests';
        } else {
            url = Object.keys($scope.searchdata).map(function (k) {
                if (k == "place") {
                    return encodeURIComponent(k) + '=' + encodeURIComponent($scope.searchdata[k]['hotel_id']);

                } else if (k == 'countryID') {
                    $scope.pagedata.localities.forEach((option, index) => {
                        if (option.hotel_id == $scope.searchdata['place']['hotel_id']) {
                            $scope.searchdata.countryID = optionsArray[index]['countryID'];
                        }
                    });
                    return encodeURIComponent(k) + '=' + encodeURIComponent($scope.searchdata[k]);
                }

                return encodeURIComponent(k) + '=' + encodeURIComponent($scope.searchdata[k]);
            }).join('&');
            window.location.href = '/search/details?' + url;
        }
    }
    /**
     * fetching details and mapping to dom in search details page.
     */
    $scope.search_details = function () {
        var query = $scope.getQueryParams(document.location.search);
        query.place = (query.place === undefined ? hotel_id : query.place);
        $scope.searchdata.check_in = (query.check_in !== undefined ? query.check_in : moment(new Date()).format("YYYY-MM-DD"));
        $scope.searchdata.check_out = (query.check_out !== undefined ? query.check_out : moment(new Date()).add(1, 'days').format("YYYY-MM-DD"));//moment(query.check_out).format("DD-MM-YYYY");
        $scope.searchdata.noOfNights = moment($scope.searchdata.check_out, "YYYY-MM-DD").diff(moment($scope.searchdata.check_in, "YYYY-MM-DD"), 'days');
        //console.log($scope.searchdata.noOfNights)
        $scope.searchdata.guests = (query.guests !== undefined ? query.guests : '1 Guest(s), 1 Room(s)');
        $scope.searchdata.totalAdults = (query.totalAdults !== undefined ? Number(query.totalAdults) : 1);
        $scope.searchdata.totalkids = (query.totalkids !== undefined ? Number(query.totalkids) : 0);
        $scope.searchdata.totalRooms = (query.totalRooms !== undefined ? Number(query.totalRooms) : 1);
        $scope.searchdata.totalPriceWithoutTax = 0;
        $scope.searchdata.totalPriceWithTax = 0;
        $scope.searchdata.totalTax = 0;
        $scope.searchdata.totalWithService = 0;
        $scope.searchdata.ServiceFee = 0;
        $scope.searchdata.totalPriceWithServiceCharge = 0;
        $scope.details = {};
        $scope.fids = new Array();
        $scope.RoomTypesimages = new Array();
        $scope.totalRoomsAdded = 0;
        $scope.searchdata.nationality = 'select';
        $scope.searchdata.mobileno_stdcode = 'select';
        $scope.searchdata.salutation = 'Mr.';
        $scope.ForeignNationality = false;
        $scope.searchdata.tourismTax = 0;
        $scope.pay_process = false;
        $scope.searchdata.roomTypesSelected = new Array();
        $scope.searchdata.paynow = false;
        $scope.searchdata.payathotel = false;
        $scope.searchdata.currencyCode = 'MYR';
        $scope.hotel_address = '';
        $scope.details.master_hotel_amenities = {};
        $scope.details.master_room_amenities = {};
        $scope.details.hotel_amenities = new Array();
        $scope.details.landmarks = new Object();
        $scope.details.conversionRates = new Array();
        $scope.searchdata.flexiAvailable = (query.flexiAvailable !== undefined ? (query.flexiAvailable == 'true' ? true : false) : false);
        $scope.searchdata.flexiMarkup = (query.flexiMarkup !== undefined ? Number(query.flexiMarkup) : 0);
        $scope.searchdata.flexiEnabled = (query.flexiEnabled !== undefined ? (query.flexiEnabled == 'true' ? true : false) : false);
        $scope.searchdata.flexiAmount = 0
        $scope.searchdata.totalPriceWithFlexi = 0;
        $scope.globalServiceFeeMarkup = 0;
        $scope.glboalTaxMarkup = 0;
        $scope.searchdata.flexiAvailableTypes = new Array();
        $scope.flexiMessage = "";
        $scope.details.flexiBox = false;
        $scope.searchdata.roomTypeFlexiAvailabilityCount = 0;
        $scope.details.essentials = new Object();
        $scope.details.hotel_checks = new Object();
        $scope.searchdata.PassAvailable = false;
        $scope.blogTags = new Array();
        $scope.searchdata.deposit_amount = 0;


        if (query.countryID !== undefined) {
            $scope.searchdata.countryID = query.countryID;
        }
        if (Number($scope.totalRoomsAdded) == 0)
            $scope.button = "Select Your Room(s)";
        $scope.button_summary = "Select Your Room(s)";

        $(document).on('click', '.map-expand-button', function () {
            $(this).parent().toggleClass('map-expanded');
            setTimeout(function () {
                $scope.initMap();
                $scope.geocodeLatLng($scope.details.Lat, $scope.details.Lng);
            }, 300)
        })

        if (query.roomTypesSelected !== undefined) { // on booking page...
            var selectedtypesArray = query.roomTypesSelected.split(',');
            if (selectedtypesArray.constructor === Array) {
                selectedtypesArray.forEach(type => {
                    $scope.searchdata.roomTypesSelected.push(type);
                })
            }
        }

        //call to get hotel master amenities
        NidaFactory
            .ajaxcall('GET', $scope.baseURL + 'hotel_amenities.json', {})
            .then(result => {
                if (result.data) {
                    $scope.details.master_hotel_amenities = result.data.Hotels;
                }
            })
            .catch(err => {
                console.log(err);
            })
        // call to get room master amenities
        NidaFactory
            .ajaxcall('GET', $scope.baseURL + 'room_amenities.json', {})
            .then(result => {
                if (result.data) {
                    $scope.details.master_room_amenities = result.data.rooms;
                }
            })
            .catch(err => {
                console.log(err);
            })

        // call to get room types and there details..
        NidaFactory
            .ajaxcall('GET', $scope.baseURL + 'room_manager/getRoomTypesByHotel?hotel_id=' + query.place, null)
            .then(result => {
                if (!$('body').hasClass('loaded')) {
                    $('body').addClass('loaded');
                }
                $('#sub-loader-wrapper').addClass('loaded');
                if (result.data.success) {
                    var randNumber = Math.random().toString(36).substring(7);
                    var data = result.data.data;
                    $scope.details.hotel_name = data.hotel._nida_stay_name;
                    $scope.details.hotel_name_with_place = data.hotel._nida_stay_name + ", " + data.hotel._city_id;
                    $scope.details.hotel_city = data.hotel._city_id;
                    $scope.details.hotel_country = data.hotel._country_id;
                    $scope.details.hotel_address = data.hotel._address_line1 + ", " + data.hotel._city_id + "," + data.hotel._country_id;
                    $scope.details.room_types = data.rooms;
                    $scope.details.Lat = Number(data.hotel._latitude);
                    $scope.details.Lng = Number(data.hotel._longitude);
                    $scope.searchdata.hotel_id = data.hotel._hotel_id;
                    $scope.details.hotel_description = (data.hotel._description !== undefined ? data.hotel._description : '');
                    $scope.details.custom_rating_image = (data.hotel._custom_rating_image !== undefined ? data.hotel._custom_rating_image+'?v='+randNumber : '');
                    $scope.details.custom_rating_link = (data.hotel._custom_rating_link !== undefined ? data.hotel._custom_rating_link : '');
                    $scope.searchdata.deposit_amount = (data.hotel._deposit_amount !== undefined ? data.hotel._deposit_amount : 0);
                    //$scope.details.hotel_rating_snippet = (data.hotel._rating_snippet!== undefined? {html_code: data.hotel._rating_snippet }:{});
                    $scope.details.room_types.forEach((roomType, index) => {
                        if (query.roomTypesSelected === undefined || query.roomTypesSelected == "") {
                            roomType.RoomsReq = 0;
                        } else {
                            if (roomType.RoomsReq === undefined) {
                                roomType.RoomsReq = 0;
                            }
                            $scope.searchdata.roomTypesSelected.forEach(selectedtype => {
                                if (query['roomtype_' + selectedtype] !== undefined && selectedtype == roomType.room_type_id) {
                                    roomType.RoomsReq = Number(query['roomtype_' + selectedtype]); // manually inject room required for booking page
                                    $scope.totalRoomsAdded += roomType.RoomsReq;
                                }
                            })
                        }
                        roomType.totalRoomPrice = 0;
                        roomType._image_fids.forEach(fid => {
                            $scope.fids.push(fid);
                        })
                        if (data.amenities !== undefined) {
                            if (data.amenities !== null) {
                                if (data.amenities[index] !== undefined) {
                                    roomType.amenities = $scope.mapAmenities(data.amenities[index], $scope.details.master_room_amenities);
                                }
                            }
                        }
                    })
                    if (data.hotel._image_fids !== undefined) {
                        if (data.hotel._image_fids !== null) {
                            data.hotel._image_fids.forEach((fid, index) => {
                                if (index == 0) {
                                    $scope.default_hotel_image_fid = fid;
                                }
                                $scope.fids.push(fid);
                            })
                        }
                    }
                    
                    $scope.setResult = 1;
                    // hotel based blog content..
                    if($scope.details.hotel_city) {
                        $scope.getBlogTagId($scope.details.hotel_city.replace(/\s+/g, '-').toLowerCase());
                    }
                    // call to check if flexi is available.
                    //$scope.flexiCheck();


                    NidaFactory
                        .ajaxcall('get', $scope.baseURL + 'hotel_manager/' + $scope.searchdata.hotel_id + '/findContactDetailsByHid', {})
                        .then(result => {
                            if (result.data.success) {
                                if (result.data.data._FrontDeskContactDetails !== undefined) {
                                    var phone_no = result.data.data._FrontDeskContactDetails;
                                    $scope.details.hotel_contact_number = '+' + phone_no[0]['_landline_stdcode'] + ' ' + phone_no[0]['_landline_number'];
                                }
                            }
                        })
                        .catch(err => {
                            console.log(err)
                        })
                    // get the availability and rates... at once.
                    var availability_request_params = { check_in: moment($scope.searchdata.check_in).format("DD-MM-YYYY"), check_out: moment($scope.searchdata.check_out).format("DD-MM-YYYY") };
                    NidaFactory
                        .ajaxcall('POST', $scope.baseURL + 'hotels-manager/manager/rates/sell/web?hotel_uuid=' + $scope.searchdata.hotel_id, availability_request_params)
                        .then(result => {
                            if (result.data.success) {
                                result.data.data.rooms.forEach(rate => {
                                    $scope.details.room_types.forEach((roomType, index) => {
                                        if (roomType.room_type_id == rate.type) {
                                            $scope.details.room_types[index]['rate'] = rate;
                                            $scope.details.room_types[index]['tourismTax'] = result.data.data.tourismTax;
                                            $scope.details.room_types[index]['serviceFee'] = $scope.globalServiceFeeMarkup = result.data.data.serviceFee;
                                            $scope.details.room_types[index]['tax'] = $scope.glboalTaxMarkup = result.data.data.tax;

                                            /*if($scope.searchdata.countryID !== undefined ) {
                                                if(Number($scope.searchdata.countryID) == 217) { //thailand temp fix
                                                     $scope.details.room_types[index]['tax'] = 7
                                                } else {
                                                    $scope.details.room_types[index]['tax'] = result.data.data.tax;
                                                }
                                            } else {
                                                $scope.details.room_types[index]['tax'] = result.data.data.tax;
                                            }*/
                                        }
                                    })
                                });
                                if (query.roomTypesSelected !== undefined && query.roomTypesSelected != "") {
                                    $scope.searchdata.roomTypesSelected.forEach(selectedtype => {
                                        if (query['roomtype_' + selectedtype] !== undefined) {
                                            $scope.details.room_types.forEach((roomType, index) => {
                                                if (roomType.room_type_id == selectedtype && roomType.RoomsReq != 0) {
                                                    $scope.caculateIndividualPrice(index); // calculate individual price
                                                }
                                            })
                                        }
                                    })

                                    /* all methods should be in sequence, because we are updating based on global scope*/
                                    $scope.calculateTotalPrice(); // call totalprice.
                                    $scope.addServiceFee(result.data.data.serviceFee);
                                    $scope.calculateTax(result.data.data.tax);

                                    /*if($scope.searchdata.countryID !== undefined ) {
                                        if(Number($scope.searchdata.countryID) == 217) { //thailand temp fix
                                             $scope.calculateTax(7);
                                        } else {
                                           $scope.calculateTax(result.data.data.tax);
                                        }
                                    } else {
                                    }*/


                                }
                                $scope.$apply();
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        })
                    // get currency code based on hotel_id
                    NidaFactory
                        .ajaxcall('GET', $scope.baseURL + 'search/get-currency?hotel_id=' + $scope.searchdata.hotel_id, null)
                        .then(result => {
                            if (result.data.success) {
                                $scope.searchdata.currencyCode = result.data.currency;
                            }
                            $scope.$apply();
                        })
                        .catch(err => {
                            console.log(err);
                        })
                    // load the map
                    if ($('#map').length) {
                        $scope.initMap();
                        $scope.geocodeLatLng(Number(data.hotel._latitude), Number(data.hotel._longitude));
                    }
                    var Image_files = { params: { files: $scope.fids } };
                    // call to get images
                    NidaFactory
                        .ajaxcall('POST', $scope.baseURL + 'file/get?type=all', Image_files)
                        .then(result => {
                            if (result.data.success) {
                                $scope.RoomTypesimages = result.data.links;
                                $scope.details.room_types.forEach(roomType => {
                                    roomType._image_links = [];
                                    roomType._image_fids.forEach(fid => {
                                        result.data.fids.forEach((resfid, index) => {
                                            if (resfid == fid) {
                                                roomType._image_links.push(result.data.links[index]);
                                            } else if ($scope.default_hotel_image_fid == resfid) {
                                                $scope.default_hotel_image_link = result.data.links[index]['_large'];
                                            }
                                        })
                                    })
                                    $scope.$apply();
                                    $('.bxslider').bxSlider({
                                        nextText: '',
                                        prevText: ''
                                    });

                                })
                            }
                        })
                        .catch(err => {
                            console.log(err);
                        })

                    // call to get hotel db amenties
                    NidaFactory
                        .ajaxcall('GET', $scope.baseURL + 'facilities_services_manager/' + $scope.searchdata.hotel_id + '/findFacilitiesAndServicesByHid', {})
                        .then(result => {
                            if (result.data.success) {
                                //console.log('facilities and services',result.data.data)
                                if (result.data.data._hotel_checks) {
                                    $scope.details.hotel_checks = result.data.data._hotel_checks;
                                    //delete(result.data.data._hotel_checks);
                                }
                                var hotel_amenities_arr = $scope.mapAmenities(result.data.data, $scope.details.master_hotel_amenities);
                                var size = 6;
                                $scope.details.hotel_amenities = new Array();
                                while (hotel_amenities_arr.length > 0) {
                                    var amenityArr = hotel_amenities_arr.splice(0, size)
                                    if (amenityArr.length > 0) {
                                        $scope.details.hotel_amenities.push(amenityArr);
                                    }
                                }
                                //console.log('hotel amenities ',$scope.details.hotel_amenities)
                                setTimeout(function () {
                                    owl.owlCarousel('destroy');
                                    owl.owlCarousel({
                                        loop: true,
                                        margin: 10,
                                        nav: false,
                                        items: 1,
                                    });
                                    owl.owlCarousel( 'remove', $scope.details.hotel_amenities.length );
                                }, 100);

                                $scope.$apply();
                            }

                        })
                        .catch(err => {
                            console.log(err);
                        });

                    // call to get Hotel Landmarks
                    NidaFactory
                        .ajaxcall('GET', $scope.baseURL + 'search/' + $scope.searchdata.hotel_id + '/getLandmarks', {})
                        .then(result => {
                            if (result.data.success) {
                                $scope.details.landmarks = result.data.landmarks
                                $scope.slickCarousel();
                            }
                            $scope.$apply();
                        })
                        .catch(err => {
                            console.log(err);
                        });
                    // call to get Hotel Essentials
                    NidaFactory
                        .ajaxcall('GET', $scope.baseURL + 'search/' + $scope.searchdata.hotel_id + '/getEssentials', {})
                        .then(result => {
                            if (result.data.success) {
                                $scope.details.essentials = result.data.landmarks
                            }
                            $scope.$apply();
                        })
                        .catch(err => {
                            console.log(err);
                        });

                } else {
                    $scope.setResult = 2;
                }
                $scope.$apply();
            })
            .catch(err => {
                $scope.setResult = 3;
                $scope.hotelError = err.message;
                $scope.$apply();
                console.log(err);
            });

    }
    $scope.nationalityChange = function (nationality) {
        console.log('nationality',nationality)
        if ($scope.searchdata.countryID !== undefined) {
            if ($scope.searchdata.countryID != '217') { //dont allow any trourism tax for thailand hotels.
                // onchange of nationality add tourism tax
                //console.log('nationality change detected'+$scope.searchdata.nationality)
                if (nationality != 132 && nationality != 217 && nationality != "select" && $scope.ForeignNationality === false && $scope.searchdata.PassAvailable === false) {
                    $scope.details.room_types.forEach((roomType, index) => { //add tourismTax if they are foreigner = 3 rooms x tourismTax(RM 50) = RM 150
                        $scope.addTourismTax(roomType, 'add');
                    });
                    $scope.ForeignNationality = true;
                } else if (($scope.ForeignNationality === true && nationality == 132) || ($scope.ForeignNationality === true && nationality == 217) || ($scope.ForeignNationality === true && nationality == "select") || ($scope.ForeignNationality === true && $scope.searchdata.PassAvailable)) {
                    $scope.details.room_types.forEach((roomType, index) => { //add tourismTax if they are foreigner = 3 rooms x tourismTax(RM 50) = RM 150
                        $scope.addTourismTax(roomType, 'sub');
                    });
                    $scope.ForeignNationality = false;
                }
            }
        }
    }
    $scope.roomCount = function (type, room_type, room_type_index) {
        if (type == 'inc') {
            if ($scope.totalRoomsAdded < $scope.searchdata.totalRooms && Number($scope.details.room_types[room_type_index]['rate']['totalCost']) > 0) {
                if ($scope.details.room_types[room_type_index]['RoomsReq'] < $scope.details.room_types[room_type_index]['rate']['availability']) {
                    $scope.details.room_types[room_type_index]['RoomsReq'] = Number(Number(room_type.RoomsReq) + 1);
                    $scope.totalRoomsAdded++;
                } else {
                    $scope.details.room_types[room_type_index]['availabilityMessage'] = 'Only ' + $scope.details.room_types[room_type_index]['rate']['availability'] + ' room(s) Available';
                }
            }
        } else {
            if (room_type.RoomsReq != 0) {
                $scope.details.room_types[room_type_index]['RoomsReq'] = Number(Number(room_type.RoomsReq) - 1);
                $scope.totalRoomsAdded--;
            }
        }
        if (Number($scope.totalRoomsAdded) == $scope.searchdata.totalRooms)
            $scope.button = "Proceed";
        else if (Number($scope.totalRoomsAdded) < $scope.searchdata.totalRooms)
            $scope.button = "Select Your Room(s)";

        if (Number($scope.totalRoomsAdded) == $scope.searchdata.totalRooms)
            $scope.button_summary = "Book Now";
        else if (Number($scope.totalRoomsAdded) < $scope.searchdata.totalRooms)
            $scope.button_summary = "Select Your Room(s)";

        $scope.caculateIndividualPrice(room_type_index);
        // console.log('individual room price' +$scope.details.room_types[room_type_index]['totalRoomPrice']);
        // caculate total hotel price.
        $scope.calculateTotalPrice();
        $scope.addServiceFee(room_type.serviceFee);
        $scope.calculateTax(room_type.tax);
        //$scope.FlexiProcess(true,false);

    }

    $scope.caculateIndividualPrice = function (room_type_index) {
        // caculate Individual room type cost based on count
        //console.log('room required '+$scope.details.room_types[room_type_index]['RoomsReq'])
        $scope.details.room_types[room_type_index]['totalRoomPrice'] = parseFloat(Number($scope.details.room_types[room_type_index]['RoomsReq']) * parseFloat($scope.details.room_types[room_type_index]['rate']['totalCost']).toFixed(2)).toFixed(2);

    }
    $scope.calculateTotalPrice = function () {
        $scope.searchdata.totalPriceWithoutTax = 0;
        $scope.details.room_types.forEach(roomType => {
            $scope.searchdata.totalPriceWithoutTax += Number(roomType.totalRoomPrice);
        })
        $scope.searchdata.totalPriceWithoutTax = parseFloat($scope.searchdata.totalPriceWithoutTax).toFixed(2);
        $scope.getCalculateComm();
        $scope.searchdata.roomTypesSelected = new Array();
        $scope.details.room_types.forEach(roomType => {
            if (Number(roomType.RoomsReq) != 0) {
                $scope.searchdata.roomTypesSelected.push(roomType.room_type_id);
            }
        })
        //console.log('total room price '+$scope.searchdata.totalPriceWithoutTax) 
    }
    $scope.addServiceFee = function (serviceFee) {
        //console.log('service fee '+serviceFee)
        // now statically adding the service of 10% on total room price..
        if (Number($scope.searchdata.totalPriceWithoutTax) != 0) {
            var amountToAddWithService = 0;
            if ($scope.searchdata.flexiAmount == 0) {
                amountToAddWithService = $scope.searchdata.totalPriceWithoutTax;
            } else {
                amountToAddWithService = Number($scope.searchdata.totalPriceWithoutTax) + Number($scope.searchdata.flexiAmount);
            }
            var service = (Number(serviceFee) == 0 ? 0 : Number(eval((serviceFee * Number(amountToAddWithService)) / 100)));
            $scope.searchdata.totalWithService = parseFloat(Number(amountToAddWithService) + service);
            $scope.searchdata.ServiceFee = Number(service);
        } else {
            $scope.searchdata.totalWithService = 0;
            $scope.searchdata.ServiceFee = 0
        }
        //console.log('total with service'+$scope.searchdata.totalWithService)
    }
    $scope.calculateTax = function (tax) {
        if (Number($scope.searchdata.totalWithService) != 0) {
            $scope.searchdata.totalTax = Number(eval((Number($scope.searchdata.totalWithService) / 100) * Number(tax)).toFixed(2)); // get total tax amount
            //$scope.searchdata.totalTaxWithService += Number(parseFloat($scope.searchdata.totalTax).toFixed(2)); // add tax and service amount
        } else {
            $scope.searchdata.totalTax = 0;
            //$scope.searchdata.totalTaxWithService = 0;
        }
        //console.log('totaltax'+$scope.searchdata.totalTax)
        //console.log('tataltaxwithservice'+ $scope.searchdata.totalTaxWithService)
        $scope.searchdata.totalPriceWithTax = Number(eval(Number($scope.searchdata.totalWithService) + Number($scope.searchdata.totalTax)).toFixed(2)); //
    };

    $scope.addTourismTax = function (roomType, type) {
        if (roomType.tourismTax !== undefined) {
            var tourtax = eval(Number(roomType.RoomsReq) * Number(roomType.tourismTax));
            if (type == "add") {
                $scope.searchdata.tourismTax += Number(tourtax);
                //console.log('before adding tourtax '+$scope.searchdata.totalPriceWithTax )
                $scope.searchdata.totalPriceWithTax += Number(tourtax);
                //console.log('After adding tourtax '+$scope.searchdata.totalPriceWithTax )
            } else if (type == "sub") {
                $scope.searchdata.tourismTax -= Number(tourtax);
                $scope.searchdata.totalPriceWithTax -= Number(tourtax);
            }
        }
    }
    $scope.pad = function (d) {
        return (d < 10) ? '0' + d.toString() : d.toString();
    }
    $scope.getQueryParams = function (qs) {
        qs = qs.split('+').join(' ');

        var params = {},
            tokens,
            re = /[?&]?([^=]+)=([^&]*)/g;

        while (tokens = re.exec(qs)) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        return params;
    }
    /****** this functionality is required in future please retain.
    $scope.guests = [{adults:1,kids:1}];
    $scope.cloneRow = function(guest,type) {
        if(type=='add') {
            $scope.guests.push(guest);
            let currentcount = $scope.guests.length;
            $scope.guestsData.adults[Number(currentcount-1)] = "1";
            $scope.guestsData.kids[Number(currentcount-1)] = "0";
        } else if($scope.guests.length >1) { 
            $scope.guests.splice(guest,1);
            $scope.guestsData.adults.splice(guest,1);
            $scope.guestsData.kids.splice(guest,1);
        }
        $scope.CountGuests(null);
    }
    $scope.CountGuests = function(status) {
        $scope.searchdata.totalAdults = 0;
        $scope.searchdata.totalkids = 0;
        $scope.searchdata.totalRooms = $scope.guestsData.adults.length;
        $scope.guestsData.adults.forEach((adult,index)=>{
            if(!isNaN($scope.guestsData.adults[index])) {
                $scope.searchdata.totalAdults += Number($scope.guestsData.adults[index]);
                $scope.searchdata.totalkids += Number($scope.guestsData.kids[index]);
            }else{
                --$scope.searchdata.totalRooms;
            }
        })
        $scope.searchdata.guests = $scope.searchdata.totalAdults+" Adult(s), "+$scope.searchdata.totalkids+" Kid(s), "+$scope.searchdata.totalRooms+" Room(s)";
        if(status!==null)
            $('.guests-selection-container').toggleClass('active');
    }*/
    $scope.CalcGuests = function () {
        if ($scope.searchdata.totalRooms > $scope.searchdata.totalAdults) {
            //$scope.roomMessage = 'There must be alteast 1 Adult per Room';
            //$scope.searchdata.totalRooms  =  $scope.searchdata.totalAdults;
            $scope.searchdata.totalAdults++;
            $scope.searchdata.totalRooms = $scope.searchdata.totalAdults;
        }
        $scope.searchdata.guests = Number($scope.searchdata.totalAdults) + Number($scope.searchdata.totalkids) + " Guest(s), " + $scope.searchdata.totalRooms + " Room(s) ";
    }
    $scope.booking = function () {
        // if($scope.totalRoomsAdded != $scope.searchdata.totalRooms) {
        //     $scope.validation_msg = "There are few more Rooms left to Choose."
        // } else {
        if ($scope.totalRoomsAdded == 0 || $scope.totalPriceWithoutTax == 0) {
            if ($scope.totalRoomsAdded == 0) {
                $scope.validation_summary_msg = "Please add your Room(s)!";
            } else if ($scope.totalPriceWithoutTax == 0) {
                $scope.validation_summary_msg = "Total Price cannot be zero!";
            }
        } else if ($scope.totalRoomsAdded !== 0 && $scope.totalPriceWithoutTax != 0) {
            // if($scope.searchdata.flexiAvailable && $scope.searchdata.roomTypeFlexiAvailabilityCount == $scope.searchdata.roomTypesSelected.length && $("#flexiBox").is(':checked') === false) {
            //    $('#flexiModal').modal('show');
            //     $("#modal-btn-yes").on("click", function () {
            //         $("#flexiModal").modal('hide');
            //         $scope.FlexiProcess(true);
            //         $("#modal-btn-yes").unbind("click");
            //         $scope.redirectToBookingPage();
            //     });

            //     $("#modal-btn-no").on("click", function () {
            //         $("#flexiModal").modal('hide');
            //        $scope.redirectToBookingPage();
            //     });
            // } else { 
            $scope.redirectToBookingPage();
            // }
        }
        // }
    }

    $scope.booking_submit = function (form) {
        $scope.formerror = {};
        if ($scope.searchdata.payathotel === true) {
            var validationResult = $scope.bookginFormValidation(form);
            if(validationResult) {
                $scope.searchdata.payathotel = false;
                $scope.searchdata.bookingError = "";
                $("#confirm-modal").modal('show');
                $("#modal-btn-yes").on("click", function () {
                    $("#confirm-modal").modal('hide');
                    $scope.searchdata.payathotel = true;
                    $scope.pay_process = true;
                    $scope.booking_submit_ajax();
                    $("#modal-btn-yes").unbind("click");
                });
                $("#modal-btn-no").on("click", function () {
                    $("#confirm-modal").modal('hide');
                });
            } else {
                $scope.searchdata.payathotel = false;
                $scope.searchdata.bookingError = "Please fill in below details";
            }
        } else if ($scope.searchdata.paynow === true) {
            $scope.pay_process = true;
            $scope.booking_submit_ajax();
        }
    }


    $scope.booking_submit_ajax = function () {
        $scope.sendEachRoomTypePrice(); //to send each room price for daily sales report.
        var data = $scope.searchdata;
        NidaFactory
            .ajaxcall('POST', $scope.baseURL + 'booking', data)
            .then(result => {
                $scope.searchdata.paynow = false;
                $scope.searchdata.payathotel = false;
                if (result.data.success) {
                    //window.location.href="/search/confirmation?reference_number="+result.data.data.uuid+"&booked_on="+result.data.data.bookedOn;
                    window.location.href = result.data.redirectUrl;
                } else {
                    $scope.pay_process = false;
                    $scope.formerror = result.data.data;
                    $scope.searchdata.bookingError = err.data.message;
                }
                //console.log(result)
                $scope.$apply();
            })
            .catch(err => {
                $scope.searchdata.paynow = false;
                $scope.searchdata.payathotel = false;
                $scope.pay_process = false;
                if (err.data.data) {
                    $scope.formerror = err.data.data;
                    $scope.searchdata.bookingError = err.data.message;

                } else {
                    $scope.searchdata.bookingError = err.data.message;
                }
                $scope.$apply();

            })
    }

    $scope.check_button = function (val) {
        if (val == 'Book Now') {
            $scope.booking();
        }
    }
    $scope.initMap = function (lat = 40.731, lng = -73.997) {
        if ($('#map').length) {
            $scope.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 7,
                center: { lat: lat, lng: lng }
            });
        }
        $scope.geocoder = new google.maps.Geocoder;
        $scope.infowindow = new google.maps.InfoWindow;
    }
    $scope.geocodeLatLng = function (lat, lng) {
        var latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };
        $scope.geocoder.geocode({ 'location': latlng }, function (results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    $scope.map.setZoom(14);
                    var marker = new google.maps.Marker({
                        position: latlng,
                        map: $scope.map
                    });
                    $scope.map.setCenter(marker.getPosition());
                    //$scope.infowindow.setContent(results[0].formatted_address);
                    //$scope.infowindow.open(map, marker);
                } else {
                    //window.alert('No results found');
                    console.log('No Results found');
                }
            } else {
                //window.alert('Geocoder failed due to: ' + status);
                console.log('Geocode failed due to: ' + status);
            }
        });
    }

    $scope.subscribe = function () {
        var email_id = document.getElementById("email_id").value;
        if (email_id == "") {
            alert("Please enter email address.");
        }
        else {
            var data = { params: { email_id: email_id } };
            //console.log(data);
            $.ajax({
                url: "/news/newsletter-create/",
                type: "POST",
                data: data,
                success: function (response) {
                    if (response.success) {
                        alert('Thanks for sucbscribing!');
                        document.getElementById("email_id").value= "";
                    }
                    if (response.redirect) {
                        window.location.href = response.redirect;
                    }
                }
            });
        }
    }

    $scope.copy_link = function () {
        var copyText = document.getElementById("share_url");
        var share_type = "Copy Link";
        var user_id = document.getElementById("user_id").value;
        if (user_id == "") {
            window.location.href = "/users/login?info=refer";
            return;
        } else {
            copyText.select();
            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copying text command was ' + msg);
            } catch (err) {
                console.log('Oops, unable to copy');
            }
            var hotel_id = document.getElementById("hotel_id").value;
            var link_opens = 0;
            var data = { params: { share_url: copyText.value, share_type: share_type, user_id: user_id, hotel_id: hotel_id } };
            //console.log(data);
            $.ajax({
                url: "/booking/refer-earn/share-hotel/",
                type: "POST",
                data: data,
                success: function (response) {
                    if (response.success) {
                        alert('link copied successfully!');
                    }
                    if (response.redirect) {
                        window.location.href = response.redirect;
                    }
                }
            });
        }

    }

    $scope.send_email = function () {
        var hotel_id = $('#hotel_id').val();
        $.ajax({
            url: "/search/refer-earn/send-email?place=" + hotel_id,
            type:
            "POST",
            data: $('#form_send_email').serialize(),
            success: function (response) {
                if (response.redirect) {
                    window.location.href = response.redirect;
                }
                else if (response.message == "success") {
                    alert("Email sent successfully!! ");
                }
                //alert(response.message);
                //console.log(response);
            },
            error: function (xhr) {
                alert(xhr);
            }
        });
    }
    $scope.share_fb = function (e) {

        var share_url = document.getElementById("share_url").value;
        var share_type = "Facebook";
        var user_id = document.getElementById("user_id").value;
        if (user_id == "") {
            e.preventDefault();
            window.location.href = "/users/login?info=refer";
            return;
        } else {
            $scope.popupwindow('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(share_url), document.title, 600, 400);
            /*FB.ui(
                {
                    method: 'share_open_graph',
                    action_type: 'og.shares',
                    display: 'popup',
                    action_properties: JSON.stringify({
                    object: {
                        'og:url': 'http://hotelnida.com/search/details?place='+$scope.searchdata.hotel_id+'&countryID='+$scope.searchdata.countryID+"&referred_by="+userid,
                        'og:title': $scope.details.hotel_name+' | Redifining Budget Hotels in '+$scope.details.hotel_city+' and beyond.' ,
                        'og:description': 'Travelling soon? Refine your stay at Hotel NIDA with enhanced flexibility & convenience to suit the needs of a modren traveller.',
                        'og:image': $scope.default_hotel_image_link,
                    }
                    })
                },
                function (response) {
                console.log(response)
                if (response && !response.error_code) {
                    if (typeof response != 'undefined') {                   
                        //alert('success');*/
            var hotel_id = document.getElementById("hotel_id").value;
            var link_opens = 0;
            var data = { params: { share_url: share_url, share_type: share_type, user_id: user_id, hotel_id: hotel_id } };
            //console.log(data);
            $.ajax({
                url: "/booking/refer-earn/share-hotel/",
                type: "POST",
                data: data,
                success: function (response) {
                    if (response.message == "success") {
                        console.log("You have successfully shared the hotels!! ");
                    }
                    // alert(response.message);
                },
                error: function (xhr) {
                    console.log(xhr);

                }
            });
            /*}else {
                //user closed dialog without sharing
            }
        }
        }
    );*/

        }

    }

    $scope.share_twitter = function (e) {
        var share_url = document.getElementById("share_url").value;
        var share_type = "Twitter";
        var user_id = document.getElementById("user_id").value;
        if (user_id == "") {
            e.preventDefault();
            window.location.href = "/users/login?info=refer";
            return;
        } else {
            $scope.popupwindow('https://twitter.com/intent/tweet?url=' + encodeURIComponent(share_url), document.title, 600, 400);
            var hotel_id = document.getElementById("hotel_id").value;
            var link_opens = 0;
            var data = { params: { share_url: share_url, share_type: share_type, user_id: user_id, hotel_id: hotel_id } };
            //console.log(data);
            $.ajax({
                url: "/booking/refer-earn/share-hotel/",
                type: "POST",
                data: data,
                success: function (response) {
                    if (response.message == "success") {
                        console.log("You have successfully shared the hotels!! ");
                    }
                    // alert(response.message);
                },
                error: function (xhr) {
                    console.log(xhr);

                }
            });
        }

    }

    $scope.mapAmenities = function (recordData, masterAmenities) {
        var amenities_arr = new Array();
        Object.keys(recordData).forEach((wrapperkey, index) => {
            var amenityWrapper = recordData;
            Object.keys(masterAmenities).forEach((master_key, master_index) => {
                var master_data = masterAmenities;
                if (wrapperkey == master_key) {
                    if (amenityWrapper[wrapperkey].constructor == Array) {
                        amenityWrapper[wrapperkey].forEach(amenity => {
                            master_data[master_key].forEach(mkey => {
                                if (Number(amenity._parent_id) == mkey.value) {
                                    amenities_arr.push(mkey);
                                }
                            });
                        });
                    } else if (amenityWrapper[wrapperkey].constructor == Object) {
                        Object.keys(amenityWrapper[wrapperkey]).forEach((sub_Wrapper_key, sub_index) => {
                            if (amenityWrapper[wrapperkey][sub_Wrapper_key].constructor == Array) {
                                amenityWrapper[wrapperkey][sub_Wrapper_key].forEach(amenity => {
                                    master_data[master_key].forEach(mkey => {
                                        if (Number(amenity._parent_id) == mkey.value) {
                                            amenities_arr.push(mkey);
                                        }
                                    })
                                });
                            }
                        })
                    }
                }
            })
        });
        return amenities_arr;
    }
    $scope.roomTypeGallery = function (modalid) {
        $('#modal_' + modalid).modal();
        $('#modal_' + modalid).resize();
        //$('#modal_'+modalid).find('.room-type-carousel').slick('setPosition');
        setTimeout(function () {
            $('#modal_' + modalid).find('.room-type-carousel').slick({
                dots: false,
                infinite: true,
                speed: 300,
                arrows: true,
                slidesToShow: 1,
                slidesToScroll: 1
            });
        }, 200);

    }
    $scope.getCalculateComm = function () {
        $scope.getConversionRates()
            .then(res => {
                if (res.success) {
                    $scope.details.conversionRates = res.data;
                    var Currencyrates = $scope.details.conversionRates;
                    console.log('current rates', Currencyrates)
                    const exchange_rates = { MYR: 4.05, THB: 32.50 };
                    var exchange_rate = 0
                    if (Currencyrates.length > 0) {
                        Currencyrates.forEach(rate => {
                            if (rate.field_currency_code == $scope.searchdata.currencyCode) {
                                exchange_rate = rate.field_currency_rate;
                            }
                        });
                        if (exchange_rate == 0) {
                            exchange_rate = exchange_rates[$scope.searchdata.currencyCode];
                        }
                        $scope.details.nidaCash = ((Number($scope.searchdata.totalPriceWithoutTax) *7) / 100) / Number(exchange_rate);
                        $scope.$apply();
                    }
                }
            }, err => {
                console.log(err.message);
            })
            .catch(err => {
                console.log(err.message);
            })
    }
    $scope.sendEachRoomTypePrice = function () {
        $scope.searchdata.eachRoomTypePrice = new Array();
        $scope.details.room_types.forEach(roomType => {
            if (roomType.RoomsReq != 0) {
                $scope.searchdata.eachRoomTypePrice.push({ type: roomType.room_type_id, totalRoomPrice: roomType.totalRoomPrice, no_of_rooms: roomType.RoomsReq});
            }
        });
    }

    $scope.popupwindow = function (url, title, w, h) {
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    }

    $scope.flexiCheck = function () {
        var data = { hotel_id: $scope.searchdata.hotel_id, check_in: moment($scope.searchdata.check_in).format("DD-MM-YYYY"), check_out: moment($scope.searchdata.check_out).format("DD-MM-YYYY") };
        NidaFactory
            .ajaxcall('POST', $scope.baseURL + 'flexi_manager/getOccupanyResults', data)
            .then(result => {
                if (result.data.success) {
                    $scope.searchdata.flexiAvailable = true;
                    $scope.searchdata.flexiMarkup = result.data.data.flexiMarkup;
                    $scope.searchdata.flexiAvailableTypes = result.data.data.FlexiAllowedTypes;
                    if ($scope.searchdata.flexiEnabled === true) {
                        setTimeout(function () {
                            $scope.FlexiProcess(true); // to add flexi on booking screen.
                            $scope.$apply();
                        }, 100)

                    }
                } else {
                    $scope.searchdata.flexiAvailable = false;
                }
                $scope.$apply();
            })
            .catch(err => {
                if (err.data.data) {
                    $scope.searchdata.flexiAvailable = false;
                }
                $scope.$apply();

            });
    }
    $scope.FlexiProcess = function (status, autoFlexiTrigger = true) {
        //console.log('flex status',status)
        if (status) {
            $scope.searchdata.roomTypeFlexiAvailabilityCount = 0;
            console.log('flexiAvailableTypes ', $scope.searchdata.flexiAvailableTypes);
            console.log('roomtypesselected', $scope.searchdata.roomTypesSelected);
            $scope.searchdata.roomTypesSelected.forEach(roomtype => {
                $scope.searchdata.flexiAvailableTypes.forEach(flexiAvailableRoomType => {
                    if (flexiAvailableRoomType == roomtype) {
                        $scope.searchdata.roomTypeFlexiAvailabilityCount++;
                    }
                });
            });
            console.log('roomtypeflexiAvailabilityCount', $scope.searchdata.roomTypeFlexiAvailabilityCount);
            if ($scope.searchdata.flexiAvailable && $scope.searchdata.roomTypeFlexiAvailabilityCount == $scope.searchdata.roomTypesSelected.length) {
                $scope.flexiMessage = "";
                $scope.details.flexiBox = false;
                if (autoFlexiTrigger) {
                    $scope.searchdata.flexiEnabled = true;
                    $scope.searchdata.flexiAmount = ((Number($scope.searchdata.totalPriceWithoutTax) * Number($scope.searchdata.flexiMarkup)) / 100).toFixed(2);
                }
                $scope.addServiceFee($scope.globalServiceFeeMarkup);
                $scope.calculateTax($scope.glboalTaxMarkup);
            } else {
                $scope.searchdata.flexiAmount = 0;
                $scope.flexiMessage = "Flexi is not available for choosen date.";
                $scope.details.flexiBox = true;
                $scope.searchdata.flexiEnabled = false;
                $scope.addServiceFee($scope.globalServiceFeeMarkup);
                $scope.calculateTax($scope.glboalTaxMarkup);
            }
        } else {
            $scope.searchdata.flexiAmount = 0;
            $scope.flexiMessage = "";
            $scope.details.flexiBox = false;
            $scope.addServiceFee($scope.globalServiceFeeMarkup);
            $scope.calculateTax($scope.glboalTaxMarkup);
        }
    }

    $scope.redirectToBookingPage = function () {
        // to get all room types selected in array.

        //console.log('roomtypeselected');
        //console.log($scope.searchdata.roomTypesSelected)
        // roomtype and quantity pair
        $scope.details.room_types.forEach(roomtype => {
            if (roomtype.RoomsReq != 0) {
                $scope.searchdata['roomtype_' + roomtype.room_type_id] = roomtype.RoomsReq;
            }
        })
        url = Object.keys($scope.searchdata).map(function (k) {
            if (k == "place") {
                return encodeURIComponent(k) + '=' + encodeURIComponent($scope.searchdata[k]['hotel_id']);
            } else if (k == 'roomTypesSelected') {
                return encodeURIComponent(k) + '=' + encodeURIComponent($scope.searchdata[k].join());
            }
            return encodeURIComponent(k) + '=' + encodeURIComponent($scope.searchdata[k]);
        }).join('&');
        window.location.href = '/search/booking?' + url;
    }

    $scope.getConversionRates = function () {
        return new Promise((resolve, reject) => {
            // call to get room master amenities
            NidaFactory
                .ajaxcall('GET', $scope.baseURL + 'booking/getConvertionRates', {})
                .then(result => {
                    if (result.data.success) {
                        resolve({ success: true, data: result.data.rates });
                    } else {
                        reject({ success: false, message: 'could not fetch rates' });
                    }
                })
                .catch(err => {
                    reject({ success: false, message: err.message });
                });
        })
    };

    $scope.location_details = function () {
        $('body').addClass('loaded');
        $scope.lsetResult = 0
        $scope.lhotels_ids = new Array()
        $scope.listContents = new Array();
        $scope.ld_fids = new Array();
        $scope.hotel_images = new Array();
        $scope.page_links = new Array();
        //$scope.RateAndCurrencyStep = 0;
        var data = {};
        var path = window.location.pathname;


        setTimeout(function () {
            $scope.initMap(Number(lat), Number(lng));
        }, 100);

        var cstring = path.replace(/^\/|\/$/g, '');
        data['cstring'] = cstring;
        if (cstring.indexOf('country') > -1) {
            data['type'] = 1;
        } else if (cstring.indexOf('city') > -1) {
            data['type'] = 2;
        }
        // call blog tags on load..
        $scope.getBlogTagId(data.cstring);
        // to get seo detail page contents..
        NidaFactory
            .ajaxcall('GET', $scope.baseURL + 'seo_manager/locality?cstring=' + cstring + '&type=' + data['type'], {})
            .then(lresult => {
                $('body').addClass('loaded');
                if (lresult.data.success) {
                    $scope.lsetResult = 1
                    lresult.data.data.forEach(lhotel => {
                        $scope.lhotels_ids.push(lhotel._hotel_id);
                        $scope.page_links.push(lhotel._link);
                    })
                    NidaFactory
                        .ajaxcall('POST', $scope.baseURL + 'hotel_manager/ghtd', { ids: $scope.lhotels_ids })
                        .then(result => {
                            if (result.data.success) {
                                if (result.data.data.length > 0) {
                                    result.data.data.forEach(item => {
                                        //pushing page links under listContents array
                                        $scope.lhotels_ids.forEach((hotelid, index) => {
                                            if (hotelid == item._hotel_id) {
                                                item['page_link'] = $scope.page_links[index];
                                                item['lowestRate'] = 0;
                                                item['RateAndCurrencyStep'] = 0;
                                                item['resStatus'] = 0;
                                            }
                                        })
                                        //pushing hotel object to listContents
                                        $scope.listContents.push(item);
                                        //pushing latlng to array
                                        item._image_fids.forEach(fid => {
                                            $scope.ld_fids.push(fid);
                                        });
                                        //getting lowest rate for a give hotel
                                        var availability_request_params = { hotel_uuid: item._hotel_id, check_in: moment($scope.searchdata.check_in).format("DD-MM-YYYY"), check_out: moment($scope.searchdata.check_out).format("DD-MM-YYYY") };
                                        NidaFactory
                                            .ajaxcall('POST', $scope.baseURL + 'hotels-manager/manager/rates/sell/web?hotel_uuid=' + item._hotel_id, availability_request_params)
                                            .then(result => {
                                                var requestData = JSON.parse(result.config.data);
                                                var request_hotel_id = requestData.hotel_uuid;
                                                //console.log('request hotel id ',request_hotel_id)
                                                if (result.data.success) {
                                                    var lowestRate = 0;
                                                    result.data.data.rooms.forEach(rate => {
                                                        if (lowestRate == 0) {
                                                            lowestRate = Number(rate.averageCost);
                                                        } else {
                                                            if (lowestRate > Number(rate.averageCost)) {
                                                                lowestRate = Number(rate.averageCost);
                                                            }
                                                        }
                                                    });
                                                    $scope.listContents.forEach((hotel, index) => {
                                                        if (hotel._hotel_id == request_hotel_id) {
                                                            $scope.listContents[index]['lowestRate'] = lowestRate;
                                                            $scope.listContents[index]['RateAndCurrencyStep'] += 1;
                                                            $scope.listContents[index]['resStatus']  = 1;
                                                        }
                                                    });
                                                    $scope.add_markers($scope.listContents);
                                                }else {
                                                    $scope.listContents.forEach((hotel, index) => {
                                                        if (hotel._hotel_id == request_hotel_id) {
                                                            $scope.listContents[index]['resStatus']  = 2;
                                                        }
                                                    });
                                                }
                                                $scope.$apply();
                                            })
                                            .catch(err => {
                                                console.log('error ', err.message)
                                            })

                                        // get currency code based on hotel_id
                                        NidaFactory
                                            .ajaxcall('GET', $scope.baseURL + 'search/get-currency?hotel_id=' + item._hotel_id, { hotel_id: item._hotel_id })
                                            .then(result => {
                                                var requestData = JSON.parse(result.config.data);
                                                var request_hotel_id = requestData.hotel_id;
                                                if (result.data.success) {
                                                    $scope.listContents.forEach((hotel, index) => {
                                                        if (hotel._hotel_id == request_hotel_id) {
                                                            //onsole.log('currency ',result.data.currency);
                                                            $scope.listContents[index]['currency'] = result.data.currency;
                                                            $scope.listContents[index]['RateAndCurrencyStep'] += 1;
                                                        }
                                                    });

                                                    //adding markers
                                                    $scope.add_markers($scope.listContents);
                                                }
                                                $scope.$apply();
                                            })
                                            .catch(err => {
                                                console.log(err);
                                            })
                                    });// for loop ends



                                    // call to get images
                                    var Image_files = { params: { files: $scope.ld_fids } };
                                    NidaFactory
                                        .ajaxcall('POST', $scope.baseURL + 'file/get?type=all', Image_files)
                                        .then(result => {
                                            if (result.data.success) {
                                                $scope.RoomTypesimages = result.data.links;
                                                $scope.listContents.forEach(hotel => {
                                                    hotel._image_links = [];
                                                    hotel._image_fids.forEach(fid => {
                                                        result.data.fids.forEach((resfid, index) => {
                                                            if (resfid == fid) {
                                                                hotel._image_links.push(result.data.links[index]);
                                                            }
                                                        })
                                                    })
                                                })
                                                $scope.$apply();
                                                $('.bxslider').bxSlider({ adaptiveHeight: true, slideWidth: 300, nextText: '', prevText: '' });
                                            }
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        })
                                }
                            }
                            //console.log($scope.listContents)
                            $scope.$apply();
                        })
                        .catch(err => {
                            $scope.lsetResult = 2;
                            console.log(err.message);
                        })
                } else {
                    $scope.lsetResult = 2;
                    console.log('No Results Found.')
                }
            })
            .catch(err => {

            })

    }
    $scope.add_markers = function (latlngArr) {
        console.log('latlngarr', latlngArr)
        //create empty LatLngBounds object
        var bounds = new google.maps.LatLngBounds();
        var infowindow = new google.maps.InfoWindow();
        latlngArr.forEach(latlng => {
            //console.log('latlng lowestRate', latlng.lowestRate)
            if(latlng['RateAndCurrencyStep'] == 2) {
                var markerObj = {
                    position: new google.maps.LatLng(Number(latlng._latitude), Number(latlng._longitude)),
                    map: $scope.map,
                    title: latlng._nida_stay_name,
                    icon: '/images/droppin.png',
                    caledSize: new google.maps.Size(50, 50),
                }
                var markerlabel = '';
                if (latlng.currency !== undefined && (latlng.lowestRate !== undefined && latlng.lowestRate != 0) && latlng.resStatus == 1)  {
                    markerlabel = latlng.currency + ' ' + latlng.lowestRate.toFixed(2);
                } else if ((latlng.lowestRate === undefined || latlng.lowestRate == 0) && (latlng.resStatus == 1 || latlng.resStatus == 2)){
                    markerlabel = 'SOLD OUT';
                }
                markerObj['label'] = { text: markerlabel, color: "white", fontSize: "12px", fontWeight: "bold" }
                var marker = new google.maps.Marker(markerObj);
                google.maps.event.addListener(marker, 'click', function() {
                    var infoContent = $('#'+latlng._hotel_id).html();
                    infowindow.setContent(infoContent);
                    infowindow.open($scope.map, this);
                });
                //extend the bounds to include each marker's position
                bounds.extend(marker.position);
            }
        });
        //now fit the map to the newly inclusive bounds
        $scope.map.fitBounds(bounds);
        $scope.map.setZoom(11);
        
    }
    $scope.blogfun = function (tag = null) {
        // call to get blog info
        var url = 'https://blog.hotelnida.com/wp-json/wp/v2/posts?categories=12'
        if(tag) {
            url = url+'&tags='+tag
        }
        NidaFactory
            .ajaxcall('GET', url, {})
            .then(result => {
                if (result.data.length > 0) {
                    $scope.blog = result.data;
                    // var prevArrow = '<button class="btn btn-danger btn-rounded" type="button" style="padding: 0; height: 45px; width: 45px;"><i class="fa fa-arrow-left fa-fw"></i></button>';
                    // var nextArrow = '<button class="btn btn-danger btn-rounded" type="button" style="padding: 0; height: 45px; width: 45px;"><i class="fa fa-arrow-right fa-fw"></i></button>';
                    setTimeout(function () {
                        $('.blogs-container').slick({
                            // dots: true,
                            infinite: false,
                            speed: 300,
                            slidesToShow: 4,
                            slidesToScroll: 1,
                            // prevArrow: prevArrow,
                            // nextArrow: nextArrow,
                            responsive: [
                                {
                                    breakpoint: 1024,
                                    settings: {
                                        slidesToShow: 3,
                                        slidesToScroll: 1,
                                        infinite: false,
                                        dots: true
                                    }
                                },
                                {
                                    breakpoint: 600,
                                    settings: {
                                        slidesToShow: 2,
                                        slidesToScroll: 1
                                    }
                                },
                                {
                                    breakpoint: 480,
                                    settings: {
                                        slidesToShow: 1,
                                        slidesToScroll: 1
                                    }
                                }
                                // You can unslick at a given breakpoint now by adding:
                                // settings: "unslick"
                                // instead of a settings object
                            ]
                        });
                    }, 200);
                }
                $scope.$apply();
            })
            .catch(err => {
                console.log(err.message);
            })
    }

    $scope.trustHtml = function (data) {
        return $sce.trustAsHtml(data);
    };

    $scope.slickCarousel = function (planeId = null) {
        var obj = $('div.nearby-cards');
        if (planeId !== null) {
            //console.log('plane id',planeId)
            $(planeId).css('width', '100%');
            obj = $(planeId).find('div.nearby-cards');
            if (obj.hasClass('slick-initialized')) {
                obj.slick('unslick');
            }
        }
        setTimeout(function () {
            var obj = $('div.nearby-cards');
            if (planeId !== null) {
                //console.log('plane id',planeId)
                obj = $(planeId).find('div.nearby-cards');
            }
            obj.slick({
                dots: false,
                infinite: true,
                speed: 300,
                slidesToShow: 4,
                slidesToScroll: 1,
                lazyLoad: 'ondemand',
                responsive: [
                    {
                        breakpoint: 1024,
                        settings: {
                            slidesToShow: 3,
                            slidesToScroll: 1,
                            infinite: true,
                            dots: false,
                            adaptiveHeight: true,
                            cssEase: 'linear',
                        }
                    },
                    {
                        breakpoint: 600,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 1,
                            infinite: true,
                            arrows: true,
                            adaptiveHeight: true,
                            cssEase: 'linear',

                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            infinite: true,
                            adaptiveHeight: true,
                            cssEase: 'linear',
                        }
                    }
                    // You can unslick at a given breakpoint now by adding:
                    // settings: "unslick"
                    // instead of a settings object
                ]
            });
            obj.slick('resize');
        }, 100);
    }

    $scope.setDateRangeDyanmically = function(type) {
        
        var hotel_data = $scope.searchdata.place;
        //console.log('hotel id on change ',hotel_data)
        var today = new Date()
        
        //console.log('country page id',country_page_id) // commented complete statement on march 2nd by satish.
         if(hotel_data !== undefined) {
             if(hotel_data.hotel_id!==undefined) {
                 /*if(hotel_data.hotel_id == "c195fa8c-8c99-4ed7-9dd2-965b645bdf9e") {
                     today = new Date(2018,03,01);
                 }*/
                 /*} else if(hotel_data.hotel_id == "96419ac6-f1fb-4f7c-9bc3-45be57f841b4") { //Hotel NIDA Sukhumvit Onnut
                     //today = new Date(2018,01,01);
                 } else if(typeof country_page_id!== 'undefined') {
                     if(country_page_id == '217' && type=='load') {
                         today  = new Date(new Date(2018,02,01))
                     }
                 }*/
             }
         } 
        var todayObj = today;
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0! 
        var yyyy = today.getFullYear();
        if (dd < 10) { dd = '0' + dd }
        if (mm < 10) { mm = '0' + mm }
        var today = mm + '/' + dd + '/' + yyyy;
        $('input#check-in-date, input#check-out-date').daterangepicker({
            minDate: today,
            autoApply: true,
            autoUpdateInput: false,
            locale: {
                cancelLabel: 'Cancel'
            }
        })
        .on('showCalendar.daterangepicker', function (ev, picker) {
            if (picker.element.offset().top - $(window).scrollTop() + picker.container.outerHeight() > $(window).height()) {
                return picker.drops = 'up';
            } else {
                return picker.drops = 'down';
            }
        })
        .on('apply.daterangepicker', function (ev, picker) {
            var startDate = picker.startDate.format("DD MMM YYYY");
            var endDate = picker.endDate.format("DD MMM YYYY");

            //console.log('Start Date:', startDate);
            //console.log('End Date:', endDate);

            if (endDate === startDate) {
                endDate = picker.endDate.add(1, 'day').format("DD MMM YYYY");
            }

            $(this).val(startDate);
            $('input#check-out-date').val(endDate);
            $scope.searchdata.check_in = picker.startDate.format('YYYY-MM-DD');
            $scope.searchdata.check_out = picker.endDate.format('YYYY-MM-DD');

            //console.log('Check Out: ', $scope.searchdata.check_out)
            $scope.$apply();
        })
        .on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
        });
        //console.log('pagemode log',$scope.pageMode)
        if ($scope.pageMode == "create") {
            //console.log('why it is not entering here')
            $('input#check-in-date').val(moment(todayObj).format("DD MMM YYYY"));
            $('input#check-out-date').val(moment(todayObj).add(1, 'days').format("DD MMM YYYY"));
            $scope.searchdata.check_in = moment(todayObj).format('YYYY-MM-DD');
            $scope.searchdata.check_out = moment(todayObj).add(1, 'days').format('YYYY-MM-DD');
            //$scope.CountGuests(null); //required in future.
        } else if ($scope.pageMode == "edit") {
            var query = $scope.getQueryParams(document.location.search);
            if(type == 'change') {
                $scope.searchdata.check_in =  moment(todayObj).format('YYYY-MM-DD');
                $scope.searchdata.check_out = moment(todayObj).add(1, 'days').format('YYYY-MM-DD');
            } else if(type== 'load') {
                $scope.searchdata.check_in = (query.check_in !== undefined ? query.check_in : moment(todayObj).format("YYYY-MM-DD"));
                $scope.searchdata.check_out = (query.check_out !== undefined ? query.check_out : moment(todayObj).add(1, 'days').format("YYYY-MM-DD"));//moment(query.check_out).format("DD-MM-YYYY");
            }
            $('input#check-in-date').val(moment($scope.searchdata.check_in, 'YYYY-MM-DD').format("DD MMM YYYY"));
            $('input#check-out-date').val(moment($scope.searchdata.check_out, 'YYYY-MM-DD').format("DD MMM YYYY"));

            
            $('input#check-in-date').data('daterangepicker').setStartDate(moment($scope.searchdata.check_in));
            $('input#check-in-date').data('daterangepicker').setEndDate(moment($scope.searchdata.check_out));

            $('input#check-out-date').data('daterangepicker').setStartDate(moment($scope.searchdata.check_in));
            $('input#check-out-date').data('daterangepicker').setEndDate(moment($scope.searchdata.check_out));
        }

        

    }

    $scope.passID = function () {
        //If DIV is visible it will be hidden and vice versa.
        $scope.searchdata.PassAvailable = $scope.searchdata.additional_identification;
        if($scope.searchdata.PassAvailable === false) {
            $scope.searchdata.additional_identification_number = "";
        }
        $scope.nationalityChange($scope.searchdata.nationality);
    }

    $scope.getBlogTagId = function(cstring) {
        // call to get blog info
        NidaFactory
            .ajaxcall('GET', 'https://blog.hotelnida.com/wp-json/wp/v2/tags', {})
            .then(result => {
                if(result.data.length > 0) {
                    $scope.blogTags = result.data;
                    // country/city/hotel based blog contents
                    if($scope.blogTags.length>0) {
                        $scope.blogTags.forEach(tag=>{
                            //console.log('tag slug',tag.slug);
                            if(typeof tag.slug != 'undefined') {
                                if(cstring.indexOf(tag.slug) > -1) {
                                    //console.log('tagid',tag.id)
                                    $scope.blogfun(tag.id);
                                }
                            }
                        })
                    }
                    $scope.$apply();
                }
            })
            .catch(err=>{
                console.log(err.message);
            })
    }

    //to resize the slick carousel on tab panel
    $(document).on("click", ".nav-pills li", function () {
        var idOfEle = $(this).find('a').attr('href');
        //console.log(idOfEle)
        $scope.slickCarousel(idOfEle);
    });

    $scope.bookginFormValidation = function(form) {
        
        if($scope.searchdata.firstname === null || $scope.searchdata.firstname == "" || $scope.searchdata.firstname === undefined) {
            $scope.formerror['firstname'] = {'msg':'Please enter your Firstname'};
        }
        if($scope.searchdata.lastname === null || $scope.searchdata.lastname == "" || $scope.searchdata.lastname === undefined) {
            $scope.formerror['lastname'] = {'msg':'Please enter your Lastname'};
        } 
        if($scope.searchdata.email === null || $scope.searchdata.email == "" || $scope.searchdata.email === undefined) {
            $scope.formerror['email'] =  {'msg':'Invalid email'};
        }
        if($scope.searchdata.nationality == 'select') {
            $scope.formerror['nationality'] = {'msg': 'Choose your nationality'};
        }
        if($scope.searchdata.mobileno_stdcode == 'select') {
            $scope.formerror['mobileno_stdcode'] = {'msg':'Choose your country code'};
        }
        if($scope.searchdata.mobileno === null || $scope.searchdata.mobileno == "" || $scope.searchdata.mobileno === undefined) {
            $scope.formerror['mobileno'] = {'msg': 'Please enter your mobile no'}
        }
        if($('.reason_to_stay').is(':checked') === false) {
            $scope.formerror['reason_to_stay'] = {'msg': 'Please choose reason to stay'}
        } 
        if(Object.keys($scope.formerror).length) {
            return false;
        } else {
            $scope.formerror = {};
            return true;
        }
    }

}]);


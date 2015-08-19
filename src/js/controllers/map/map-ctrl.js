(function ($) {
    'use strict';

    function MapCtrl($scope, $compile, Trainings, Churches, Ministries, Settings, GoogleAnalytics, UserPreference, $modal, growl, ISOCountries, TargetCity) {
        $scope.current.isLoaded = false;
        $scope.versionUrl = Settings.versionUrl;
        $scope.area_codes = _.sortBy(Settings.area_codes, 'name');

        $scope.show_all = "year";
        $scope.show_tree = false;

        $scope.new_church = {};
        $scope.new_training = {};
        $scope.new_targetCity = {};
        $scope.edit_church = {};
        //a flag for parent mode
        $scope.SetParentMode = false;

        $scope.church_lines = [];
        $scope.churches = [];
        $scope.trainings = [];
        $scope.targetCities = [];
        $scope.training_types = [
            {value: "MC2", text: 'MC2'},
            {value: "T4T", text: 'T4T'},
            {value: "CPMI", text: 'CPMI'},
            {value: "", text: 'Other'}
        ];
        //for filters/checkbox on sidebar
        $scope.iconFilters = {
            training: true,
            targetCity: true,
            target_point: true,
            group: true,
            church: true,
            mult_church: true,
            parent_lines: true,
            jesus_film: true
        };
        //for radio button filter
        $scope.map_scope_filter = 'min_only';
        //sub-stages for target city
        $scope.targetCitySubStages = [
            {val: '0', name: '0 - Nothing yet', stage: 0},
            {val: '0a', name: '0a - Pioneering', stage: 0},
            {val: '1a', name: '1a - Startup (1-5 Groups)', stage: 1},
            {val: '1b', name: '1b - Solidification (5-10 groups)', stage: 1},
            {val: '2', name: '2 - Growth (> 10 groups)', stage: 2},
            {val: '3', name: '3 - Partnering (>30 groups)', stage: 3}
        ];

        //default map options
        var defaultMapOptions = {
            zoom: 3,
            center: new google.maps.LatLng(0, 0),
            panControl: true,
            zoomControl: true,
            mapTypeControl: true,
            streetViewControl: false,
            overviewMapControl: false
        };
        $scope.supportsGeoLocation = typeof navigator.geolocation !== 'undefined';
        setTimeout(initialize, 0);

        var sendAnalytics = _.throttle(function () {
            console.log('Send analytics');
            GoogleAnalytics.screen('Map', (function () {
                var dimensions = {};
                dimensions[GoogleAnalytics.DIM.guid] = $scope.current.user.key_guid;
                if (angular.isDefined($scope.current.assignment.ministry_id)) {
                    dimensions[GoogleAnalytics.DIM.ministry_id] = $scope.current.assignment.ministry_id;
                }
                if (angular.isDefined($scope.current.mcc)) {
                    dimensions[GoogleAnalytics.DIM.mcc] = $scope.current.mcc;
                }
                if (angular.isDefined($scope.current.period)) {
                    dimensions[GoogleAnalytics.DIM.period] = $scope.current.period.format('YYYY-MM');
                }
                return dimensions;
            })());
        }, 1000, {leading: false});

        function initialize() {
            //init google map
            $scope.map = new google.maps.Map(document.getElementById('map_canvas'), defaultMapOptions);
            $scope.map.setOptions({draggableCursor: ''});

            google.maps.event.addListener($scope.map, "idle", function () {
                $scope.current.isLoaded = true;
                var bounds = $scope.map.getBounds(),
                    ne = bounds.getNorthEast(),
                    sw = bounds.getSouthWest();

                if (ne.lat() == sw.lat() && ne.lng() == sw.lng()) {
                    // Trigger a resize if bounds have 0 area
                    google.maps.event.trigger($scope.map, 'resize');
                }
                else {
                    $scope.loadChurches();
                }
            });
            $scope.map.markers = [];
            $scope.church = {name: ""};
            //edit church
            $scope.churchWindow = new google.maps.InfoWindow();
            $scope.churchWindowContent = $compile('<div id="church_window_content" ng-include="\'partials/map/edit-church.html\'"></div>')($scope)
            $scope.churchWindow.setOptions({maxWidth: 300});
            //edit training
            $scope.trainingWindow = new google.maps.InfoWindow();
            $scope.trainingWindowContent = $compile('<div id="training_window_content" ng-include="\'partials/map/edit-training.html\'"></div>')($scope)
            $scope.trainingWindow.setOptions({maxWidth: 400});
            //edit target city
            $scope.targetCityWindow = new google.maps.InfoWindow();
            $scope.targetCityWindowContent = $compile('<div id="traget_city_window_content" ng-include="\'partials/map/edit-target-city.html\'"></div>')($scope)
            $scope.targetCityWindow.setOptions({maxWidth: 300});

            //new church
            $scope.newChurchWindow = new google.maps.InfoWindow();
            google.maps.event.addListener($scope.newChurchWindow, 'closeclick', function () {
                $scope.cancelAddNewIcon();
            });
            $scope.newChurchWindowContent = $compile('<div id="new_church_window_content" ng-include="\'partials/map/new-church.html\'"></div>')($scope);
            $scope.newChurchWindow.setOptions({maxWidth: 300});
            //new training
            $scope.newTrainingWindow = new google.maps.InfoWindow();
            google.maps.event.addListener($scope.newTrainingWindow, 'closeclick', function () {
                $scope.cancelAddNewIcon();
            });
            $scope.newTrainingContent = $compile('<div id="new_training_window_content" ng-include="\'partials/map/new-training.html\'"></div>')($scope);
            $scope.newTrainingWindow.setOptions({maxWidth: 300});
            //new target city
            $scope.newTargetCityWindow = new google.maps.InfoWindow();
            google.maps.event.addListener($scope.newTargetCityWindow, 'closeclick', function () {
                $scope.cancelAddNewIcon();
            });
            $scope.newTargetCityContent = $compile('<div id="new_target_city_window_content" ng-include="\'partials/map/new-target-city.html\'"></div>')($scope);
            $scope.newTargetCityWindow.setOptions({maxWidth: 300});


            $scope.map.church_lines = [];

            $scope.map.icons = {
                church: new google.maps.MarkerImage(
                    Settings.versionUrl('img/icon/church.png'),
                    new google.maps.Size(60, 60),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(30, 58)
                ),
                cluster: new google.maps.MarkerImage(
                    Settings.versionUrl('img/icon/cluster.png'),
                    new google.maps.Size(60, 60),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(30, 31)
                ),
                multiplying: new google.maps.MarkerImage(
                    Settings.versionUrl('img/icon/multiplying.png'),
                    new google.maps.Size(60, 60),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(30, 53)
                ),
                group: new google.maps.MarkerImage(
                    Settings.versionUrl('img/icon/group.png'),
                    new google.maps.Size(60, 60),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(30, 55)
                ),
                targetpoint: new google.maps.MarkerImage(
                    Settings.versionUrl('img/icon/target.png'),
                    new google.maps.Size(60, 60),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(32, 56)
                ),
                training: new google.maps.MarkerImage(
                    Settings.versionUrl('img/icon/training.png'),
                    new google.maps.Size(60, 60),
                    new google.maps.Point(0, 0),
                    new google.maps.Point(30, 43)
                ),
                targetCity: new google.maps.MarkerImage(
                    Settings.versionUrl('img/icon/target-city.png'),
                    new google.maps.Size(60, 60), //size in pixel
                    new google.maps.Point(0, 0), //The origin for this image is 0,0
                    new google.maps.Point(30, 43)  // The anchor for this image
                )
            };

            //map sidebar and controls
            $scope.map.side = document.getElementById('side');
            $scope.map.side.index = -1;
            $scope.map.side.style.display = 'block';
            $scope.map.search = document.getElementById('map_controls');
            $scope.map.search.index = 3;
            $scope.map.search.style.display = 'block';

            $scope.map.controls[google.maps.ControlPosition.TOP_RIGHT].push($scope.map.side);
            $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push($scope.map.search);
            //search box control
            $scope.autocomplete = new google.maps.places.Autocomplete(document.getElementById('searchBox'));
            $scope.autocomplete.bindTo('bounds', $scope.map);

            google.maps.event.addListener($scope.autocomplete, 'place_changed', function () {
                var place = $scope.autocomplete.getPlace();
                if (!place.geometry) {
                    return;
                }

                if (place.geometry.viewport) {
                    $scope.map.fitBounds(place.geometry.viewport);
                } else {
                    $scope.map.setCenter(place.geometry.location);
                    $scope.map.setZoom(15);
                }
            });

            if ($scope.current.assignment) {
                load_training_markers();
            }

            $scope.$watch('current.assignment', function (assignment, oldVal) {
                if (typeof assignment !== 'undefined') {
                    //set default, be fail safe
                    var latitude, longitude, zoom;

                    if (assignment && assignment.hasOwnProperty('location')) {
                        latitude = assignment.location.latitude;
                        longitude = assignment.location.longitude;
                    }
                    if (assignment && assignment.hasOwnProperty('location_zoom')) {
                        zoom = assignment.location_zoom;
                    }

                    //checking if user preference is set
                    if (typeof $scope.current.user_preferences === 'object') {

                        //if user preference has default view
                        if (typeof $scope.current.user_preferences.default_map_views === 'object') {
                            var default_map_view = _.find($scope.current.user_preferences.default_map_views, function (view) {
                                return (view.ministry_id === $scope.current.assignment.ministry_id);
                            });
                            if (typeof default_map_view !== 'undefined') {
                                //overriding default view by user preference
                                latitude = default_map_view.location.latitude;
                                longitude = default_map_view.location.longitude;
                                zoom = default_map_view.location_zoom;
                            }
                        }
                    }

                    //lastly set map view
                    if (typeof latitude !== 'undefined' && typeof longitude !== 'undefined' && typeof zoom !== 'undefined') {
                        $scope.map.setCenter(new google.maps.LatLng(latitude, longitude));
                        $scope.map.setZoom(parseInt(zoom));
                    }

                }
            }, true);
        }//end init function

        //if user changes ministry
        $scope.$watch('current.assignment.ministry_id', function (ministry_id) {
            if (typeof ministry_id === 'undefined') {
                $scope.trainings = [];
            } else {
                sendAnalytics();
                $scope.loadTrainings();
                $scope.isTargetCitiesVisible = isTargetCityVisible();
                $scope.loadTargetCities();
            }
        });

        $scope.$watch('map_scope_filter', function (filter) {
            $scope.loadChurches();
            $scope.loadTrainings();
        });

        //if user changes mcc
        $scope.$watch('current.mcc', function (mcc) {
            if (typeof mcc === 'undefined') {
                $scope.trainings = [];
            } else {
                sendAnalytics();
                $scope.loadChurches();
                $scope.loadTrainings();
                $scope.isTargetCitiesVisible = isTargetCityVisible();
                $scope.loadTargetCities();
            }
        });

        //hit the API and update scope with response
        $scope.loadTargetCities = _.debounce(function () {
            //some additional checks
            if ($scope.isTargetCitiesVisible && typeof $scope.current.assignment !== 'undefined' && $scope.current.mcc === 'llm' && $scope.current.assignment.area_code !== 'undefined') {
                var bounds = $scope.map.getBounds(),
                    ne = bounds.getNorthEast(),
                    sw = bounds.getSouthWest(),
                    params = {
                        lat_min: sw.lat(),
                        lat_max: ne.lat(),
                        long_min: sw.lng(),
                        long_max: ne.lng(),
                        period: $scope.current.period.format('YYYY-MM'),
                        area_code: $scope.current.assignment.area_code
                    };
                TargetCity.searchTargetCities(params)
                    .success(function (response) {
                        $scope.targetCities = response
                    })
                    .error(function (e) {
                        growl.error('Unable to load target cities');
                    })
            }
            else {
                $scope.targetCities = [];
            }
        }, 500);

        $scope.loadTrainings = _.debounce(function () {
            // Everyone can view trainings
            if (typeof $scope.current.assignment !== 'undefined' && $scope.current.mcc !== 'undefined') {
                Trainings.getTrainings($scope.current.sessionToken, $scope.current.assignment.ministry_id, $scope.current.mcc, $scope.show_all == "all", $scope.show_tree).then(function (trainings) {
                    $scope.trainings = trainings;
                }, $scope.onError);
            }
            else {
                $scope.trainings = [];
            }
        }, 500);

        $scope.loadChurches = _.debounce(function () {
            $scope.show_tree = false; //resetting show tree flag
            if (typeof $scope.current.assignment === 'undefined') return;

            var bounds = $scope.map.getBounds(),
                ne = bounds.getNorthEast(),
                sw = bounds.getSouthWest(),
                params = {
                    ministry_id: $scope.current.assignment.ministry_id,
                    lat_min: sw.lat(),
                    lat_max: ne.lat(),
                    long_min: sw.lng(),
                    long_max: ne.lng(),
                    period: $scope.current.period.format('YYYY-MM')
                };
            if (!$scope.iconFilters.target_point) params['hide_target_point'] = 'true';
            if (!$scope.iconFilters.group) params['hide_group'] = 'true';
            if (!$scope.iconFilters.church) params['hide_church'] = 'true';
            if (!$scope.iconFilters.mult_church) params['hide_mult_church'] = 'true';
            if ($scope.map_scope_filter === 'everything') {
                params['show_all'] = 'true';
                $scope.show_tree = true;
            } else if ($scope.map_scope_filter === 'tree') params['show_tree'] = 'true';

            // Disable clustering at Zoom 14 and higher
            if ($scope.map.getZoom() >= 14) params['should_cluster'] = 'false';

            Churches.getChurches(params).$promise.then($scope.onGetChurches, $scope.onError);
        }, 500);


        $scope.$watch('iconFilters.parent_lines', function () {
            if (typeof $scope.map !== 'undefined') {
                angular.forEach($scope.map.church_lines, function (line) {
                    line.setVisible($scope.iconFilters.parent_lines);
                });
            }
        });

        $scope.$watch('iconFilters.jesus_film', function () {
            if ($scope.iconFilters.jesus_film) {
                $('.jf_label').show();
            } else {
                $('.jf_label').hide();
            }
        });

        $scope.onAddChurch = function (church) {
            GoogleAnalytics.event('church', 'create', (function () {
                var dimensions = {};
                dimensions[GoogleAnalytics.DIM.guid] = $scope.current.user.key_guid;
                if (angular.isDefined($scope.current.assignment.ministry_id)) {
                    dimensions[GoogleAnalytics.DIM.ministry_id] = $scope.current.assignment.ministry_id;
                }
                if (angular.isDefined($scope.current.mcc)) {
                    dimensions[GoogleAnalytics.DIM.mcc] = $scope.current.mcc;
                }
                if (angular.isDefined($scope.current.period)) {
                    dimensions[GoogleAnalytics.DIM.period] = $scope.current.period.format('YYYY-MM');
                }
                dimensions[GoogleAnalytics.DIM.church_id] = church.id;
                return dimensions;
            })());
            $scope.loadChurches();
        };
        //creating new church icon, hit the API
        $scope.addChurch = function () {
            $scope.newChurchWindow.close();
            angular.forEach($scope.map.markers, function (m) {

                if (m.id == -1) {
                    $scope.new_church.ministry_id = $scope.current.assignment.ministry_id;

                    $scope.new_church.latitude = m.getPosition().lat();
                    $scope.new_church.longitude = m.getPosition().lng();

                    Churches.addChurch($scope.new_church).$promise.then($scope.onAddChurch, $scope.onError);

                    m.setMap(null);
                    var removedObject = $scope.map.markers.splice($scope.map.markers.indexOf(m), 1);

                    removedObject = null;
                }
            });
        };
        //create new training icon, hit the API
        $scope.addTraining = function () {
            angular.forEach($scope.map.markers, function (m) {

                if (m.id == -2) {
                    $scope.new_training.ministry_id = $scope.current.assignment.ministry_id;
                    $scope.new_training.latitude = m.getPosition().lat();
                    $scope.new_training.longitude = m.getPosition().lng();
                    $scope.new_training.mcc = $scope.current.mcc;
                    Trainings.addTraining($scope.current.sessionToken, $scope.new_training).then(
                        $scope.loadTrainings,
                        $scope.onError
                    );

                    m.setMap(null);
                    var removedObject = $scope.map.markers.splice($scope.map.markers.indexOf(m), 1);

                    removedObject = null;
                }
            });
        };
        //create new target city, hit the API
        $scope.addTargetCity = function (new_targetCity) {
            angular.forEach($scope.map.markers, function (m) {

                if (m.id == -3) {
                    new_targetCity.latitude = m.getPosition().lat();
                    new_targetCity.longitude = m.getPosition().lng();
                    new_targetCity.period = $scope.current.period.format('YYYY-MM');
                    //send current ministry area_code to server
                    if($scope.current.assignment.area_code !== 'GLBL'){
                        new_targetCity.area_code = $scope.current.assignment.area_code;
                    }

                    TargetCity.createTargetCity(new_targetCity)
                        .success(function () {
                            growl.success('Target city was created successfully');
                            new_targetCity = {};
                            //refresh target city icons
                            $scope.loadTargetCities();
                        }).error(function (e) {
                            if (e.status === 400) {
                                growl.error('Bad Request: Unable to create target city');
                            } else {
                                growl.error('Error: Unable to create target city');
                            }

                        });

                    m.setMap(null);
                    var removedObject = $scope.map.markers.splice($scope.map.markers.indexOf(m), 1);

                    removedObject = null;
                }
            })
        };

        $scope.cancelAddNewIcon = function () {
            angular.forEach($scope.map.markers, function (m) {
                //cause all dialog windows has ids like -1,-2,-3
                if (m.id < 0) {

                    m.setMap(null);
                    var removedObject = $scope.map.markers.splice($scope.map.markers.indexOf(m), 1);

                    removedObject = null;
                }
            });
            $scope.new_church = {};
            $scope.new_training = {};
            $scope.new_targetCity = {};
        };
        //show create new training dialog
        $scope.onAddTraining = function () {
            if ($scope.map.markers.filter(function (c) {
                    return c.id < 0
                }).length == 0) {
                $scope.new_training = {};

                var marker = new MarkerWithLabel({
                    position: $scope.map.getCenter(),
                    map: $scope.map,
                    title: "new_training",
                    id: -2,
                    cluster_count: 1,
                    zIndex: 9999,
                    icon: $scope.map.icons.training,
                    labelContent: 'MOVE ME!',
                    labelAnchor: new google.maps.Point(50, -5),
                    labelClass: "labelMoveMarker", // the CSS class for the label
                    labelInBackground: false,
                    draggable: true
                });

                marker.setAnimation(google.maps.Animation.BOUNCE);

                if (!$scope.newTrainingWindow.getContent()) {
                    $scope.newTrainingWindow.setContent($scope.newTrainingContent[0].nextSibling);
                }
                $scope.newTrainingWindow.open($scope.map, marker);

                $scope.map.markers.push(marker);
            }
        };
        //show create new target city dialog
        $scope.onAddTargetCity = function () {
            if ($scope.map.markers.filter(function (c) {
                    return c.id < 0
                }).length == 0) {
                $scope.new_targetCity = {};

                var marker = new MarkerWithLabel({
                    position: $scope.map.getCenter(),
                    map: $scope.map,
                    title: "new_targetCity",
                    id: -3, //unique id for each type of icons used on the map
                    cluster_count: 1,
                    zIndex: 9999,
                    icon: $scope.map.icons.targetCity,
                    labelContent: 'MOVE ME!',
                    labelAnchor: new google.maps.Point(50, -5),
                    labelClass: "labelMoveMarker", // the CSS class for the label
                    labelInBackground: false,
                    draggable: true
                });
                marker.setAnimation(google.maps.Animation.BOUNCE);

                if (!$scope.newTargetCityWindow.getContent()) {
                    $scope.newTargetCityWindow.setContent($scope.newTargetCityContent[0].nextSibling);
                }
                $scope.newTargetCityWindow.open($scope.map, marker);
                //get iso countries if not loaded yet
                getISOCountries();
                $scope.map.markers.push(marker);
            }
        };

        function getISOCountries() {

            //don't not hit api if we already have ISOCountries
            if (typeof $scope.ISOCountries !== 'undefined' && $scope.ISOCountries.length !== 0) {
                return $scope.ISOCountries;
            } else {
                ISOCountries.getCountries()
                    .success(function (response) {
                        $scope.ISOCountries = response;
                        $scope.ISOCountries = _.sortBy($scope.ISOCountries, 'name');
                    })
                    .error(function () {
                        growl.error('Unable to load country codes');
                    });
            }

        }

        $scope.onSaveChurch = function (response) {
            $scope.loadChurches();
        };
        // show create new church icon dialog
        $scope.onAddIcon = function () {
            if ($scope.map.markers.filter(function (c) {
                    return c.id < 0
                }).length == 0) {
                $scope.new_church = {security: 2};

                var marker = new MarkerWithLabel({
                    position: $scope.map.getCenter(),
                    map: $scope.map,
                    title: "new church",
                    id: -1,
                    cluster_count: 1,
                    zIndex: 9999,
                    icon: $scope.map.icons.targetpoint,
                    labelContent: 'Move me!',
                    labelAnchor: new google.maps.Point(50, -20),
                    labelClass: "labelMoveMarker", // the CSS class for the label
                    labelInBackground: false,
                    draggable: true
                });

                marker.setAnimation(google.maps.Animation.BOUNCE);
                //$scope.$apply();
                if (!$scope.newChurchWindow.getContent()) {
                    $scope.newChurchWindow.setContent($scope.newChurchWindowContent[0].nextSibling);
                }
                $scope.newChurchWindow.open($scope.map, marker);

                $scope.map.markers.push(marker);
            }
        };

        $scope.SetParent = function () {
            $scope.SetParentMode = true;
            $scope.churchWindow.close();
            $scope.new_parentLine = new google.maps.Polyline({
                path: [new google.maps.LatLng($scope.edit_church.latitude, $scope.edit_church.longitude), new google.maps.LatLng($scope.edit_church.latitude, $scope.edit_church.longitude)],
                geodesic: true,
                strokeColor: '#777',
                strokeOpacity: 1.0,
                strokeWeight: 2,
                icons: [{
                    icon: {
                        path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
                        strokeWeight: 1.5
                    },
                    offset: '12px',
                    repeat: '25px'
                }]
            });

            $scope.move_event = google.maps.event.addListener($scope.map, 'mousemove', function (e) {
                $scope.new_parentLine.setPath([e.latLng, new google.maps.LatLng($scope.edit_church.latitude, $scope.edit_church.longitude)]);
            });

            $scope.new_parentLine.setMap($scope.map);
        };

        $scope.RemoveParent = function () {
            $scope.churchWindow.close();
            $scope.edit_church.parent_id = null;
            $scope.edit_church.parents = [];
            Churches.saveChurch({
                id: $scope.edit_church.id,
                parent_id: -1
            }).$promise.then($scope.onSaveChurch, $scope.onError);

        };

        $scope.makeMovableIcon = {

            MoveChurch: function () {
                angular.forEach($scope.map.markers, function (m) {
                    if (m.id === $scope.edit_church.id) {
                        m.setAnimation(google.maps.Animation.BOUNCE);
                        m.setDraggable(true);
                        $scope.churchWindow.close();
                    }
                });
            },
            MoveTraining: function () {
                var id = $scope.edit_training.id;
                angular.forEach($scope.map.markers, function (m) {
                    if (m.id === 't' + id) {
                        m.setAnimation(google.maps.Animation.BOUNCE);
                        m.setDraggable(true);
                        $scope.trainingWindow.close();
                    }
                });
            },
            MoveTargetCity: function () {
                var id = $scope.edit_targetCity.target_city_id;
                angular.forEach($scope.map.markers, function (m) {
                    if (m.id === 'c' + id) {
                        m.setAnimation(google.maps.Animation.BOUNCE);
                        m.setDraggable(true);
                        $scope.targetCityWindow.close();
                    }
                });
            }

        };

        $scope.updateChurch = function () {
            $scope.churchWindow.close();
            Churches.saveChurch($scope.edit_church).$promise.then($scope.onSaveChurch, $scope.onError);
        };

        $scope.DeleteChurch = function () {

            //before delete opening a confirmation dialog
            $modal.open({
                templateUrl: 'partials/map/_confirmation-dialog.html',
                controller: confirmModalCtrl
            }).result.then(function (result) {
                    // Set end_date to the last day of the previous month
                    $scope.edit_church.end_date = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
                    Churches.saveChurch($scope.edit_church).$promise.then($scope.onSaveChurch, $scope.onError);
                });
        };

        $scope.updateTraining = function () {
            Trainings.updateTraining($scope.current.sessionToken, $scope.edit_training).then($scope.onSaveChurch, $scope.onError);
            $scope.trainingWindow.close();
        };

        $scope.updateTrainingCompletion = function (data) {
            Trainings.updateTrainingCompletion($scope.current.sessionToken, data).then(function () {
                growl.success('Training was updated');
            }, $scope.onError);
        };

        $scope.updateTargetCity = function (targetCity) {
            //send current ministry area_code to server
            if($scope.current.assignment.area_code !== 'GLBL'){
                targetCity.area_code = $scope.current.assignment.area_code;
            }
            TargetCity.updateTargetCity(targetCity)
                .success(function (response) {
                    growl.success('Target City was updated');
                }).error(function (e) {
                    growl.error('Unable to update target city');
                });
            $scope.targetCityWindow.close();
        };

        $scope.$watch('trainings', function () {
            if ($scope.map) {
                load_training_markers();
            }
        });

        function load_training_markers() {
            if (typeof $scope.map === 'undefined') return;
            var toDelete = [];

            angular.forEach($scope.map.markers, function (training) {
                if (training.id[0] == 't' && $scope.trainings.filter(function (t) {
                        return t.id == training.id
                    }).length == 0) {
                    toDelete.push(training);
                }
                else if (training.id[0] == 't' && !$scope.iconFilters.training) toDelete.push(training);
            });

            angular.forEach(toDelete, function (training) {
                training.setMap(null);
                var removedObject = $scope.map.markers.splice($scope.map.markers.indexOf(training), 1);
                removedObject = null;
            });

            if ($scope.iconFilters.training) {
                angular.forEach($scope.trainings, function (training) {
                    if ($scope.map.markers.filter(function (c) {
                            return c.id === 't' + training.id
                        }).length == 0) {
                        if (training.longitude) {
                            var marker = new MarkerWithLabel({
                                position: new google.maps.LatLng(training.latitude, training.longitude),
                                map: $scope.map,
                                id: 't' + training.id,
                                title: training.type,
                                icon: $scope.map.icons.training,
                                labelContent: '', //training.type + '<span class="map-trained-count">' + training.leaders_trained + '</span>',
                                labelAnchor: new google.maps.Point(30, 0),
                                labelClass: "labelMarker", // the CSS class for the label
                                labelInBackground: false,
                                draggable: false
                            });
                            if (!$scope.trainingWindow.getContent()) {
                                $scope.trainingWindow.setContent($scope.trainingWindowContent[0].nextSibling);
                            }

                            google.maps.event.addListener(marker, 'click', (function (training, marker) {
                                return function () {
                                    $scope.edit_training = training;

                                    //checking if training is editable
                                    $scope.edit_training.editable = false;

                                    var parent_ids = getParentMinistryIds($scope.current.assignments, $scope.edit_training);

                                    //if training ministry id is child or equal to parent id
                                    var parent_id = _.find(parent_ids, function (id) {
                                        return id === $scope.current.assignment.ministry_id;
                                    });

                                    //checking if parent id is not empty
                                    if (typeof parent_id !== 'undefined') {

                                        //if training ministry id is same as parent id
                                        if ($scope.edit_training.ministry_id === parent_id) {

                                            if ($scope.edit_training.created_by === $scope.current.user.person_id || isLeaderAdmin() === true) {
                                                $scope.edit_training.editable = true;
                                            }

                                            //case for parent ministry trying to edit(checking user role before giving permission)
                                        } else if (isLeaderAdmin() === true) {
                                            $scope.edit_training.editable = true;
                                        }
                                    }

                                    $scope.$apply();
                                    $scope.trainingWindow.close();
                                    $scope.trainingWindow.setOptions({maxWidth: 400});
                                    $scope.trainingWindow.open($scope.map, marker);

                                }
                            }(training, marker, $scope)));

                            google.maps.event.addListener(marker, 'dragend', (function () {
                                training.latitude = marker.getPosition().lat();
                                training.longitude = marker.getPosition().lng();
                                Trainings.updateTraining($scope.current.sessionToken, training).then($scope.onSaveChurch, $scope.onError);
                                marker.setAnimation(null);
                                marker.setDraggable(false);
                            }));

                            $scope.map.markers.push(marker);
                        }
                    }
                });
            }
        }

        //watch for icon filters
        $scope.$watch('iconFilters.training', load_training_markers, true);
        $scope.$watch('iconFilters.targetCity', function () {
            load_target_city_markers();
        }, true);

        //watch for server response
        $scope.$watch('targetCities', function () {
            if ($scope.map) {
                load_target_city_markers();
            }
        });

        function load_target_city_markers() {
            if (typeof $scope.map === 'undefined') return;
            //note: using 'c' as a prefix in target city markers id
            var toDelete = [];
            //collect cities to be deleted
            angular.forEach($scope.map.markers, function (targetCity) {
                if (targetCity.id[0] == 'c' && $scope.targetCities.filter(function (t) {
                        return targetCity.id === 'c' + t.target_city_id;
                    }).length == 0) {
                    toDelete.push(targetCity);
                }
                else if (targetCity.id[0] == 'c' && !$scope.iconFilters.targetCity) toDelete.push(targetCity);
            });
            //remove target cities from markers
            angular.forEach(toDelete, function (targetCity) {
                targetCity.setMap(null);
                var removedObject = $scope.map.markers.splice($scope.map.markers.indexOf(targetCity), 1);
                removedObject = null;
            });

            if ($scope.isTargetCitiesVisible && $scope.iconFilters.targetCity) {
                angular.forEach($scope.targetCities, function (targetCity) {
                    if ($scope.map.markers.filter(function (c) {
                            return c.id === 'c' + targetCity.target_city_id;
                        }).length == 0) {
                        if (targetCity.longitude) {
                            var marker = new MarkerWithLabel({
                                position: new google.maps.LatLng(targetCity.latitude, targetCity.longitude),
                                map: $scope.map,
                                id: 'c' + targetCity.target_city_id,
                                title: targetCity.name,
                                icon: $scope.map.icons.targetCity,
                                labelContent: '',
                                labelAnchor: new google.maps.Point(30, 0),
                                labelClass: "labelMarker", // the CSS class for the label
                                labelInBackground: false,
                                draggable: false
                            });
                            if (!$scope.targetCityWindow.getContent()) {
                                $scope.targetCityWindow.setContent($scope.targetCityWindowContent[0].nextSibling);
                            }
                            //register events on icon/marker
                            google.maps.event.addListener(marker, 'click', (function (targetCity, marker) {
                                return function () {
                                    $scope.edit_targetCity = targetCity;

                                    $scope.$apply();
                                    $scope.targetCityWindow.close();
                                    $scope.targetCityWindow.setOptions({maxWidth: 300});

                                    getISOCountries();
                                    $scope.targetCityWindow.open($scope.map, marker);

                                }
                            }(targetCity, marker, $scope)));

                            //update marker lat and lang (position) upon drag
                            google.maps.event.addListener(marker, 'dragend', (function () {
                                targetCity.latitude = marker.getPosition().lat();
                                targetCity.longitude = marker.getPosition().lng();

                                TargetCity.updateTargetCity(targetCity)
                                    .success(function (response) {
                                        growl.success('Target city position was updated');
                                    }).error(function (e) {
                                        growl.error('Unable to update target city')
                                    });
                                marker.setAnimation(null);
                                marker.setDraggable(false);
                            }));

                            $scope.map.markers.push(marker);
                        }
                    }
                });
            }

        }

        $scope.onGetChurches = function (response) {
            if ($scope.current.mcc === 'gcm') {
                $scope.churches = response;
            } else {
                response = [];
                $scope.churches = [];
            }

            //remove church lines
            angular.forEach($scope.map.church_lines, function (l) {
                l.setMap(null);
            });
            //remove jesus film rectangle labels
            $('.jf_label').remove();
            // $scope.map.markers = [];

            // do more intelligent replace
            //remove elements that are not in the new one.
            var toDelete = [];

            angular.forEach($scope.map.markers, function (church) {
                if (church.id > 0) {
                    if (response.filter(function (c) {
                            return c.id == church.id && c.cluster_count == 1
                        }).length == 0 || church.cluster_count > 1) {
                        toDelete.push(church);
                    }
                }
            });

            angular.forEach(toDelete, function (church) {

                //var church = $scope.map.markers.filter(function (c) { return c.id == toDelete[i] });

                church.setMap(null);
                var removedObject = $scope.map.markers.splice($scope.map.markers.indexOf(church), 1);

                removedObject = null;
            });


            angular.forEach($scope.churches, function (church) {
                if ($scope.map.markers.filter(function (c) {
                        return c.id == church.id
                    }).length == 0) {
                    var marker = {};

                    if (church.cluster_count == 1) {
                        var churchIconToUse = {};
                        if (church.development == 5) {
                            churchIconToUse = $scope.map.icons.multiplying;
                        }
                        else if (church.development == 4) {
                            churchIconToUse = $scope.map.icons.church;
                        }
                        else if (church.development == 3) {
                            churchIconToUse = $scope.map.icons.church;
                        }
                        else if (church.development == 2) {
                            churchIconToUse = $scope.map.icons.group;
                        }
                        else if (church.development == 1) {
                            churchIconToUse = $scope.map.icons.targetpoint;
                        }
                        else {
                            churchIconToUse = $scope.map.icons.church;
                        }

                        marker = new MarkerWithLabel({
                            position: new google.maps.LatLng(church.latitude, church.longitude),
                            map: $scope.map,
                            title: church.name,
                            id: church.id,
                            cluster_count: church.cluster_count,
                            icon: churchIconToUse,
                            labelContent: church.name,
                            labelAnchor: new google.maps.Point(30, 0),
                            labelClass: "labelMarker", // the CSS class for the label
                            labelInBackground: false,
                            draggable: false
                        });
                        if (church.jf_contrib > 1) church.jf = new $scope.jesusFilmSign(new google.maps.LatLng(church.latitude, church.longitude), church.jf_contrib, church.development);
                    }
                    else {
                        marker = new MarkerWithLabel({
                            position: new google.maps.LatLng(church.latitude, church.longitude),
                            map: $scope.map,
                            id: church.id,
                            cluster_count: church.cluster_count,
                            icon: $scope.map.icons.cluster,
                            labelContent: church.cluster_count.toString(),
                            labelAnchor: new google.maps.Point(30, 15),
                            labelClass: "clusterMarker", // the CSS class for the label
                            labelInBackground: false

                        });
                        if (church.jf_contrib > 1) church.jf = new $scope.jesusFilmSign(new google.maps.LatLng(church.latitude, church.longitude), church.jf_contrib, 'cluster');

                    }
                    if (!$scope.churchWindow.getContent()) {
                        $scope.churchWindow.setContent($scope.churchWindowContent[0].nextSibling);
                    }

                    google.maps.event.addListener(marker, 'click', (function (church, marker) {
                        return function () {
                            if ($scope.SetParentMode) {
                                if (church.cluster_count == 1 && church.id !== $scope.edit_church.id && !_.contains(church.parents, $scope.edit_church.id)) {
                                    google.maps.event.removeListener($scope.move_event);
                                    $scope.SetParentMode = false;
                                    $scope.new_parentLine.setPath([new google.maps.LatLng(church.latitude, church.longitude), new google.maps.LatLng($scope.edit_church.latitude, $scope.edit_church.longitude)]);
                                    //update church's parent
                                    var new_church = {};
                                    new_church.id = $scope.edit_church.id;
                                    new_church.parent_id = church.id;
                                    $scope.edit_church.parent_id = church.id;
                                    $scope.edit_church.parents = [church.id];
                                    Churches.saveChurch(new_church).$promise.then($scope.onSaveChurch, $scope.onError);
                                }
                                else {
                                    google.maps.event.removeListener($scope.move_event);
                                    $scope.SetParentMode = false;
                                    $scope.new_parentLine.setMap(null);
                                }
                                return;
                            }

                            if (church.cluster_count == 1) {
                                $scope.edit_church = church;
                                $scope.edit_church.jf_contrib = ($scope.edit_church.jf_contrib >= 1 ); //setting boolean value to check box

                                //checking if church is editable
                                $scope.edit_church.editable = false;
                                var parent_ids = getParentMinistryIds($scope.current.assignments, $scope.edit_church);

                                //if training ministry id is child or equal to parent id
                                var parent_id = _.find(parent_ids, function (id) {
                                    return id === $scope.current.assignment.ministry_id;
                                });

                                //checking if parent id is not empty
                                if (typeof parent_id !== 'undefined') {

                                    //if training ministry id is same as parent id
                                    if ($scope.edit_church.ministry_id === parent_id) {

                                        if ($scope.edit_church.created_by === $scope.current.user.person_id || isLeaderAdmin() === true) {
                                            $scope.edit_church.editable = true;
                                        }

                                        //case for parent ministry trying to edit(checking user role before giving permission)
                                    } else if (isLeaderAdmin() === true) {
                                        $scope.edit_church.editable = true;
                                    }
                                }

                                $scope.$apply();
                                $scope.churchWindow.close();
                                $scope.churchWindow.setOptions({maxWidth: 300});
                                $scope.churchWindow.open($scope.map, marker);
                            }
                            else {
                                $scope.map.setCenter(marker.position);
                                $scope.map.setZoom($scope.map.getZoom() + 2);
                            }
                        }
                    }(church, marker, $scope)));

                    google.maps.event.addListener(marker, 'dragend', (function (church, marker) {
                        return function () {

                            if (church.cluster_count == 1) {
                                var new_church = {};
                                new_church.id = church.id;
                                new_church.latitude = marker.getPosition().lat();
                                new_church.longitude = marker.getPosition().lng();
                                church.latitude = new_church.latitude;
                                church.longitude = new_church.longitude;
                                Churches.saveChurch(new_church).$promise.then($scope.onSaveChurch, $scope.onError);

                                marker.setAnimation(null);
                                marker.setDraggable(false);
                            }

                        }
                    }(church, marker)));
                    $scope.map.markers.push(marker);
                }


                //now create the parent lines
                angular.forEach(church.parents, function (p) {
                    var par = $scope.churches.filter(function (c) {
                        return c.id == p
                    });
                    if (par.length > 0) {
                        var parentLine = new google.maps.Polyline({
                            path: [new google.maps.LatLng(par[0].latitude, par[0].longitude), new google.maps.LatLng(church.latitude, church.longitude)],
                            geodesic: true,
                            strokeColor: '#777',
                            strokeOpacity: 1.0,
                            strokeWeight: 2,
                            icons: [{
                                icon: {
                                    path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
                                    strokeWeight: 1.5
                                },
                                offset: '12px',
                                repeat: '25px'
                            }]
                        });
                        parentLine.setMap($scope.map);
                        $scope.map.church_lines.push(parentLine);
                    }
                });


            });


        };


        $scope.jesusFilmSign = function (coordinates, n, type) {
            this.div_ = null;
            this.setMap($scope.map);
            if (n == 1) n = "JF";

            // onADD
            this.onAdd = function () {
                var div = document.createElement('div');
                div.className = 'jf_label';
                div.innerHTML = n;
                this.div_ = div;
                var panes = this.getPanes();
                panes.overlayMouseTarget.appendChild(div);
            };

            // draw
            this.draw = function () {
                var div = this.div_;
                var overlayProjection = this.getProjection();
                var position = overlayProjection.fromLatLngToDivPixel(coordinates);

                // displacement of sign
                var x;
                var y;

                if (type == 'cluster') {
                    x = -20;
                    y = 8;
                }

                else if (type >= 0 && type <= 1) {
                    x = -23;
                    y = -12;
                }

                else if (type == 2) {
                    x = -22;
                    y = -13;
                }

                else if (type >= 3) {
                    x = -20;
                    y = -13;
                }

                else {
                    x = 0;
                    y = 0;
                }

                div.style.left = position.x + x + "px";
                div.style.top = position.y + y + "px";
            };

            this.onRemove = function () {
                this.div_.parentNode.removeChild($scope.div_);
                this.div_ = null;
            }
        };
        $scope.jesusFilmSign.prototype = new google.maps.OverlayView();

        $scope.addTrainingStage = function (training) {
            var newPhase = {
                phase: training.current_stage,
                date: training.insert.date,
                number_completed: training.insert.number_completed,
                training_id: training.id

            };
            Trainings.addTrainingCompletion($scope.current.sessionToken, newPhase).then($scope.onAddTrainingCompletion, $scope.onError);

            training.insert.date = "";
            training.insert.number_completed = 0;

        };

        $scope.onAddTrainingCompletion = function (response) {
            response.editMode = false;
            growl.success('Training was saved successfully');
            angular.forEach($scope.trainings, function (training) {
                var id = training.hasOwnProperty('Id') ? training.Id : training.id;
                if (id == response.training_id) {
                    training.gcm_training_completions.push(response);
                    training.current_stage = response.phase + 1;
                }
            });
        };

        //function deletes the training
        $scope.DeleteTraining = function () {

            //opening a confirmation dialog before deleting
            $modal.open({
                templateUrl: 'partials/map/_confirmation-dialog.html',
                controller: confirmModalCtrl
            }).result.then(function (result) {

                    Trainings.deleteTraining($scope.current.sessionToken, $scope.edit_training)
                        .then(function (data) {
                            growl.success('Training was deleted successfully');
                            $scope.trainingWindow.close();
                            //When status code 204
                            $scope.loadTrainings();
                        }, $scope.onError)
                        .catch(function (error) {
                            // Failed

                        });
                });
        };

        //function deletes the target city
        $scope.DeleteTargetCity = function (target_city) {

            //opening a confirmation dialog before deleting
            $modal.open({
                templateUrl: 'partials/map/_confirmation-dialog.html',
                controller: confirmModalCtrl
            }).result.then(function (result) {

                    TargetCity.deleteTargetCity(target_city.target_city_id)
                        .success(function (data) {
                            growl.success('Target city was deleted successfully');
                            $scope.targetCityWindow.close();
                            $scope.loadTargetCities();
                        })
                        .error(function (e) {
                            growl.error('Unable to delete target city');

                        });
                });
        };

        //function deletes stages of training
        $scope.deleteTrainingComplete = function (training_complete, index) {

            //opening a confirmation dialog before deleting
            $modal.open({
                templateUrl: 'partials/map/_confirmation-dialog.html',
                controller: confirmModalCtrl
            }).result.then(function (result) {

                    Trainings.deleteTrainingCompletion($scope.current.sessionToken, training_complete)
                        .then(function (data) {
                            growl.success('Training stage was deleted successfully');
                            $scope.edit_training.gcm_training_completions.splice(index, 1);
                        }, $scope.onError)
                        .catch(function (error) {
                            // Failed
                        });
                });
        };

        $scope.setMyDefaultMapView = function () {

            var center = $scope.map.getCenter();

            //save user preference
            var post_data = {
                "default_map_views": [{
                    "ministry_id": $scope.current.assignment.ministry_id,
                    "location": {
                        "latitude": center.lat(),
                        "longitude": center.lng()
                    },
                    "location_zoom": $scope.map.getZoom()
                }
                ]
            };
            //save user preference
            UserPreference.savePreference(post_data).success(function (data) {
                growl.success('Your default map view has been set');
                $scope.current.user_preferences = data;
            }, function () {
                growl.error('Unable to save default map view');
            });

        };

        $scope.setMinistryDefaultView = function () {
            var center = $scope.map.getCenter();

            // Save changes to API
            Ministries.updateMinistry({
                ministry_id: $scope.current.assignment.ministry_id,
                min_code: $scope.current.assignment.min_code.trim(),
                location: {
                    latitude: center.lat(),
                    longitude: center.lng()
                },
                location_zoom: $scope.map.getZoom()
            }, function (d) {
                growl.success('Default ministry map view has been set');
            }, function () {
                growl.error('Unable to save default map view');
            });
        };

        $scope.myLocation = function () {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    $scope.map.setCenter(center);
                    $scope.map.setZoom(15);
                }, function () {
                    growl.error('Failed to get your current location')
                });
            }
            else {
                growl.error('Your browser does not support GeoLocation')
            }
        };

        //function creates array of all parent ids of ministry id including id of item to check
        function getParentMinistryIds(assignments, item) {
            var ministries = UserPreference.getFlatMinistry(assignments);
            var ids = [];
            ids.push(item.ministry_id);
            parentId(item.ministry_id, ministries);
            ids = _.uniq(ids);
            return ids;

            //recursive parent id fetch loop function
            function parentId(id, ministries) {
                angular.forEach(ministries, function (ministry) {
                    if (ministry.ministry_id === id) {
                        ids.push(ministry.parent_id);
                        parentId(ministry.parent_id, ministries);
                    }
                });
            }
        };

        //function checks whether the current user is a leader/admin for current assignment
        function isLeaderAdmin() {
            return ($scope.current.hasRole(['admin', 'inherited_admin', 'leader', 'inherited_leader']));
        }

        function confirmModalCtrl($scope, $modalInstance) {
            $scope.yes = function () {
                $modalInstance.close(true);
            };

            $scope.no = function () {
                $modalInstance.dismiss('cancel');
            };
        }

        /**
         * Check if target cities can be view/create/edit
         * @returns {boolean}
         */
        function isTargetCityVisible() {
            //if no assignment return early
            if (typeof $scope.current.assignment === 'undefined') {
                return false;
            }
            //check for required role
            if (!$scope.current.hasRole(['admin', 'inherited_admin', 'leader', 'inherited-leader', 'member'])) {
                return false;
            }
            if (typeof $scope.current.mcc === 'undefined') {
                return false;
            }
            //only visible to llm
            if ($scope.current.mcc === 'llm') {
                //ministry must have an area code
                if (typeof $scope.current.assignment.area_code !== 'undefined' && typeof $scope.current.assignment.ministry_scope !== 'undefined') {
                    //ministry_scope should be 'Area' or 'Global'
                    if ($scope.current.assignment.ministry_scope == 'Area' || $scope.current.assignment.ministry_scope == 'National') {
                        return true;
                    }
                }
            }

            return false;
        }
    }

    angular.module('gma.controllers.map').controller('MapCtrl', MapCtrl);
})(jQuery);

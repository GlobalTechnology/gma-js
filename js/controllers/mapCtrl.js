
(function ($) {
    //Find existing Module instance named 'gcmApp'
    var app = angular.module("gcmApp");

    var map_controller = function ($scope, $document, $compile, church_service, training_service) {
        $scope.$parent.is_loaded = false;
        $scope.show_target_point = true;
        $scope.show_group = true;
        $scope.show_church = true;
        $scope.show_mult_church = true;
        $scope.show_training = true;
        $scope.show_lines = true;
        $scope.show_jf = true;
        $scope.map_filter = 'min_only';
        $scope.icon_add_mode = false;
        $scope.new_church = {};
        $scope.edit_church = {};
        $scope.SetParentMode = false;
        setTimeout(initialize, 0);




        function initialize() {

            $scope.map = new google.maps.Map(document.getElementById('map_canvas'), $scope.mapOptions);
            $scope.map.setOptions({ draggableCursor: '' });

            google.maps.event.addListener($scope.map, "idle", function () {
                $scope.$parent.is_loaded = true;
                if (typeof $scope.user.session_ticket !== 'undefined')
                    $scope.loadChurches();



            });
            $scope.map.markers = [];
            $scope.church = { name: "" };


            //   $scope.churchWindowContent = $compile('<div id="church_window_content" ng-include src="\'/gcm_app/partials/edit_church_window.html\'"></div>')($scope);
            //  console.log($scope.churchWindowContent);
            //$scope.churchWindowContent = $('#church_window')[0].innerHTML;// "<div class='church-window'><h3>{{name}}</h3></div>";

            $scope.churchWindow = new google.maps.InfoWindow();
            $scope.churchWindowContent = $compile('<div id="church_window_content" ng-include src="GCM_APP.app_url + \'/template/edit_church_window.html\'"></div>')($scope)
            $scope.churchWindow.setOptions({ maxWidth: 300 });
            $scope.trainingWindow = new google.maps.InfoWindow();
            $scope.trainingWindowContent = $compile('<div id="training_window_content" ng-include src="GCM_APP.app_url + \'/template/edit_training.html\'"></div>')($scope)
            $scope.trainingWindow.setOptions({ maxWidth: 400 });

            $scope.newChurchWindow = new google.maps.InfoWindow();
            google.maps.event.addListener($scope.newChurchWindow, 'closeclick', function () {
                $scope.cancelAddChurch();
            });
            $scope.newChurchWindowContent = $compile('<div id="new_church_window_content" ng-include src="GCM_APP.app_url + \'/template/new_church_window.html\'"></div>')($scope);


            $scope.newTrainingWindow = new google.maps.InfoWindow();
            google.maps.event.addListener($scope.newTrainingWindow, 'closeclick', function () {
                $scope.cancelAddChurch();
            });
            $scope.newTrainingContent = $compile('<div id="new_training_window_content" ng-include src="GCM_APP.app_url + \'/template/new_training.html\'"></div>')($scope);

            $scope.map.church_lines = [];
            $scope.map.icons = {};
            $scope.map.icons.churchIcon = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/churchicon.png', new google.maps.Size(45, 62), new google.maps.Point(0, 0), new google.maps.Point(22, 62));
            $scope.map.icons.mapClusterIcon = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/mapclusterfading.png', new google.maps.Size(60, 60), new google.maps.Point(0, 0), new google.maps.Point(30, 30));
            $scope.map.icons.icon5r = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/multipliedchurchicon_map.png', new google.maps.Size(52, 62), new google.maps.Point(0, 0), new google.maps.Point(25, 58));
            $scope.map.icons.icon5rl = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/multipliedchurchiconlock.png', new google.maps.Size(52, 65), new google.maps.Point(0, 0), new google.maps.Point(25, 61));
            $scope.map.icons.icon4r = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/multiplyingchurchicon.png', new google.maps.Size(52, 62), new google.maps.Point(0, 0), new google.maps.Point(25, 62));
            $scope.map.icons.icon4rl = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/multiplyingchurchiconlock.png', new google.maps.Size(52, 65), new google.maps.Point(0, 0), new google.maps.Point(25, 61));
            $scope.map.icons.icon4sh = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/multiplyingchurchshadow.png', new google.maps.Size(60, 48), new google.maps.Point(0, 0), new google.maps.Point(10, 46));
            $scope.map.icons.churchIconShadow = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/churchshadow.png', new google.maps.Size(59, 49), new google.maps.Point(0, 0), new google.maps.Point(10, 47));
            $scope.map.icons.churchIconLocked = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/churchiconlock.png', new google.maps.Size(45, 65), new google.maps.Point(0, 0), new google.maps.Point(22, 61));
            $scope.map.icons.groupRed = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/groupicon.png', new google.maps.Size(40, 44), new google.maps.Point(0, 0), new google.maps.Point(20, 44));
            $scope.map.icons.groupRedLocked = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/groupiconlock.png', new google.maps.Size(48, 47), new google.maps.Point(0, 0), new google.maps.Point(20, 43));
            $scope.map.icons.groupIconShadow = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/groupshadow.png', new google.maps.Size(49, 40), new google.maps.Point(0, 0), new google.maps.Point(10, 38));
            $scope.map.icons.targetRedIcon = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/targeticon.png', new google.maps.Size(23, 42), new google.maps.Point(0, 0), new google.maps.Point(12, 42));
            $scope.map.icons.targetRedLockedIcon = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/targeticonlock.png', new google.maps.Size(31, 46), new google.maps.Point(0, 0), new google.maps.Point(11, 42));
            $scope.map.icons.targetShadow = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/targetshadow.png', new google.maps.Size(33, 36), new google.maps.Point(0, 0), new google.maps.Point(4, 34));
            $scope.map.icons.visionRedIcon = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/vision.png', new google.maps.Size(23, 42), new google.maps.Point(0, 0), new google.maps.Point(11, 37));
            $scope.map.icons.visionRedLockedIcon = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/visionlocked.png', new google.maps.Size(31, 46), new google.maps.Point(0, 0), new google.maps.Point(15, 42));
            $scope.map.icons.trainingIcon = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/training.png', new google.maps.Size(30, 20), new google.maps.Point(0, 0), new google.maps.Point(15, 20));

            $scope.map.side = document.getElementById('side');
            $scope.map.side.index = -1;
            $scope.map.side.style.display = 'block';
            $scope.map.search = document.getElementById('map_controls');
            $scope.map.search.index = 3;
            $scope.map.search.style.display = 'block';

            $scope.map.controls[google.maps.ControlPosition.TOP_RIGHT].push($scope.map.side);
            $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push($scope.map.search);
            if($scope.assignment)$scope.load_training_markers();
            $scope.$watch('assignment', function (a) {

                if (a && a.hasOwnProperty('location')) {
                    $scope.map.setCenter(new google.maps.LatLng(a.location.latitude, a.location.longitude));

                }
                if (a && a.hasOwnProperty('location_zoom')) {
                    $scope.map.setZoom(parseInt(a.location_zoom));
                }

            }, true);
        }


        $scope.loadChurches = function () {
            console.log('loading churches');
            if (typeof $scope.user.session_ticket !== 'undefined') {
                var extras = '&ministry_id=' + $scope.assignment.ministry_id;
                if (!$scope.show_target_point) extras += '&hide_target_point=true';
                if (!$scope.show_group) extras += '&hide_group=true';
                if (!$scope.show_church) extras += '&hide_church=true';
                if (!$scope.show_mult_church) extras += '&hide_mult_church=true';
                if ($scope.map_filter === 'everything') extras += '&show_all=true';
                else if ($scope.map_filter === 'tree') extras += '&show_tree=true';
              



                church_service.getChurches($scope.user.session_ticket, $scope.map.getBounds(), extras).then($scope.onGetChurches, $scope.onError);

            }

        };


        $scope.mapOptions = {
            zoom: 10,
            center: new google.maps.LatLng(15.117368581249664, -90.09897668253325)
        };


        $scope.removeLines = function () {
            //angular.forEach($scope.map.markers, function (m) {
            //    m.setMap(map);
            //});
            angular.forEach($scope.map.church_lines, function (l) {
                l.setMap(null);
            });
        };
        $scope.removeJF = function () {
            //angular.forEach($scope.map.markers, function (m) {
            //    m.setMap(map);
            //});
            $('.jf_label').remove();
        };

        $scope.$watch('show_lines', function () {
            if (typeof $scope.map !== 'undefined') {
                angular.forEach($scope.map.church_lines, function (line) {
                    line.setVisible($scope.show_lines);
                });
            }
        });
        $scope.$watch('show_jf', function () {
            if ($scope.show_jf) $('.jf_label').show();
            else $('.jf_label').hide();
        });


      


        $scope.onAddChurch = function (response) {

            $scope.loadChurches();
        }

        $scope.addChurch = function () {
            angular.forEach($scope.map.markers, function (m) {

                if (m.id == -1) {
                    $scope.new_church.ministry_id = $scope.assignment.ministry_id;

                    $scope.new_church.latitude = m.getPosition().lat();
                    $scope.new_church.longitude = m.getPosition().lng();
                    console.log($scope.new_church)
                    church_service.addChurch($scope.user.session_ticket, $scope.new_church).then($scope.onAddChurch, $scope.onError);

                    m.setMap(null);
                    var removedObject = $scope.map.markers.splice($scope.map.markers.indexOf(m), 1);

                    removedObject = null;


                }
            });



        };



        $scope.addTraining = function () {
            angular.forEach($scope.map.markers, function (m) {

                if (m.id == -2) {
                    $scope.new_training.ministry_id = $scope.assignment.ministry_id;

                    $scope.new_training.latitude = m.getPosition().lat();
                    $scope.new_training.longitude = m.getPosition().lng();
                    $scope.new_training.mcc = $scope.assignment.mcc;
                    training_service.addTraining($scope.user.session_ticket, $scope.new_training).then($scope.onAddChurch, $scope.onError);


                    m.setMap(null);
                    var removedObject = $scope.map.markers.splice($scope.map.markers.indexOf(m), 1);

                    removedObject = null;


                }
            });



        };


        $scope.cancelAddChurch = function () {

            angular.forEach($scope.map.markers, function (m) {

                if (m.id < 0) {

                    m.setMap(null);
                    var removedObject = $scope.map.markers.splice($scope.map.markers.indexOf(m), 1);

                    removedObject = null;
                }
            });
            $scope.new_church = {};
            $scope.new_training = {};
        };

        $scope.onAddTraining = function () {

            if ($scope.map.markers.filter(function (c) { return c.id < 0 }).length == 0) {
                $scope.new_training = {};

                marker = new MarkerWithLabel({
                    position: $scope.map.getCenter(),
                    map: $scope.map,
                    title: "new_training",
                    id: -2,
                    cluster_count: 1,
                    zIndex: 9999,
                    icon: $scope.map.icons.trainingIcon,
                    labelContent: 'MOVE ME!',
                    labelAnchor: new google.maps.Point(50, -5),
                    labelClass: "labelMoveMarker", // the CSS class for the label
                    labelInBackground: false,
                    draggable: true
                });
                $scope.map.new_training_marker = marker;
                marker.setAnimation(google.maps.Animation.BOUNCE);

                if (!$scope.newTrainingWindow.getContent()) {
                    $scope.newTrainingWindow.setContent($scope.newTrainingContent[0].nextSibling);
                }
                $scope.newTrainingWindow.open($scope.map, marker);

                $scope.map.markers.push(marker);
            }

        };

        $scope.onSaveChurch = function (response) {
            $scope.loadChurches();
        };

        $scope.onAddIcon = function () {

            if ($scope.map.markers.filter(function (c) { return c.id < 0 }).length == 0) {
                $scope.new_church = {security: 2};

                marker = new MarkerWithLabel({
                    position: $scope.map.getCenter(),
                    map: $scope.map,
                    title: "new church",
                    id: -1,
                    cluster_count: 1,
                    zIndex: 9999,
                    icon: $scope.map.icons.targetRedIcon,
                    labelContent: 'Move me!',
                    labelAnchor: new google.maps.Point(50, -20),
                    labelClass: "labelMoveMarker", // the CSS class for the label
                    labelInBackground: false,
                    draggable: true
                });
                $scope.map.new_marker = marker;
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
            //   $scope.map.church_lines.push(parentLine);


        }
        $scope.MoveChurch = function () {
            angular.forEach($scope.map.markers, function (m) {

                if (m.id === $scope.edit_church.id) {
                    m.setAnimation(google.maps.Animation.BOUNCE);
                    m.setDraggable(true);
                    $scope.churchWindow.close();

                }
            });
        };
        $scope.MoveTraining = function () {

            angular.forEach($scope.map.markers, function (m) {

                if (m.id === 't' + $scope.edit_training.id) {
                    m.setAnimation(google.maps.Animation.BOUNCE);
                    m.setDraggable(true);

                    $scope.trainingWindow.close();
                }
            });
        };
        $scope.SaveChurch = function () {

            church_service.saveChurch($scope.user.session_ticket, $scope.edit_church).then($scope.onSaveChurch, $scope.onError);

        };
        $scope.SaveTraining = function () {

            training_service.updateTraining($scope.user.session_ticket, $scope.edit_training).then($scope.onSaveChurch, $scope.onError);

        };
        $scope.$watch('assignment.trainings', function () {
            if ($scope.map) {
                $scope.load_training_markers();
            }
        });
        $scope.load_training_markers = function () {


            var toDelete = [];
            angular.forEach($scope.map.markers, function (training) { if (training.id[0] == 't' && !$scope.show_training) toDelete.push(training); });
            angular.forEach(toDelete, function (training) {

                training.setMap(null);
                var removedObject = $scope.map.markers.splice($scope.map.markers.indexOf(training), 1);

                removedObject = null;
            });
            if ($scope.show_training) {
                angular.forEach($scope.assignment.trainings, function (training) {
                    if ($scope.map.markers.filter(function (c) { return c.id === 't' + training.id }).length == 0) {
                        if (training.longitude) {
                            var marker = {};
                            


                            marker = new MarkerWithLabel({
                                position: new google.maps.LatLng(training.latitude, training.longitude),
                                map: $scope.map,
                                id: 't' + training.id,
                                title: training.type,
                                icon: $scope.map.icons.trainingIcon,
                                labelContent: '', //training.type + '<span class="map-trained-count">' + training.leaders_trained + '</span>',
                                labelAnchor: new google.maps.Point(30, 0),
                                labelClass: "labelMarker", // the CSS class for the label
                                labelInBackground: false,
                                draggable: false
                            });
                            if (!$scope.trainingWindow.getContent())
                                $scope.trainingWindow.setContent($scope.trainingWindowContent[0].nextSibling);

                            google.maps.event.addListener(marker, 'click', (function (training, marker) {
                                return function () {

                                    //$scope.church = marker;

                                    $scope.edit_training = training;
                                    $scope.edit_training.editable = (($scope.assignment.team_role === 'leader' || $scope.assignment.team_role === 'inherited_leader') && training.ministry_id === $scope.assignment.ministry_id);

                                    $scope.$apply();
                                    $scope.trainingWindow.close();
                                    $scope.trainingWindow.setOptions({ maxWidth: 400 });
                                    $scope.trainingWindow.open($scope.map, marker);

                                    // $scope.churchWindow.open($scope.map, marker);


                                }
                            }(training, marker, $scope)));


                            google.maps.event.addListener(marker, 'dragend', (function () {

                                console.log(marker);
                                training.latitude = marker.getPosition().lat();
                                training.longitude = marker.getPosition().lng();
                                training_service.updateTraining($scope.user.session_ticket, training).then($scope.onSaveChurch, $scope.onError);

                                marker.setAnimation(null);
                                marker.setDraggable(false);



                            }));

                            $scope.map.markers.push(marker);

                        }
                    }
                });
            }

        };


        $scope.onGetChurches = function (response) {
            $scope.churches = response;
            console.log('got churches');


            $scope.removeLines();
            $scope.removeJF();
            // $scope.map.markers = [];

            // do more intelligent replace
            //remove elements that are not in the new one.
            var toDelete = [];

            angular.forEach($scope.map.markers, function (church) {
                if (church.id > 0) {
                    if (response.filter(function (c) { return c.id == church.id && c.cluster_count==1 }).length == 0 || church.cluster_count > 1) {

                        toDelete.push(church);

                    }
                }

            });

            angular.forEach(toDelete, function (church) {
                //console.log(toDelete)
                //var church = $scope.map.markers.filter(function (c) { return c.id == toDelete[i] });
                //console.log(church.length);
                church.setMap(null);
                var removedObject = $scope.map.markers.splice($scope.map.markers.indexOf(church), 1);

                removedObject = null;
            });

           

            angular.forEach($scope.churches, function (church) {
                if ($scope.map.markers.filter(function (c) { return c.id == church.id }).length == 0) {
                    var marker = {};



                    if (church.cluster_count == 1) {
                        var churchIconToUse = {}
                        if (church.development == 5) { churchIconToUse = $scope.map.icons.icon5r; }
                        else if (church.development == 4) { churchIconToUse = $scope.map.icons.icon4r; }
                        else if (church.development == 3) { churchIconToUse = $scope.map.icons.churchIcon; }
                        else if (church.development == 2) { churchIconToUse = $scope.map.icons.groupRed; }
                        else if (church.development == 1) { churchIconToUse = $scope.map.icons.targetRedIcon; }
                        else { churchIconToUse = $scope.map.iconsvisionRedIcon; }

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
                        if (church.jf_contrib > 0) church.jf = new $scope.jesusFilmSign(new google.maps.LatLng(church.latitude, church.longitude), church.jf_contrib, church.development);


                    }
                    else {
                        marker = new MarkerWithLabel({
                            position: new google.maps.LatLng(church.latitude, church.longitude),
                            map: $scope.map,
                            id: church.id,
                            cluster_count: church.cluster_count,
                            icon: $scope.map.icons.mapClusterIcon,
                            labelContent: church.cluster_count.toString(),
                            labelAnchor: new google.maps.Point(30, 15),
                            labelClass: "labelMarker map-cluster-count", // the CSS class for the label
                            labelInBackground: false

                        });
                        if (church.jf_contrib > 0) church.jf = new $scope.jesusFilmSign(new google.maps.LatLng(church.latitude, church.longitude), church.jf_contrib, 'cluster');

                    }
                    if (!$scope.churchWindow.getContent())
                        $scope.churchWindow.setContent($scope.churchWindowContent[0].nextSibling);


                    google.maps.event.addListener(marker, 'click', (function (church, marker) {
                        return function () {
                            if ($scope.SetParentMode) {
                                if (church.cluster_count == 1 && church.id !== $scope.edit_church.id) {
                                    google.maps.event.removeListener($scope.move_event);
                                    $scope.SetParentMode = false;
                                    $scope.new_parentLine.setPath([new google.maps.LatLng(church.latitude, church.longitude), new google.maps.LatLng($scope.edit_church.latitude, $scope.edit_church.longitude)]);
                                    //update church's parent
                                    var new_church = {};
                                    new_church.id = $scope.edit_church.id;
                                    new_church.parent_id = church.id;
                                    $scope.edit_church.parent_id = church.id;
                                    console.log(new_church);
                                    church_service.saveChurch($scope.user.session_ticket, new_church).then($scope.onSaveChurch, $scope.onError);


                                }

                                return;

                            }
                            //google.maps.event.addListener(marker, 'click', function () {
                            if (church.cluster_count == 1) {
                                //$scope.church = marker;

                                $scope.edit_church = church;
                                $scope.edit_church.editable = (($scope.assignment.team_role === 'leader' || $scope.assignment.team_role === 'inherited_leader') && church.ministry_id === $scope.assignment.ministry_id);

                                $scope.$apply();
                                $scope.churchWindow.close();
                                $scope.churchWindow.setOptions({ maxWidth: 300 });
                                $scope.churchWindow.open($scope.map, marker);

                                // $scope.churchWindow.open($scope.map, marker);
                            }
                            else {
                                $scope.map.setCenter(marker.position);
                                $scope.map.setZoom($scope.map.getZoom() + 2);
                            }
                        }
                    }(church, marker, $scope)));
                    google.maps.event.addListener(marker, 'dragend', (function (church, marker) {
                        return function () {

                            //google.maps.event.addListener(marker, 'click', function () {
                            if (church.cluster_count == 1) {
                                var new_church = {};
                                new_church.id = church.id;
                                new_church.latitude = marker.getPosition().lat();
                                new_church.longitude = marker.getPosition().lng();
                                church.latitude = new_church.latitude;
                                church.longitude = new_church.longitude;
                                church_service.saveChurch($scope.user.session_ticket, new_church).then($scope.onSaveChurch, $scope.onError);

                                marker.setAnimation(null);
                                marker.setDraggable(false);
                            }

                        }
                    }(church, marker)));
                    $scope.map.markers.push(marker);
                }


                //now create the parent lines
                angular.forEach(church.parents, function (p) {
                    var par = $scope.churches.filter(function (c) { return c.id == p });
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

            }

            // draw

            this.draw = function () {

                var div = this.div_;

                var overlayProjection = this.getProjection();

                var position = overlayProjection.fromLatLngToDivPixel(coordinates);

                // displacement of sign

                var x; var y;

                if (type == 'cluster') { x = -20; y = 8; }

                else if (type >= 0 && type <= 1) { x = -23; y = -12; }

                else if (type == 2) { x = -22; y = -13; }

                else if (type >= 3) { x = -20; y = -13; }

                else { x = 0; y = 0; }

                div.style.left = position.x + x + "px";

                div.style.top = position.y + y + "px";

            }



            this.onRemove = function () {

                this.div_.parentNode.removeChild($scope.div_);

                this.div_ = null;

            }

        }

        $scope.jesusFilmSign.prototype = new google.maps.OverlayView();

    };

    app.controller("mapController", ["$scope", "$document", "$compile", "church_service", "training_service", map_controller]);

})(jQuery);

(function($){
app.controller("gcmMapCtrl", function ($scope, $http, $timeout, church_service) {
    google.maps.event.addDomListener(window, 'load', initialize);
    function initialize() {

        $scope.map = new google.maps.Map(document.getElementById('map_canvas'), $scope.mapOptions);


        google.maps.event.addListener($scope.map, "idle", function () {
            console.log($scope.map.getBounds());

           if(typeof $scope.user.session_ticket !== 'undefined')
                church_service.getChurches($scope.user.session_ticket, $scope.map.getBounds()).then($scope.onGetChurches, $scope.onError);
              


        });
        $scope.map.markers = [];
        $scope.church = { name: "" };

        $scope.churchWindowContent = "<div class='church-window'><h3>{{name}}</h3></div>";
        
        $scope.churchWindow = new google.maps.InfoWindow({ content: $scope.churchWindowContent });

        $scope.map.church_lines = [];
        $scope.map.icons = {};
        $scope.map.icons.churchIcon = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/churchicon.png', new google.maps.Size(45, 62), new google.maps.Point(0, 0), new google.maps.Point(14, 38));
        $scope.map.icons.mapClusterIcon = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/mapclusterfading.png', new google.maps.Size(60, 60), new google.maps.Point(0, 0), new google.maps.Point(30, 30));
        $scope.map.icons.icon5r = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/multipliedchurchicon_map.png', new google.maps.Size(52, 62), new google.maps.Point(0, 0), new google.maps.Point(25, 58));
        $scope.map.icons.icon5rl = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/multipliedchurchiconlock.png', new google.maps.Size(52, 65), new google.maps.Point(0, 0), new google.maps.Point(25, 61));
        $scope.map.icons.icon4r = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/multiplyingchurchicon.png', new google.maps.Size(52, 62), new google.maps.Point(0, 0), new google.maps.Point(25, 58));
        $scope.map.icons.icon4rl = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/multiplyingchurchiconlock.png', new google.maps.Size(52, 65), new google.maps.Point(0, 0), new google.maps.Point(25, 61));
        $scope.map.icons.icon4sh = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/multiplyingchurchshadow.png', new google.maps.Size(60, 48), new google.maps.Point(0, 0), new google.maps.Point(10, 46));
        $scope.map.icons.churchIconShadow = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/churchshadow.png', new google.maps.Size(59, 49), new google.maps.Point(0, 0), new google.maps.Point(10, 47));
        $scope.map.icons.churchIconLocked = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/churchiconlock.png', new google.maps.Size(45, 65), new google.maps.Point(0, 0), new google.maps.Point(22, 61));
        $scope.map.icons.groupRed = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/groupicon.png', new google.maps.Size(40, 44), new google.maps.Point(0, 0), new google.maps.Point(11, 24));
        $scope.map.icons.groupRedLocked = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/groupiconlock.png', new google.maps.Size(48, 47), new google.maps.Point(0, 0), new google.maps.Point(20, 43));
        $scope.map.icons.groupIconShadow = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/groupshadow.png', new google.maps.Size(49, 40), new google.maps.Point(0, 0), new google.maps.Point(10, 38));
        $scope.map.icons.targetRedIcon = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/targeticon.png', new google.maps.Size(23, 42), new google.maps.Point(0, 0), new google.maps.Point(8, 24));
        $scope.map.icons.targetRedLockedIcon = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/targeticonlock.png', new google.maps.Size(31, 46), new google.maps.Point(0, 0), new google.maps.Point(11, 42));
        $scope.map.icons.targetShadow = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/targetshadow.png', new google.maps.Size(33, 36), new google.maps.Point(0, 0), new google.maps.Point(4, 34));
        $scope.map.icons.visionRedIcon = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/vision.png', new google.maps.Size(23, 42), new google.maps.Point(0, 0), new google.maps.Point(11, 37));
        $scope.map.icons.visionRedLockedIcon = new google.maps.MarkerImage(GCM_APP.app_url + '/css/map_icons/visionlocked.png', new google.maps.Size(31, 46), new google.maps.Point(0, 0), new google.maps.Point(15, 42));

        $scope.map.side = document.getElementById('side');
        $scope.map.side.index = -1;
        $scope.map.side.style.display = 'block';
        $scope.map.controls[google.maps.ControlPosition.TOP_RIGHT].push($scope.map.side);

    }



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


    $scope.onGetChurches = function (response) {
         $scope.churches = response;
        console.log('got churches');


        $scope.removeLines();
        // $scope.map.markers = [];

        // do more intelligent replace
        //remove elements that are not in the new one.
        var toDelete = [];

        angular.forEach($scope.map.markers, function (church) {

            if (response.filter(function (c) { return c.id == church.id  }).length == 0 || church.cluster_count>1) {
                toDelete.push(church);
               
            }

        });
        console.log('to delete:  ' + toDelete.length);
        angular.forEach(toDelete, function (church) {
            //console.log(toDelete)
            //var church = $scope.map.markers.filter(function (c) { return c.id == toDelete[i] });
            //console.log(church.length);
            church.setMap(null);
            var removedObject = $scope.map.markers.splice($scope.map.markers.indexOf(church), 1);

            removedObject = null;
        });

        console.log('response:  ' + response.length);
        console.log('markers:  ' + $scope.map.markers.length);



        angular.forEach($scope.churches, function (church) {
            if ($scope.map.markers.filter(function (c) { return c.id == church.id }).length == 0) {
                var marker = {};
                if (church.cluster_count == 1) {
                    var churchIconToUse = {}
                    if (church.development == 5) { churchIconToUse = $scope.map.icons.icon5r;  }
                    else if (church.development == 4) { churchIconToUse = $scope.map.icons.icon4r;  }
                    else if (church.development == 3) { churchIconToUse = $scope.map.icons.churchIcon;  }
                    else if (church.development == 2) { churchIconToUse = $scope.map.icons.groupRed;  }
                    else if (church.development == 1) { churchIconToUse = $scope.map.icons.targetRedIcon; }
                    else { churchIconToUse = $scope.map.iconsvisionRedIcon; }

                    marker = new MarkerWithLabel({
                        position: new google.maps.LatLng(church.latitude, church.longitude),
                        map: $scope.map,
                        title: church.name,
                        id: church.id,
                        cluster_count:church.cluster_count,
                        icon: churchIconToUse,
                        labelContent: church.name,
                        labelAnchor: new google.maps.Point(30, 0),
                        labelClass: "labelMarker", // the CSS class for the label
                        labelInBackground: false

                    });

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
                }

                google.maps.event.addListener(marker, 'click', function () {
                    if (church.cluster_count == 1) {
                        //$scope.church = marker;
                        $scope.churchWindow.setContent($scope.churchWindowContent.replace("{{name}}", church.name));

                        //$scope.churchWindow.setContent($('#churchWindow'));
                        $scope.churchWindow.open($scope.map, marker);
                    }
                    else {
                        $scope.map.setCenter(marker.position);
                        $scope.map.setZoom($scope.map.getZoom() + 2);
                    }

                });
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
        console.log('markers: ' + $scope.map.markers.length);


    };



});
})(jQuery);

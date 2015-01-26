app.controller("gcmCtrl", function ($scope, $http, $timeout, token, ministry_service, assignment_service, church_service) {


    $scope.isReady = true;
    var onGetSession = function (data) {
        console.log(data.session_ticket);

        $scope.session_ticket = data.session_ticket;
        $scope.user = data.user;
        $scope.$watch('map.bounds', function (nv, ov) {
            if (ov.hasOwnProperty("southwest")) {
                if ((nv.southwest.latitude < ov.southwest.latitude || nv.southwest.longitude < ov.southwest.longitude || nv.northeast.latitude > ov.northeast.latitude || nv.northeast.longitude > ov.northeast.longitude)) {
                    console.log('map bounds changed')

                    church_service.getChurches($scope.session_ticket, $scope.map.bounds).then(onGetChurches, onError);

                }
            }
            else if( $scope.churches.length==0) {
                var bounds = { southwest: { latitude: 15.2, longitude: -92 }, northeast: { latitude: 15.6, longitude: -88 } };
                church_service.getChurches($scope.session_ticket, bounds).then(onGetChurches, onError);
            }

        }, true);
      
        assignment_service.getAssignments($scope.session_ticket).then(onGetAssignments, onError);
        //   $location.search('ticket', null);
    };

    var onError = function (response, code) {
        console.log('error' + response.error)
        if (code == 401)
            window.location.reload();
        $scope.error = response.reason;
    };

    var onGetChurches = function (response) {

       // $scope.churches = [];
       // $scope.churches = response;
  


        //  $scope.churches.push(response);
      
        console.log('got churches');

        $scope.k = 0;
        $scope.church_lines = [];
        //angular.forEach($scope.churches, function (church) {

            //if (response.filter(function (c) { return c.id == church.id }).length == 0) {
            //    //var removedObject = $scope.churches.splice($scope.churches.indexOf(church), 1);
            //    //removedObject = null;
            //}

      //  });
     
        angular.forEach(response, function (church) {
            if ($scope.churches.filter(function (c) { return c.id == church.id }).length == 0) {
                //  if (church.cluster_count == 1) {

                church.options = {
                    draggable: false, clickable: true, fit: false, icon: GCM_APP.app_url + '/css/map_icons/churchicon.png', labelAnchor: '30 0',
                    labelContent: church.name,
                    labelClass: 'labelMarker'
                };
           
              
               
                $scope.churches.push(church);


                if(!typeof church.parent_id !== 'undefined')
                {
                    var par = $scope.churches.filter(function (c) { return c.id == church.parent_id });
                    if (par.length > 0) {
                        $scope.church_lines.push({
                            id: $scope.k,
                            path: [{ latitude: par[0].latitude, longitude: par[0].longitude }, { latitude: church.latitude, longitude: church.longitude }],
                            stroke: {
                                color: '#666666',
                                weight: 2
                            },
                            editable: false,
                            draggable: false,
                            geodesic: true,
                            visible: true,
                            icons: [{
                                icon: {
                                    path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
                                    strokeWeight: 1.5
                                },
                                offset: '12px',
                                repeat: '25px'
                            }]
                        });
                        $scope.k++;
                    }
                }
                    
             

            }


            //}
            //else {
            //    church.options = {
            //        draggable: false, clickable: false, fit: false, labelAnchor: '30 15',
            //        labelContent: church.cluster_count,
            //        labelClass: 'labelMarker map-cluster-count'
            //    };
            //    church.show = false;
            //    church.name = "";
            //    church.onClick = null;
            //    church.options.icon = new google.maps.MarkerImage('/Content/map_icons/mapclusterfading.png',
            //  new google.maps.Size(60, 60),
            //  new google.maps.Point(0, 0),
            //  new google.maps.Point(30, 30));


            //}
          
           
        

       

        });
        $scope.map.isReady = true;
       
        $timeout(function () {
            var ch = $scope.markerControl.getGMarkers().filter(function (c) { return c.key == 445 || c.key==425 });
            console.log(ch[0]);
            console.log(ch[1]);
        }, 2000);

       



        //now create map response.


    };
  //  $scope.j = 0; //counter for markers
    //counter for lines
    //$scope.convertChurchesToPointer = function (churches, parent_loc) {

    //    for (var i = 0; i < churches.length; i++) {
    //        //var loc;

    //        if ($.grep($scope.church_markers, function (e) { return e.id == churches[i].id; }) == 0 && churches[i].hasOwnProperty("location") && churches[i].location.hasOwnProperty('latitude')) {


    //            if (churches[i].cluster_count === 1) {
    //                var ret = {
    //                    options: {
    //                        draggable: false, clickable: true, fit: true, icon: '/Content/map_icons/churchicon.png', labelAnchor: '30 0',
    //                        labelContent: churches[i].name,
    //                        labelClass: 'labelMarker'

    //                    },

    //                    latitude: churches[i].location.latitude,
    //                    longitude: churches[i].location.longitude,
    //                    title: churches[i].name,
    //                    show: false
    //                };
    //                ret.onClick = function () {
    //                    console.log("Clicked!");
    //                    ret.show = !ret.show;
    //                };

    //            }
    //            else {
    //                var ret = {
    //                    options: {
    //                        draggable: false, clickable: true, fit: true, icon: '/Content/map_icons/mapclusterfading.png', labelAnchor: '30 0',
    //                        labelContent: '',
    //                        labelClass: ''

    //                    },
    //                    latitude: churches[i].location.latitude,
    //                    longitude: churches[i].location.longitude,
    //                    title: '',
    //                    show: false
    //                };
    //                ret.onClick = function () {

    //                };

    //            }
    //            ret["id"] = churches[i].id;

    //            $scope.church_markers.push(ret);

    //            $scope.j++;
    //            if (parent_loc && parent_loc.hasOwnProperty('latitude')) {


    //                $scope.church_lines.push({
    //                    id: $scope.k,
    //                    path: [parent_loc, churches[i].location],
    //                    stroke: {
    //                        color: '#666666',
    //                        weight: 2
    //                    },
    //                    editable: false,
    //                    draggable: false,
    //                    geodesic: true,
    //                    visible: true,
    //                    icons: [{
    //                        icon: {
    //                            path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
    //                            strokeWeight: 1.5
    //                        },
    //                        offset: '12px',
    //                        repeat: '25px'
    //                    }]
    //                });
    //                $scope.k++;
    //            }



    //        }

    //        if (churches[i].churches) {

    //            $scope.convertChurchesToPointer(churches[i].churches, churches[i].location);

    //        }
    //    }


    //}

    var onGetMinistries = function (response) {

        if (response.length > 0) { $scope.new_assignment_nat_min = response[0].ministry_id };
        $scope.ministries = response;
        console.log('got ministries');

    };
    var onGetAssignments = function (response) {
        //$scope.isLoaded = true;
        $scope.assignments = response;
        $scope.map_assignments = [];
        console.log('got assignments');

        //$scope.target_areas = [];



    }


    // $scope.map.isReady = true;

   





    $scope.loadAssignment = function (assignment) {

        $scope.map.center = JSON.parse(JSON.stringify(assignment.location));
        $scope.map.zoom = parseInt(assignment.location_zoom);


        //$scope.assignment = assignment;
        ////preselect a valid mcc
        //if (assignment.has_slm) $scope.mcc = '_slm_';
        //else if (assignment.has_llm) $scope.mcc = '_llm_';
        //else if (assignment.has_gcm) $scope.mcc = '_gcm_';
        //else if (assignment.has_ds) $scope.mcc = '_ds_';
        //else if (assignment.has_ca) $scope.mcc = '_ca_';
        //if (!assignment.hasOwnProperty('lmi_show')) assignment.lmi_show = [];
        //if (!assignment.hasOwnProperty('lmi_hide')) assignment.lmi_hide = [];


        //$scope.assignment.totals = {};
        //$scope.assignment.saveStash = [];


        //if (assignment.team_role == 'leader') {
        //    $.each(assignment.measurements, function (index, value) {

        //        $scope.assignment.totals[value.measurement_type_id] = $scope.getMeasurementTotal(value);
        //    });
        //}
        //$scope.isSelected = true;
    };

    token.getSession()
            .then(onGetSession, onError);

    $scope.clusterOptions = { "title": "", "gridSize": 50, "ignoreHidden": true, "minimumClusterSize": 4,  "imageSizes": [60] };
    $scope.map = {
        center: { latitude: 15.117368581249664, longitude: -90.09897668253325 }, zoom: 10, bounds: {},control:{}, isReady: false, control: {}, tooltip: {
            pixelOffset: new google.maps.Size(0, -30)
        }
    };
  
    $scope.options = { scrollwheel: false };

    $scope.church_lines = [];
    $scope.churches = [];
 
   
    $scope.refreshMap = function () {
        //optional param if you want to refresh you can pass null undefined or false or empty arg
        $scope.map.control.refresh();
        return;
    };
    $scope.getMapInstance = function () {
        alert("You have Map Instance of" + $scope.map.control.getGMap().toString());
        return;
    }
    $scope.markerControl = {};
});

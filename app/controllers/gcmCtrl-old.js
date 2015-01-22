app.controller("gcmCtrl", function ($scope, $http, $timeout) {
    // $http.get("http://www.w3schools.com/website/Customers_JSON.php")
    //.success(function (response) { $scope.names = response; });
    $scope.isLoaded = false;
    $scope.isSelected = false;
    $scope.new_ministry = {};
    $scope.editMember = {};
    $scope.team_roles = ["leader", "member", "self_assigned", "blocked"];
    $scope.measurements = {};
    $http.get("http://localhost:52195/api/measurements/token?st=" + $('#hf_proxyticket').val(),{withCredentials : true})
     .success(function (response) {
         if (response.status = "success") {
             $scope.session_ticket = response.session_ticket;
             $scope.user = response.user;
             console.log($scope.session_ticket);
             $http.get("http://localhost:52195/api/measurements/assignments?token=" + $scope.session_ticket,{withCredentials : true})
                 .success(function (response) {
                     $scope.isLoaded = true;
                     $scope.assignments = response;
                     console.log('got assignments');
                 });
             $http.get("http://localhost:52195/api/measurements/ministries?token=" + $scope.session_ticket,{withCredentials : true})
                 .success(function (response) {
                     if (response.length > 0) { $scope.new_assignment_nat_min = response[0].ministry_id };
                     $scope.ministries = response;
                     console.log('got ministries');
                 });
             $http.get("http://localhost:52195/api/measurements/measurements?token=" + $scope.session_ticket,{withCredentials : true})
                .success(function (response) {

                    $scope.measurements = response;
                    console.log('got measurements');
                });
         }
     });




    $scope.loadAssignment = function (assignment) {



        $scope.assignment = assignment;
        //preselect a valid mcc
        if (assignment.has_slm) $scope.mcc = '_slm_';
        else if (assignment.has_llm) $scope.mcc = '_llm_';
        else if (assignment.has_gcm) $scope.mcc = '_gcm_';
        else if (assignment.has_ds) $scope.mcc = '_ds_';
        else if (assignment.has_ca) $scope.mcc = '_ca_';
        if (!assignment.hasOwnProperty('lmi_show')) assignment.lmi_show = [];
        if (!assignment.hasOwnProperty('lmi_hide')) assignment.lmi_hide = [];


        $scope.assignment.totals = {};
        $scope.assignment.saveStash = [];


        if (assignment.team_role == 'leader') {
            $.each(assignment.measurements, function (index, value) {

                $scope.assignment.totals[value.measurement_type_id] = $scope.getMeasurementTotal(value);
            });
        }
        $scope.isSelected = true;
    };
    $scope.getMeasurementTotal = function (m) {

        var total = m.offset_values[$scope.period];
        $.each(m.team_values, function (key, row) {
            total += row[$scope.period];
        });
        if (m.hasOwnProperty('subteam_values')) {
            $.each(m.subteam_values, function (key, row) {
                total += row[$scope.period];
            });
        }
        return total;
    };
    $scope.period = "2014-08";
    $scope.test = function () {
        alert('hello');
    };

    $scope.savingChanges = false;
    $scope.changes_saved = false;
    $scope.saveChanges = function () {

        //alert($scope.assignment.saveStash.length);
        if ($scope.assignment.saveStash.length > 0) {
            $scope.savingChanges = true;

            $http({
                url: 'http://localhost:52195/api/measurements/values?token=' + $scope.session_ticket,
                method: "POST",
                data: $scope.assignment.saveStash,
                headers: { 'Content-Type': 'application/json' }
            }).success(function (data, status, headers, config) {

                $scope.assignment.saveStash = [];
                $scope.savingChanges = false;
                $scope.changes_saved = true;
                $timeout(function () { $scope.changes_saved = false; }, 3000);

            }).error(function (data, status, headers, config) {
                $scope.status = status;
                $scope.savingChanges = false;
            });
        }
    };


    $scope.saveValue = function (period, id, value, reid, m) {
        if (m.team_values.hasOwnProperty(reid)) {
            m.team_values[reid][period] = value;
        }

        $.each($scope.assignment.measurements, function (index, value) {
            $scope.assignment.totals[value.measurement_type_id] = $scope.getMeasurementTotal(value);
        });


        var found = false;
        $.each($scope.assignment.saveStash, function (index, val) {
            if (val['measurement_type_id'] == id && val['period'] == period && val['related_entity_id'] == reid) {
                val['value'] = value;
                found = true;
            }

        });

        if (!found) {
            var newMeasure = {};

            newMeasure["measurement_type_id"] = id;
            newMeasure["period"] = period;
            newMeasure["related_entity_id"] = reid;
            newMeasure["value"] = value;
            $scope.assignment.saveStash.push(newMeasure);
        }





    };

    $scope.searchSubTeams = function (input, prefix) {
        var rtn = [];
        var insert = {};
        insert['name'] = prefix + input.name;
        insert['ministry_id'] = input.ministry_id;
        rtn.push(insert);

        if (input.hasOwnProperty('subteams')) {
            prefix = prefix + '--';
            $.each(input.subteams.sort(function (a, b) { return a.name > b.name; }), function (index, value) {

                rtn = rtn.concat($scope.searchSubTeams(value, prefix));
            });

        }
        return rtn;
    };
    $scope.subTeamList = [];
    $scope.getFlatMinistryList = function () {

        $scope.subTeamList = [];

        $.each($scope.ministries, function (index, value) {
            if (value.ministry_id == $scope.new_assignment_nat_min) {

                $scope.subTeamList = $scope.searchSubTeams(value, '');
                $scope.new_assignment_ministry_id = $scope.new_assignment_nat_min;
                return;
            }
        });

    };

    $scope.addMinistry = function () {
        //alert($scope.new_ministry.name);
        //alert($scope.new_ministry.mcc);
        //alert($scope.new_ministry.min_code);
        $scope.new_ministry.parent_id = $scope.assignment.ministry_id;

        $http({
            url: 'http://localhost:52195/api/measurements/ministries?token=' + $scope.session_ticket,
            method: "POST",
            data: $scope.new_ministry,
            headers: { 'Content-Type': 'application/json' }
        }).success(function (data, status, headers, config) {
            alert(status);
            $scope.new_ministry = {};


        }).error(function (data, status, headers, config) {
            $scope.status = status;

        });

    };
    $scope.joinTeam = function () {
        //alert($scope.new_ministry.name);
        //alert($scope.new_ministry.mcc);
        //alert($scope.new_ministry.min_code);



        // $scope.new_ministry.parent_id = $scope.assignment.ministry_id;

        var insert = {};
        insert['ministry_id'] = $scope.new_assignment_ministry_id;
        insert['person_id'] = $scope.user.person_id;
        insert['team_role'] = 'self_assigned';

        $http({
            url: 'http://localhost:52195/api/measurements/assignments?token=' + $scope.session_ticket,
            method: "POST",
            data: insert,
            headers: { 'Content-Type': 'application/json' }
        }).success(function (data, status, headers, config) {
            alert(status);



        }).error(function (data, status, headers, config) {
            $scope.status = status;

        });

    };

    $scope.editMemberClick = function (m) {
        $scope.editMember = m;
    };

    $scope.addNewTeamMember = function () {

        $scope.new_team_member.ministry_id = $scope.assignment.ministry_id;

        $http({
            url: 'http://localhost:52195/api/measurements/assignments?token=' + $scope.session_ticket,
            method: "POST",
            data: $scope.new_team_member,
            headers: { 'Content-Type': 'application/json' }
        }).success(function (data, status, headers, config) {
            alert(status);



        }).error(function (data, status, headers, config) {
            $scope.status = status;

        });

    };


    $scope.updateMember = function () {


        $http({
            url: 'http://localhost:52195/api/measurements/assignments?token=' + $scope.session_ticket,
            method: "PUT",
            data: $scope.editMember,
            headers: { 'Content-Type': 'application/json' }
        }).success(function (data, status, headers, config) {
            alert(status);



        }).error(function (data, status, headers, config) {
            $scope.status = status;

        });

    };


});
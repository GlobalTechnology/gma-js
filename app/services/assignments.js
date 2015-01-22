(function () {

    var assignment_service = function ($http) {

        var getAssignments = function (session_ticket) {
            this._apiResourceUrl = _api_url + "/assignments" + "?token=" + session_ticket;

            console.log(this._apiResourceUrl);
            return $http.get(this._apiResourceUrl, { withCredentials: true })
                .then(function (response) {

                    return response.data;

                });
        }
        var getAssignment = function (session_ticket, assignmnet_id) {
            this._apiResourceUrl = _api_url + "/assignments/" + assignmnet_id + "?token=" + session_ticket;

            

            return $http.get(this._apiResourceUrl, { withCredentials: true })
                .then(function (response) {

                    return response.data;

                });
        }
        var saveAssignment = function (session_ticket, assignmnet_id, role) {
            this._apiResourceUrl = _api_url + "/assignments/" + assignmnet_id + "?token=" + session_ticket;
            var input = { team_role: role };


            return $http.put(this._apiResourceUrl, input, { withCredentials: true })
                .then(function (response) {

                    return response.data;

                });
        }
        var addTeamMember = function (session_ticket, newTeamMember) {
            this._apiResourceUrl = _api_url + "/assignments" + "?token=" + session_ticket;
          

            return $http.post(this._apiResourceUrl, newTeamMember, { withCredentials: true })
                .then(function (response) {

                    return response.data;

                });
        }

        return {
            getAssignments: getAssignments,
            getAssignment: getAssignment,
            saveAssignment: saveAssignment,
            addTeamMember: addTeamMember
        };

    };

    var app = angular.module("gcmApp");
    //Of the 20 ways you can register a service you create in Angular, this is by far the easiest
    app.factory("assignment_service", assignment_service);

}());
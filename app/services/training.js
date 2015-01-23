(function () {

    var training_service = function ($http) {

        var getTrainings = function (session_ticket, ministry_id,mcc, show_all, show_tree) {
            this._apiResourceUrl = _api_url + "/training?token=" + session_ticket + "&ministry_id=" + ministry_id + "&show_all=" + show_all + "&show_tree=" + show_tree + "&mcc=" + mcc;
            console.log(this._apiResourceUrl);
         
            return $http.get(this._apiResourceUrl, { withCredentials: true })
                .then(function (response) {
                    return response.data;
                });

        };
        var updateTraining = function (session_ticket, training) {
            this._apiResourceUrl = _api_url + "/training/" + training.id + "?token=" + session_ticket;
            return $http.put(this._apiResourceUrl, training, { withCredentials: true })
                .then(function (response) {
                    return response.data;
                });
        };
        var addTraining = function (session_ticket, training) {
            this._apiResourceUrl = _api_url + "/training?token=" + session_ticket;
            return $http.post(this._apiResourceUrl, training, { withCredentials: true })
                .then(function (response) {
                    return response.data;
                });
        };
        var deleteTraining = function (session_ticket, training) {
            this._apiResourceUrl = _api_url + "/training/" + training.id + "?token=" + session_ticket;
            return $http.delete(this._apiResourceUrl, { withCredentials: true })
                .then(function (response) {
                    return ;
                });
        };
        var addTrainingCompletion = function (session_ticket, training_completion) {
            this._apiResourceUrl = _api_url + "/training_completion?token=" + session_ticket;
            return $http.post(this._apiResourceUrl, training_completion, { withCredentials: true })
                .then(function (response) {
                    return response.data;
                });
        };
        var updateTrainingCompletion = function (session_ticket, training_completion) {
            this._apiResourceUrl = _api_url + "/training_completion/" + training_completion.id + "?token=" + session_ticket;
            return $http.put(this._apiResourceUrl, training_completion, { withCredentials: true })
                .then(function (response) {
                    return response.data;
                });
        };
        var deleteTrainingCompletion = function (session_ticket, training_completion) {
            this._apiResourceUrl = _api_url + "/training_completion/" + training_completion.id + "?token=" + session_ticket;
            return $http.delete(this._apiResourceUrl, { withCredentials: true })
                .then(function (response) {
                    return ;
                });
        };
        return {
            getTrainings: getTrainings,
            updateTraining: updateTraining,
            addTraining: addTraining,
            addTrainingCompletion: addTrainingCompletion,
            updateTrainingCompletion: updateTrainingCompletion,
            deleteTrainingCompletion: deleteTrainingCompletion,
            deleteTraining: deleteTraining

        };

    };

    var app = angular.module("gcmApp");
 

    app.factory("training_service", training_service);

}());
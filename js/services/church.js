(function () {

    var church_service = function ($http) {

        var getChurches = function (session_ticket, bounds, extras) {
            if (bounds) {
                var sw = bounds.getSouthWest();
                var ne = bounds.getNorthEast();

                this._apiResourceUrl = _api_url + "/churches" + "?token=" + session_ticket + "&lat_min=" + sw.lat() + "&lat_max=" + ne.lat() + "&long_min=" + sw.lng() + "&long_max=" + ne.lng() + extras;
            }
            else
            {
                this._apiResourceUrl = _api_url + "/churches" + "?token=" + session_ticket + extras;

            }

                console.log(this._apiResourceUrl);
              

                return $http.get(this._apiResourceUrl, { withCredentials: true })
                    .then(function (response) {

                        return response.data;

                    });
           
        }

        var addChurch = function (session_ticket, church) {
          
                this._apiResourceUrl = _api_url + "/churches" + "?token=" + session_ticket ;

            

            console.log(this._apiResourceUrl);


            return $http.post(this._apiResourceUrl, church, { withCredentials: true })
                .then(function (response) {

                    return response.data;

                });

        }
        var saveChurch = function (session_ticket, church) {

            this._apiResourceUrl = _api_url + "/churches/" + church.id + "?token=" + session_ticket;



            console.log(this._apiResourceUrl);


            return $http.put(this._apiResourceUrl, church, { withCredentials: true })
                .then(function (response) {

                    return response.data;

                });

        }

        return {
            getChurches: getChurches,
            addChurch: addChurch,
            saveChurch: saveChurch
        };

    };

    var app = angular.module("gcmApp");
    //Of the 20 ways you can register a service you create in Angular, this is by far the easiest
    app.factory("church_service", church_service);

}());
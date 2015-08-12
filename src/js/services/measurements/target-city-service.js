(function () {
    'use strict';

    function TargetCity($http, Settings) {
        return {
            createTargetCity: function (data) {
                return $http.post(Settings.api.measurements('/target_cities'), data)
            },
            updateTargetCity: function (target_city_id, data) {
                return $http.put(Settings.api.measurements('/target_cities' + '?target_city_id=' + target_city_id), data)
            },
            getTargetCity: function (target_city_id) {
                return $http.get(Settings.api.measurements('/target_cities' + '/' + target_city_id))
            },
            searchTargetCities: function (params) {
                return $http.get(Settings.api.measurements('/target_cities'), {params: params})
            }

        }
    }

    angular.module('gma.services.measurements').factory('TargetCity', TargetCity);
})();

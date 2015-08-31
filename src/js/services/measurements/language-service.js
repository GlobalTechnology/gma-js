(function () {
    'use strict';

    function Languages($http, Settings) {
        return {
            getLanguages: function () {
                return $http.get(Settings.api.measurements('/languages'))
            }
        }
    }

    angular.module('gma.services.measurements').factory('Languages', Languages);
})();

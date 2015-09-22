(function () {
    'use strict';

    function ISOCountries( $http, Settings ) {
        return{
            getCountries : function(){
                return $http.get(Settings.api.measurements('/iso_countries'))
            }
        }
    }

    angular.module( 'gma.services.measurements' ).factory( 'ISOCountries', ISOCountries );
})();

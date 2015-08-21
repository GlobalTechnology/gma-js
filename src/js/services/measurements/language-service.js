(function () {
    'use strict';

    function MinistryLanguage( $http, Settings ) {
        return{
            getLanguages : function(){
                return $http.get(Settings.api.measurements('/languages'))
            }
        }
    }

    angular.module( 'gma.services.measurements' ).factory( 'MinistryLanguage', MinistryLanguage );
})();

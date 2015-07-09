(function () {
    'use strict';

    function UserPreference($http, Settings) {

        return {
            getPreference : function(){
                return $http.get(Settings.api.measurements( '/user_preferences'))
            },
            savePreference : function(data){
                return $http.post(Settings.api.measurements( '/user_preferences'),data)
            }

        };

    }

    angular.module( 'gma.services.preference' ).factory( 'UserPreference', UserPreference );
})();

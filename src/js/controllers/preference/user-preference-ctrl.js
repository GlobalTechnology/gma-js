(function () {
    'use strict';
    function UserPreferenceCtrl ($scope,$modalInstance){

        $scope.close = function () {
            $modalInstance.dismiss();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss( 'cancel' );
        };

        $scope.savePreferences = function(){
            console.log('Save button clicked');
        }
    }

    angular.module( 'gma.controllers.preference' ).controller( 'UserPreferenceCtrl', UserPreferenceCtrl );
})();

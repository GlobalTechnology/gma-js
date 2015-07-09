(function () {
    'use strict';
    function UserPreferenceCtrl ($scope,$modalInstance,modelData,UserPreference){

        $scope.mccLabels = modelData.mccLabels;

        var ministries = [];
        $scope.options = {};

        function getFlatMinistryArray(items) {
            angular.forEach(items, function (item) {
                if (item.hasOwnProperty('sub_ministries')) {
                    ministries = ministries.concat(getFlatMinistryArray(item.sub_ministries));
                } else {
                    ministries.push(item);
                }
            });

            //remove duplicates
            return _.uniq(ministries, false, function (item, key) {
                return item.ministry_id;
            });
        }
        $scope.ministries = getFlatMinistryArray(modelData.current.assignment.sub_ministries);

        $scope.getPreference = function(){
            UserPreference.getPreference
                .success(function(data){
                        //
                })
        };

        $scope.savePreference = function(options){
            console.log('Save button clicked');

            UserPreference.savePreference(options)
                .success(function(data){
                    //
                });
            $modalInstance.dismiss();
        };


        $scope.close = function () {
            $modalInstance.dismiss();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss( 'cancel' );
        };

    }

    angular.module( 'gma.controllers.preference' ).controller( 'UserPreferenceCtrl', UserPreferenceCtrl );
})();

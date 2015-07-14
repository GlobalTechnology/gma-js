(function () {
    'use strict';
    function UserPreferenceCtrl ($scope,$modalInstance,modelData,UserPreference){

        $scope.mccLabels = modelData.mccLabels;

        var ministries = [];
        $scope.options = {};

        function getFlatMinistryArray(items) {
            angular.forEach(items, function (item) {
                ministries.push(item);
                if (item.hasOwnProperty('sub_ministries') && (_.size(item.sub_ministries) > 0)) {
                    ministries = ministries.concat(getFlatMinistryArray(item.sub_ministries));
                }
            });

            //remove duplicates
            return _.uniq(ministries, false, function (item, key) {
                return item.ministry_id;
            });
        }
        $scope.ministries = getFlatMinistryArray(modelData.current.assignments);

        var getPreference = function(){
            UserPreference.getPreference()
                .success(function(data){
                       $scope.options = data;
                });
        };
        getPreference();

        $scope.savePreference = function(options){
            UserPreference.savePreference(options)
                .success(function(data){
                   console.log('Saved,but also needs to update root scope');
                    $modalInstance.dismiss();
                });

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

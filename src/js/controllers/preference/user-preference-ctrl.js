(function () {
    'use strict';
    function UserPreferenceCtrl($scope, $rootScope, $modalInstance, modelData, UserPreference) {
        $scope.options = {};

        $scope.options = {
            preferred_ministry : $rootScope.current.user_preferences.preferred_ministry || $rootScope.current.assignment.ministry_id,
            preferred_mcc : "",
            hide_reports_tab : "1"
        };

        $scope.ministries = UserPreference.getFlatMinistry($rootScope.current.assignments);
        $scope.options = $rootScope.current.user_preferences;
        $scope.mccs = UserPreference.getMappedMCCS($rootScope.current.assignment.mccs,modelData.mccLabels);

        $scope.savePreference = function (options) {
            UserPreference.savePreference(options)
                .success(function (data) {
                    //update root scope
                    $rootScope.current.user_preferences = data;
                    $modalInstance.dismiss();
                });

        };

        $scope.changeMCCS = function(ministry_id){
            if(ministry_id==="" || ministry_id === null ) {
                $scope.mccs = [];
                return false;
            }
            var ministry = _.find($scope.ministries,function(mini){
                return (mini.ministry_id === ministry_id);
            });
            $scope.mccs = UserPreference.getMappedMCCS(ministry.mccs,modelData.mccLabels);

        };
        $scope.changeMCCS($scope.options.preferred_ministry);

        $scope.close = function () {
            $modalInstance.dismiss();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }

    angular.module('gma.controllers.preference').controller('UserPreferenceCtrl', UserPreferenceCtrl);
})();

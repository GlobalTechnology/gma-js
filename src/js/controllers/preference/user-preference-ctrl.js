(function () {
    'use strict';
    function UserPreferenceCtrl($scope, $rootScope, $modalInstance, modelData, UserPreference) {
        $scope.options = {};

        $scope.options = {
            preferred_ministry: $rootScope.current.user_preferences.preferred_ministry || $rootScope.current.assignment.ministry_id,
            preferred_mcc: "",
            hide_reports_tab: "1"
        };

        $scope.ministries = UserPreference.getFlatMinistry($rootScope.current.assignments);
        $scope.options = $rootScope.current.user_preferences;
        $scope.mccs = UserPreference.getMappedMCCS($rootScope.current.assignment.mccs, modelData.mccLabels);

        $scope.savePreference = function (options) {

            UserPreference.savePreference(options)
                .success(function (data) {
                    //update root scope
                    if (typeof data === 'object')
                        $rootScope.current.user_preferences = data;
                });
            $modalInstance.dismiss();
        };

        $scope.changeMCCS = function (ministry_id) {
            if (ministry_id === "" || ministry_id === null) {
                $scope.mccs = [];
                $scope.options.preferred_mcc="";
                return false;
            }
            var ministry = _.find($scope.ministries, function (mini) {
                return (mini.ministry_id === ministry_id);
            });
            if(typeof ministry !== 'undefined') {
                $scope.mccs = UserPreference.getMappedMCCS(ministry.mccs, modelData.mccLabels);
                //additional check if there is no mccs then default_mcc should be empty in every case
                if(_.size($scope.mccs)==0){
                    $scope.options.preferred_mcc="";
                }
            }else{
                $scope.options.preferred_mcc="";
                $scope.mccs = [];
            }

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

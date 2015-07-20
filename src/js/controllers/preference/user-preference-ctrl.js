(function () {
    'use strict';
    function UserPreferenceCtrl($scope, $rootScope, $modalInstance, modelData, UserPreference) {
        $scope.options = {};

        $scope.options = {
            preferred_ministry : $rootScope.current.user_preferences.preferred_ministry || $rootScope.current.assignment.ministry_id,
            preferred_mcc : "",
            hide_reports_tab : "1"
        };

        $scope.ministries = getFlatMinistry($rootScope.current.assignments);
        $scope.options = $rootScope.current.user_preferences;
        $scope.mccs = getMappedMCCS($rootScope.current.assignment.mccs,modelData.mccLabels);

        $scope.savePreference = function (options) {
            UserPreference.savePreference(options)
                .success(function (data) {
                    //update root scope
                    $rootScope.current.user_preferences = data;
                    $modalInstance.dismiss();
                });

        };

        $scope.changeMCCS = function(ministry_id){
            if(ministry_id===""||ministry_id==null) {
                $scope.mccs = [];
                return false;
            }
            var ministry = _.find($scope.ministries,function(mini){
                return (mini.ministry_id === ministry_id);
            });
            $scope.mccs = getMappedMCCS(ministry.mccs,modelData.mccLabels);

        };
        $scope.changeMCCS($scope.options.preferred_ministry);

        $scope.close = function () {
            $modalInstance.dismiss();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        function getMappedMCCS(mccs, mccLabels){
            var mapped_mccs = [];
            _.each(mccs, function (mcc) {
                var customObject = {};
                customObject.mcc = mcc;
                customObject.mccLabel = mccLabels[mcc];
                mapped_mccs.push(customObject);
            });
            return mapped_mccs;
        }

        function getFlatMinistry(assignments){
            var ministries = [];
            angular.forEach(assignments, flattenMinistry);

            function flattenMinistry(ministry) {
                ministries.push(ministry);
                if (ministry.hasOwnProperty('sub_ministries') && _.size(ministry.sub_ministries) > 0) {
                    angular.forEach(ministry.sub_ministries, flattenMinistry);
                }
            }

            return ministries;
        }

    }

    angular.module('gma.controllers.preference').controller('UserPreferenceCtrl', UserPreferenceCtrl);
})();

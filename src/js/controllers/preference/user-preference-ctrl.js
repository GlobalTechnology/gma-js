(function () {
    'use strict';
    function UserPreferenceCtrl($scope, $rootScope, $modalInstance, modelData, UserPreference) {
        $scope.options = {};
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

        $scope.close = function () {
            $modalInstance.dismiss();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }

    angular.module('gma.controllers.preference').controller('UserPreferenceCtrl', UserPreferenceCtrl);
})();

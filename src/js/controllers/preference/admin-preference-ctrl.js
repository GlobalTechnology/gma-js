(function () {
    'use strict';
    function AdminPreferenceCtrl($scope, $rootScope, UserPreference, AdminPreference) {
        $scope.options = {};
        $scope.ministries = UserPreference.getFlatMinistry($rootScope.current.assignments);
        $scope.mccs = UserPreference.getMappedMCCS($rootScope.current.assignment.mccs,$scope.mccLabels);

        $scope.savePreference = function (options) {
            console.log('Save button was clicked')

        };

    }

    angular.module('gma.controllers.preference').controller('AdminPreferenceCtrl', AdminPreferenceCtrl);
})();

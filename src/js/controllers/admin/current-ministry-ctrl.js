(function () {
    'use strict';

    function CurrentMinistryCtrl($scope, $modal, $filter, MeasurementTypes, Ministries) {

        $scope.mccs = [
            {value: 'ds', text: 'Digital Strategies'},
            {value: 'gcm', text: 'Global Church Movements'},
            {value: 'llm', text: 'Leader Led'},
            {value: 'slm', text: 'Student Led'}
        ];

        $scope.ableToChangeParentMinistry = function (parentToFind) {
            var availableMinIds = _.pluck($filter('roleFilter')($scope.current.ministries, ['admin', 'inherited_admin', 'leader', 'inherited_leader']), 'ministry_id');
            return _.contains(availableMinIds, parentToFind);
        };

        $scope.saveDetails = function () {
            //additional check if admin un-select all mccs then default_mcc should be empty
            if (_.size($scope.mccs) == 0) {
                $scope.ministry.default_mcc = '';
            }

            var ministry = {
                ministry_id: $scope.ministry.ministry_id,
                min_code: $scope.ministry.min_code,
                name: $scope.ministry.name,
                mccs: $scope.ministry.mccs,
                private: $scope.ministry.private,
                hide_reports_tab: $scope.ministry.hide_reports_tab,
                default_mcc: $scope.ministry.default_mcc,
                lmi_hide: _.pluck(_.where($scope.measurementTypes, {
                    is_custom: false,
                    visible: false
                }), 'perm_link_stub'),
                lmi_show: _.pluck(_.where($scope.measurementTypes, {
                    is_custom: true,
                    visible: true
                }), 'perm_link_stub')
            };
            if ($scope.ministry.hasOwnProperty('parent_id') && typeof $scope.ministry.parent_id === "string") {
                ministry.parent_id = $scope.ministry.parent_id;
            }
            $scope.saveDetailsResource = Ministries.updateMinistry(ministry,
                function () {
                    $scope.saveDetailsAlert = {
                        type: 'success',
                        msg: 'Your changes have been saved.'
                    };
                }, function (response) {
                    $scope.saveDetailsAlert = {
                        type: 'danger',
                        msg: response.Message || 'An error occurred while saving.'
                    };
                });
        };

        $scope.addMeasurement = function () {
            $modal.open({
                templateUrl: 'partials/admin/add-measurement-type.html',
                controller: function ($scope, $modalInstance) {
                    $scope.close = function () {
                        $modalInstance.dismiss();
                    };

                    $scope.add = function () {
                        $modalInstance.close($scope.newMeasurement);
                    };
                }
            }).result.then(function (newMeasurement) {
                    MeasurementTypes.addMeasurementType(newMeasurement, function () { });
                });
        };


    }

    angular.module('gma.controllers.admin').controller('CurrentMinistryCtrl', CurrentMinistryCtrl);
}());

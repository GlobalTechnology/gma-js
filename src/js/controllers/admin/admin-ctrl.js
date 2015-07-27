(function () {
    'use strict';

    function AdminCtrl($scope, Ministries, MeasurementTypes, GoogleAnalytics) {
        $scope.current.isLoaded = false;

        var sendAnalytics = _.throttle(function () {
            GoogleAnalytics.screen('Admin', (function () {
                var dimensions = {};
                dimensions[GoogleAnalytics.DIM.guid] = $scope.current.user.key_guid;
                dimensions[GoogleAnalytics.DIM.ministry_id] = $scope.current.assignment.ministry_id;
                return dimensions;
            })());
        }, 1000, {leading: false});

        $scope.$watch('current.assignment.ministry_id', function (ministry_id) {
            if (typeof ministry_id === 'undefined') return;
            sendAnalytics();
            $scope.ministry = Ministries.getMinistry({ministry_id: ministry_id}, function () {
                $scope.current.isLoaded = true;

                $scope.measurementTypes = [];
                MeasurementTypes.getMeasurementTypes().$promise.then(function (data) {
                    angular.forEach(data, function (type) {
                        if (type.is_custom && _.contains($scope.ministry.lmi_show, type.perm_link_stub)) {
                            type.visible = true;
                        } else if (!type.is_custom && !_.contains($scope.ministry.lmi_hide, type.perm_link_stub)) {
                            type.visible = true;
                        } else {
                            type.visible = false;
                        }
                        $scope.measurementTypes.push(type);
                    });
                });
            });
        });

        //function initializes sub-tabs of admin section
        $scope.initSubTabs = function () {

            //load all tab urls to scope
            $scope.adminTabTemplates = getAdminSubTabTemplates();

            //this is the default pill
            if (typeof $scope.activePill === 'undefined') {
                $scope.activePill = 'team-members';
            }
            //selecting current view for very first time
            $scope.selectTab($scope.activePill);
        };

        //function selects current sub-tab for admin section
        $scope.selectTab = function (tab) {

            $scope.activePill = tab;

            if (typeof tab === 'undefined') {
                $scope.activePill = 'team-members';
            }

            //selecting current tab view
            $scope.currentAdminTab = _.find(getAdminSubTabTemplates(), function (template) {
                return (template.name === tab);
            });
        };

        var getAdminSubTabTemplates = function () {

            return [
                {
                    url: 'partials/admin/_team-members.html',
                    name: 'team-members',
                    label: 'Team & Members',
                    requiredRoles: ['admin', 'inherited_admin', 'leader', 'inherited_leader']
                },
                {
                    url: 'partials/admin/_edit-ministry.html',
                    name: 'edit-ministry',
                    label: 'Edit Ministry',
                    requiredRoles: ['admin', 'inherited_admin']
                },
                {
                    url: 'partials/admin/_measurement.html',
                    name: 'measurement',
                    label: 'Manage Measurements',
                    requiredRoles: ['admin', 'inherited_admin']
                }
            ];
        };

    }

    angular.module('gma.controllers.admin').controller('AdminCtrl', AdminCtrl);
}());

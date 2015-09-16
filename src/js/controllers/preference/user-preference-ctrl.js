(function () {
    'use strict';
    function UserPreferenceCtrl($scope, $location, $modalInstance, modelData, UserPreference, growl, Settings, gettextCatalog) {
        //set some defaults
        $scope.options = {
            supported_staff: '0',
            hide_reports_tab: '0', //0 means visible
            static_locale: 'en-us',
            content_locales: {}
        };
        //collect data for looping
        $scope.ministries = _.sortBy(UserPreference.getFlatMinistry($scope.current.assignments), 'name');
        $scope.mccs = _.sortBy(UserPreference.getMappedMCCS($scope.current.assignment.mccs, modelData.mccLabels), 'mccLabel');
        $scope.staticLocales = angular.copy(Settings.static_locales);

        $scope.current.loadLanguages();

        //override user preferences from token response
        if (typeof $scope.current.user_preferences === 'object') {
            $scope.options = angular.extend({}, $scope.options, angular.copy($scope.current.user_preferences));
        }
        //get supported languages by this ministry
        var supportedLanguages = {};
        if (typeof $scope.current.assignment.content_locales !== 'undefined') {
            supportedLanguages = angular.copy($scope.current.assignment.content_locales);
        }
        $scope.filterByLangCode = function (lang) {

            return (_.contains(supportedLanguages, lang.iso_code)) ? lang : false;

        };

        $scope.savePreference = function (options) {
            //reduce payload weight
            delete options.default_map_views;
            delete options.default_measurement_states;
            UserPreference.savePreference(options)
                .success(function (data) {
                    growl.success(gettextCatalog.getString('Your preferences were saved'));
                    //if user want to hide reports tab and is on reports tab so
                    if (options.hide_reports_tab == 1 && $location.path() == '/reports') {
                        $scope.current.redirectToHomeTab();
                    }
                    //update root scope
                    $scope.current.user_preferences = data;
                })
                .error(function () {
                    growl.error(gettextCatalog.getString('Unable to save preferences'));
                });
            $modalInstance.close(true);
        };

        $scope.changeMCCS = function (ministry_id) {
            if (ministry_id === "" || ministry_id === null) {
                $scope.mccs = [];
                $scope.options.preferred_mcc = "";
                return false;
            }
            var ministry = _.find($scope.ministries, function (mini) {
                return (mini.ministry_id === ministry_id);
            });
            if (typeof ministry !== 'undefined') {
                $scope.mccs = _.sortBy(UserPreference.getMappedMCCS(ministry.mccs, modelData.mccLabels), 'mccLabel');
                //additional check if there is no mccs then default_mcc should be empty in every case
                if (_.size($scope.mccs) == 0) {
                    $scope.options.preferred_mcc = "";
                }
            } else {
                $scope.options.preferred_mcc = "";
                $scope.mccs = [];
            }

        };
        $scope.changeMCCS($scope.options.preferred_ministry);

        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };

    }

    angular.module('gma.controllers.preference').controller('UserPreferenceCtrl', UserPreferenceCtrl);
})();

(function () {
    'use strict';
    function UserPreferenceCtrl($scope, $modalInstance, modelData, UserPreference, growl, Settings, MinistryLanguage) {
        //set some defaults
        $scope.options = {
            supported_staff: '0',
            hide_reports_tab: '0',
            static_locale: 'en-us',
            content_locales: {}
        };
        //set default lang for current ministry
        $scope.options.content_locales[$scope.current.assignment.ministry_id] = 'en-us';
        //collect data for looping
        $scope.ministries = _.sortBy(UserPreference.getFlatMinistry($scope.current.assignments), 'name');
        $scope.mccs = _.sortBy(UserPreference.getMappedMCCS($scope.current.assignment.mccs, modelData.mccLabels), 'mccLabel');
        $scope.staticLocales = angular.copy(Settings.static_locales);

        $scope.contentLocales = {};
        MinistryLanguage.getLanguages()
            .success(function (response) {
                $scope.contentLocales = response;
            })
            .error(function () {
                growl.error('Unable to load languages');
            });

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
                    growl.success('Your preferences were saved');
                    //update root scope
                    $scope.current.user_preferences = data;
                })
                .error(function () {
                    growl.error('Unable to save preferences');
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

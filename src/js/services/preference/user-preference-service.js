(function () {
    'use strict';

    function UserPreference($http, Settings) {

        return {
            getPreference: function () {
                return $http.get(Settings.api.measurements('/user_preferences'))
            },
            savePreference: function (data) {
                return $http.post(Settings.api.measurements('/user_preferences'), data)
            },
            getFlatMinistry: function (assignments) {
                var ministries = [];
                angular.forEach(assignments, flattenMinistry);

                function flattenMinistry(ministry) {
                    ministries.push(ministry);
                    if (ministry.hasOwnProperty('sub_ministries') && _.size(ministry.sub_ministries) > 0) {
                        angular.forEach(ministry.sub_ministries, flattenMinistry);
                    }
                }

                //remove duplicates
                return _.uniq( ministries, false, function ( m ) {
                    return m.ministry_id;
                } );

            },
            getMappedMCCS: function (mccs, mccLabels) {
                var mapped_mccs = [];
                _.each(mccs, function (mcc) {
                    var customObject = {};
                    customObject.mcc = mcc;
                    customObject.mccLabel = mccLabels[mcc];
                    mapped_mccs.push(customObject);
                });
                return mapped_mccs;
            }

        };

    }

    angular.module('gma.services.preference').factory('UserPreference', UserPreference);
})();

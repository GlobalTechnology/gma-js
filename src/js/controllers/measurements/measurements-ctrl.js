(function () {
    'use strict';

    function MeasurementsCtrl($scope, $modal, $location, Measurements, UserPreference, Settings, GoogleAnalytics, $interval, growl, MinistryLanguage) {

        $scope.current.isLoaded = false;
        var defaultLocale = 'en-US';
        $scope.currentLanguage = defaultLocale;
        var otherLanguage = false;
        $scope.ns = Settings.gmaNamespace;
        $scope.allLanguages = [];

        var sendAnalytics = _.throttle(function () {
            GoogleAnalytics.screen('Measurements', (function () {
                var dimensions = {};
                dimensions[GoogleAnalytics.DIM.guid] = $scope.current.user.key_guid;
                if (angular.isDefined($scope.current.assignment.ministry_id)) {
                    dimensions[GoogleAnalytics.DIM.ministry_id] = $scope.current.assignment.ministry_id;
                }
                if (angular.isDefined($scope.current.mcc)) {
                    dimensions[GoogleAnalytics.DIM.mcc] = $scope.current.mcc;
                }
                if (angular.isDefined($scope.current.period)) {
                    dimensions[GoogleAnalytics.DIM.period] = $scope.current.period.format('YYYY-MM');
                }
                return dimensions;
            })());
        }, 1000, {leading: false});

        $scope.$watch('current.assignment.ministry_id', function (old) {
            //only need to decide preferred language if user changes the ministry
            $scope.currentLanguage = decideLocaleToLoad();
            getMeasurements();
            sendAnalytics();
            if (old != undefined) {
                getMinistryLanguages();
                setMeasurementStates();
            }
        });

        $scope.$watch('current.mcc', function (old) {
            getMeasurements();
            sendAnalytics();
            if (old !== undefined) {
                setMeasurementStates();
            }
        });

        $scope.$watch('current.period', function () {
            getMeasurements();
            sendAnalytics();
        });

        // Debounced method to fetch Measurements at most once every 100 milliseconds
        var getMeasurements = _.debounce(function () {
            if (typeof $scope.current.assignment !== 'undefined' && typeof $scope.current.period !== 'undefined' && typeof $scope.current.mcc !== 'undefined') {

                $scope.loadMeasurements($scope.currentLanguage);
            }
        }, 100);

        /**
         * Also fires on change event of language selector
         * Always pass a language, default = en-us
         * @param language
         */
        $scope.loadMeasurements = function (language) {
            //be fail safe
            if (language === undefined || language === '') {
                language = defaultLocale;
            }
            $scope.current.isLoaded = false;
            $scope.measurements = Measurements.getMeasurements({
                ministry_id: $scope.current.assignment.ministry_id,
                mcc: $scope.current.mcc,
                locale: language,
                period: $scope.current.period.format('YYYY-MM')
            }, function () {
                $scope.current.isLoaded = true;
            });
        };


        function decideLocaleToLoad() {
            //check for user-preferred locale , if not found then load default
            if (typeof $scope.current.user_preferences === 'undefined') {
                return defaultLocale;
            }
            if (typeof $scope.current.user_preferences.content_locales === 'undefined') {
                return defaultLocale;
            }
            if (typeof $scope.current.user_preferences.content_locales[$scope.current.assignment.ministry_id] !== 'undefined') {
                return $scope.current.user_preferences.content_locales[$scope.current.assignment.ministry_id];
            }

            return defaultLocale;
        }


        $scope.hasOther = function () {
            return _.where($scope.measurements, {section: 'other', column: 'other'}).length > 0;
        };

        // Method used to save measurements
        $scope.saveMeasurements = function () {
            var measurements = [];
            angular.forEach($scope.measurements, function (measurement) {
                angular.forEach(['person', 'local'], function (type) {
                    if ($scope.lmiForm.hasOwnProperty(measurement.measurement_type_ids[type])) {
                        var type_id = measurement.measurement_type_ids[type],
                            input = $scope.lmiForm[type_id];

                        if (input.$dirty && input.$valid) {
                            measurements.push({
                                period: $scope.current.period.format('YYYY-MM'),
                                mcc: $scope.current.mcc,
                                source: Settings.gmaNamespace,
                                measurement_type_id: type_id,
                                related_entity_id: type === 'person' ? $scope.current.assignment.id : $scope.current.assignment.ministry_id,
                                value: input.$modelValue
                            });
                        }
                    }
                });
            });

            if (measurements.length > 0) {
                 Measurements.saveMeasurement({}, measurements, function (response) {
                    growl.success('Measurements saved successfully');
                    getMeasurements();
                    $scope.lmiForm.$setPristine();
                }, function () {
                    growl.error('Unable to save measurements');
                });
            }
        };

        /**
         * Get languages from API and update scope
         * @returns {Array|*}
         */
        function getMinistryLanguages() {

            if (typeof $scope.allLanguages !== 'undefined' && $scope.allLanguages.length !== 0) {
                return $scope.allLanguages;
            } else {

                MinistryLanguage.getLanguages()
                    .success(function (response) {
                        $scope.allLanguages = response;
                        return response;
                    })
                    .error(function () {
                        growl.error('Unable to load languages');
                        return false;
                    });

            }
        }

        //show measurement's name and description according to selected language, default will be english
        /*$scope.getMeasurementDetail = function (measurement, key) {
         if (key === 'description') {
         return otherLanguage ? measurement.localized_description : measurement.description;
         }
         else if (key === 'name') {
         return otherLanguage ? measurement.localized_name : measurement.name;
         }
         };*/


        $scope.filterByLangCode = function (lang) {
            if (typeof $scope.current.assignment.content_locales !== 'undefined') {
                return (_.contains($scope.current.assignment.content_locales, lang.iso_code)) ? lang : false;
            } else {
                return false;
            }
        };

        $scope.editMeasurementDetails = function (measurement) {
            var instance = $modal.open({
                templateUrl: 'partials/measurements/details.html',
                controller: 'MeasurementDetailsCtrl',
                keyboard: true,
                backdrop: true,
                resolve: {
                    'measurement': function () {
                        return measurement;
                    },
                    'details': function () {
                        // Return the promise so resolve waits
                        return Measurements.getMeasurement({
                            perm_link_stub: measurement.perm_link_stub,
                            ministry_id: $scope.current.assignment.ministry_id,
                            mcc: $scope.current.mcc,
                            period: $scope.current.period.format('YYYY-MM')
                        });
                    }
                }
            });
            instance.result.then(function () {
                //setting confirmation message
                growl.success('Measurements updated successfully');
                getMeasurements();
            });
            window.setTimeout(function () {
                window.parent.scrollTo(0, 0);
            }, 10);
        };


        function setMeasurementStates() {

            $scope.measurementState = {};
            //get settings from config.php
            var states_from_config = {};
            if (typeof Settings.default_measurement_states[$scope.current.mcc] !== 'undefined') {
                states_from_config = angular.copy(Settings.default_measurement_states[$scope.current.mcc]);
            }

            //get user preference from user profile	, will override default (defined in config.php)
            if (typeof $scope.current.user_preferences !== 'undefined' && typeof $scope.current.user_preferences.default_measurement_states !== "undefined") {

                //check if current mcc exists in default_measurement_states
                if (typeof $scope.current.user_preferences.default_measurement_states[$scope.current.mcc] !== 'undefined') {
                    $scope.measurementState = $scope.current.user_preferences.default_measurement_states[$scope.current.mcc];
                }
                else {
                    $scope.measurementState = states_from_config;
                }

            } else {
                $scope.measurementState = states_from_config;
            }
        }

        var autoSave = $interval(function () {
            //if user in inside measurement tab and view has been loaded
            if ($scope.current.isLoaded && $location.path() === '/measurements') {

                if ($scope.current.mcc !== 'undefined' && (_.size($scope.measurementState) > 0)) {

                    var post_data = {"default_measurement_states": {}};
                    post_data.default_measurement_states[$scope.current.mcc] = $scope.measurementState;
                    UserPreference.savePreference(post_data).success(function (data) {

                    }, function (e) {
                        //stop auto-saving if server sends 500 or 400
                        if (e.status === 500 || e.status === 400) {
                            $interval.cancel(autoSave);
                            growl.info('Server is having problems in saving measurement states');
                        }
                    });

                }
            }
        }, 60000);


        $scope.toggleMeasurementState = function (measurementState, perm_link_stub) {
            measurementState[perm_link_stub] = (measurementState[perm_link_stub] === 1) ? 0 : 1;
        };

        $scope.getExpandCollapse = function (measurementState) {
            return (measurementState === 1);
        };

        $scope.checkMeasureState = function (measurement) {

            if (measurement.supported_staff_only === true) {
                if ($scope.current.user_preferences.supported_staff !== 'undefined') {
                    if ($scope.current.user_preferences.supported_staff == '1') {
                        if (measurement.leader_only === true) {

                            return $scope.current.hasRole(['admin', 'inherited_admin', 'leader', 'inherited_leader']);

                        }
                        return true;
                    }
                    else {
                        return false;
                    }

                }
                else {
                    return false;
                }
            }
            if (measurement.leader_only === true) {
                return $scope.current.hasRole(['admin', 'inherited_admin', 'leader', 'inherited_leader']);
            }

            return true;
        };

    }

    angular.module('gma.controllers.measurements').controller('MeasurementsCtrl', MeasurementsCtrl);
})();

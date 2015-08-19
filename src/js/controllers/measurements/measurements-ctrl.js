(function () {
	'use strict';

	function MeasurementsCtrl( $scope, $document, $filter, $modal,$location, Measurements,UserPreference, Settings, GoogleAnalytics,$interval ,growl) {

		$scope.current.isLoaded = false;
		$scope.isConfirmationMessage = false;
		$scope.ns = Settings.gmaNamespace;

		var sendAnalytics = _.throttle( function () {
			GoogleAnalytics.screen( 'Measurements', (function () {
				var dimensions = {};
				dimensions[GoogleAnalytics.DIM.guid] = $scope.current.user.key_guid;
				if ( angular.isDefined( $scope.current.assignment.ministry_id ) ) {
					dimensions[GoogleAnalytics.DIM.ministry_id] = $scope.current.assignment.ministry_id;
				}
				if ( angular.isDefined( $scope.current.mcc ) ) {
					dimensions[GoogleAnalytics.DIM.mcc] = $scope.current.mcc;
				}
				if ( angular.isDefined( $scope.current.period ) ) {
					dimensions[GoogleAnalytics.DIM.period] = $scope.current.period.format( 'YYYY-MM' );
				}
				return dimensions;
			})() );
		}, 1000, {leading: false} );

		// Debounced method to fetch Measurements at most once every 100 milliseconds
		var getMeasurements = _.debounce( function () {
			if ( typeof $scope.current.assignment !== 'undefined' && typeof $scope.current.period !== 'undefined' && typeof $scope.current.mcc !== 'undefined' ) {
				$scope.current.isLoaded = false;
				$scope.lmiForm.$setPristine();
				$scope.measurements = Measurements.getMeasurements( {
					ministry_id: $scope.current.assignment.ministry_id,
					mcc:         $scope.current.mcc,
					period:      $scope.current.period.format( 'YYYY-MM' )
				}, function () {
					$scope.current.isLoaded = true;
				} );
			}
		}, 100 );

		$scope.$watch( 'current.assignment.ministry_id', function () {
			getMeasurements();
			sendAnalytics();
		} );

		$scope.$watch( 'current.mcc', function (old) {
			getMeasurements();
			sendAnalytics();
			if(old !== undefined){
				setMeasurementState();				
			}			
		} );

		$scope.$watch( 'current.period', function () {
			getMeasurements();
			sendAnalytics();
		} );

		$scope.hasOther = function () {
			return _.where( $scope.measurements, {section: 'other', column: 'other'} ).length > 0;
		};

		// Method used to save measurements
		$scope.save = function () {
			var measurements = [];
			angular.forEach( $scope.measurements, function ( measurement ) {
				angular.forEach( ['person', 'local'], function ( type ) {
					if ( $scope.lmiForm.hasOwnProperty( measurement.measurement_type_ids[type] ) ) {
						var type_id = measurement.measurement_type_ids[type],
							input = $scope.lmiForm[type_id];

						if ( input.$dirty && input.$valid ) {
							measurements.push( {
								period:              $scope.current.period.format( 'YYYY-MM' ),
								mcc:                 $scope.current.mcc,
								source:              Settings.gmaNamespace,
								measurement_type_id: type_id,
								related_entity_id:   type === 'person' ? $scope.current.assignment.id : $scope.current.assignment.ministry_id,
								value:               input.$modelValue
							} );
						}
					}
				} );
			} );

			if ( measurements.length > 0 ) {
				Measurements.saveMeasurement( {}, measurements ,function (response) {
					//setting confirmation message
					growl.success('Measurements saved successfully');
					getMeasurements();
				});
			}
			else {
				getMeasurements();
			}
		};

		$scope.editMeasurementDetails = function ( measurement ) {
			var instance = $modal.open( {
				templateUrl: 'partials/measurements/details.html',
				controller:  'MeasurementDetailsCtrl',
				keyboard:    true,
				backdrop:    true,
				resolve:     {
					'measurement': function () {
						return measurement;
					},
					'details':     function () {
						// Return the promise so resolve waits
						return Measurements.getMeasurement( {
							perm_link_stub: measurement.perm_link_stub,
							ministry_id:    $scope.current.assignment.ministry_id,
							mcc:            $scope.current.mcc,
							period:         $scope.current.period.format( 'YYYY-MM' )
						} );
					}
				}
			} );
			instance.result.then( function () {
				//setting confirmation message
				growl.success('Measurements updated successfully');
				getMeasurements();
			} );
		};


        function setMeasurementState() {

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
            //init automatic saving procedure
            saveMeasurementState();
        }

        function saveMeasurementState() {  
            $interval(function () {
                //if user in inside measurement tab and view has been loaded
                if ($scope.current.isLoaded && $location.path() === '/measurements') {

                    if ($scope.current.mcc !== 'undefined' && (_.size($scope.measurementState) > 0)) {

                        var post_data = {"default_measurement_states": {}};
                        post_data.default_measurement_states[$scope.current.mcc] = $scope.measurementState;
                        UserPreference.savePreference(post_data).success(function (data) {
                        });

                    }
                }
            }, 60000);
        }

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

	angular.module( 'gma.controllers.measurements' ).controller( 'MeasurementsCtrl', MeasurementsCtrl );
})();

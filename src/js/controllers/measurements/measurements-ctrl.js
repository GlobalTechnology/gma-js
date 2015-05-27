(function () {
	'use strict';

	function MeasurementsCtrl( $scope, $document, $filter, $modal, Measurements, Settings, GoogleAnalytics ) {
		$scope.current.isLoaded = false;
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

		$scope.$watch( 'current.mcc', function () {
			getMeasurements();
			sendAnalytics();
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
				Measurements.saveMeasurement( {}, measurements, function () {
					getMeasurements();
				} );
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
				getMeasurements();
			} );
		};
	}

	angular.module( 'gma.controllers.measurements' ).controller( 'MeasurementsCtrl', MeasurementsCtrl );
})();

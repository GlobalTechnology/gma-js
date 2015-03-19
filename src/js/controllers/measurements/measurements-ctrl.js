(function () {
	'use strict';

	function MeasurementsCtrl( $scope, $document, $filter, $modal, measurementService, settings ) {
		$scope.current.isLoaded = false;
		$scope.ns = settings.gmaNamespace;

		// Debounced method to fetch Measurements at most once every 100 milliseconds
		var getMeasurements = _.debounce( function () {
			if ( typeof $scope.current.assignment !== 'undefined' && typeof $scope.current.period !== 'undefined' && typeof $scope.current.mcc !== 'undefined' ) {
				$scope.current.isLoaded = false;
				$scope.lmiForm.$setPristine();
				$scope.measurements = measurementService.getMeasurements( {
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
		} );

		$scope.$watch( 'current.mcc', function () {
			getMeasurements();
		} );

		$scope.$watch( 'current.period', function () {
			getMeasurements();
		} );

		$scope.hasOther = function () {
			return _.where( $scope.measurements, {section: 'other', column: 'other'} ).length > 0;
		};

		// Method used to save measurements for self_assigned role.
		$scope.save = function () {
			var measurements = [];
			angular.forEach( $scope.measurements, function ( measurement ) {
				var value = $scope.lmiForm[measurement.perm_link];
				if ( value.$dirty && value.$valid ) {
					this.push( {
						period:              $scope.current.period.format( 'YYYY-MM' ),
						mcc:                 $scope.current.mcc + '_' + settings.gmaNamespace,
						measurement_type_id: measurement.measurement_type_ids.person,
						related_entity_id:   $scope.current.assignment.id,
						value:               value.$modelValue
					} );
				}
			}, measurements );

			if ( measurements.length > 0 ) {
				measurementService.saveMeasurement( {}, measurements, function () {
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
						return measurementService.getMeasurement( {
							measurement_id: measurement.measurement_id,
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

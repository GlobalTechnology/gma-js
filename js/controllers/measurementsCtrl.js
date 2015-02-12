define( ['gcmApp', 'underscore', 'measurementsService', 'goog!visualization,1,packages:[corechart]'], function ( gcmApp, _ ) {
	gcmApp.controller( 'measurementsController', [
		'$scope', '$document', '$filter', '$modal', 'measurementsService',
		function ( $scope, $document, $filter, $modal, measurementsService ) {
			$scope.current.isLoaded = false;

			// Debounced method to fetch Measurements at most once every 100 milliseconds
			var getMeasurements = _.debounce( function () {
				if ( typeof $scope.current.assignment !== 'undefined' && typeof $scope.current.period !== 'undefined' && typeof $scope.current.mcc !== 'undefined' ) {
					$scope.current.isLoaded = false;
					$scope.lmiForm.$setPristine();
					$scope.measurements = measurementsService.query( {
						ministry_id: $scope.current.assignment.ministry_id,
						mcc:         $scope.current.mcc,
						period:      $scope.current.period.format( 'YYYY-MM' ),
						token:       $scope.current.sessionToken
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

			// Method used to save measurements for self assigned role.
			$scope.save = function () {
				var measurements = [];
				angular.forEach( $scope.measurements, function ( measurement ) {
					if ( typeof measurement.my_values.gma_app === 'number' ) {
						measurements.push( {
							period:              $scope.current.period.format( 'YYYY-MM' ),
							mcc:                 $scope.current.mcc + '_gma_app',
							measurement_type_id: measurement.person_measurement_type_id,
							related_entity_id:   $scope.current.assignment.id,
							value:               measurement.my_values.gma_app
						} );
					}
				} );
				if ( measurements.length > 0 ) {
					measurementsService.save( {token: $scope.current.sessionToken}, measurements, function () {
						getMeasurements();
					} );
				}
			};

			$scope.editMeasurementDetails = function ( measurement ) {
				var instance = $modal.open( {
					templateUrl: 'measurement_details.html',
					controller:  'measurementDetailsController',
					keyboard:    true,
					backdrop:    true,
					resolve:     {
						'measurement': function () {
							return measurement;
						},
						'details':     function () {
							// Return the promise so resolve waits
							return measurementsService.get( {
								measurement_id: measurement.measurement_id,
								ministry_id:    $scope.current.assignment.ministry_id,
								mcc:            $scope.current.mcc,
								period:         $scope.current.period.format( 'YYYY-MM' ),
								token:          $scope.current.sessionToken
							} ).$promise;
						}
					}
				} );
				instance.result.then( function () {
					getMeasurements();
				} );
			};
		}] )
		.directive( 'measurementsTrend', [function () {
			return {
				restrict: 'A',
				require:  'ngModel',
				link:     function ( $scope, $element, $attrs, ngModel ) {
					if ( !ngModel ) return;
					var chart = new google.visualization.LineChart( $element.get( 0 ) );

					ngModel.$render = function () {
						chart.draw( ngModel.$viewValue, {width: 550, height: 200} );
					};

					$scope.$on( '$destroy', function () {
						chart = null;
					} );
				}
			}
		}] )
		.controller( 'measurementDetailsController', [
			'$scope', '$modalInstance', 'measurementsService', 'measurement', 'details',
			function ( $scope, $modalInstance, measurementsService, measurement, details ) {
				$scope.measurement = measurement;
				$scope.details = details;

				var da = [['Period', 'Local', 'Total', 'Personal']];
				angular.forEach( details.total, function ( t, period ) {
					angular.forEach( details.local, function ( l, p ) {
						if ( p === period ) {
							angular.forEach( details.my_measurements, function ( m, p ) {
								if ( p === period ) da.push( [p, l, t, m] )
							} );
						}
					} );
				} );
				$scope.trend = google.visualization.arrayToDataTable( da );

				$scope.filterSource = function ( items ) {
					var result = {};
					angular.forEach( items, function ( value, key ) {
						if ( key != 'gma_app' && key != 'total' ) {
							result[key] = value;
						}
					} );
					return result;
				};

				$scope.save = function () {
					var measurements = [];

					if ( $scope.editForm.hasOwnProperty( 'local' ) && typeof $scope.editForm.local.$modelValue !== 'undefined' ) {
						measurements.push( {
							period:              $scope.current.period.format( 'YYYY-MM' ),
							mcc:                 $scope.current.mcc + '_gma_app',
							measurement_type_id: $scope.details.measurement_type_ids.local,
							related_entity_id:   $scope.current.assignment.ministry_id,
							value:               $scope.editForm.local.$modelValue
						} );
					}

					if ( $scope.editForm.hasOwnProperty( 'personal' ) && typeof $scope.editForm.personal.$modelValue !== 'undefined' ) {
						measurements.push( {
							period:              $scope.current.period.format( 'YYYY-MM' ),
							mcc:                 $scope.current.mcc + '_gma_app',
							measurement_type_id: $scope.details.measurement_type_ids.person,
							related_entity_id:   $scope.current.assignment.id,
							value:               $scope.editForm.personal.$modelValue
						} );
					}

					if ( measurements.length > 0 ) {
						measurementsService.save( {token: $scope.current.sessionToken}, measurements, function () {
							$modalInstance.close();
						} );
					}
					else {
						$modalInstance.dismiss( 'cancel' );
					}
				};

				$scope.close = function () {
					$modalInstance.dismiss( 'cancel' );
				};

			}
		] );
} );

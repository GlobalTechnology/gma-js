define( ['app', 'underscore', 'measurementService', 'goog!visualization,1,packages:[corechart]'], function ( app, _ ) {
	app.controller( 'measurementsController', [
		'$scope', '$document', '$filter', '$modal', 'measurementService', 'settings',
		function ( $scope, $document, $filter, $modal, measurementService, settings ) {
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
			'$scope', '$modalInstance', 'measurementService', 'assignmentService', 'measurement', 'details', 'settings',
			function ( $scope, $modalInstance, measurementService, assignmentService, measurement, details, settings ) {
				$scope.spinner = true;
				$scope.measurement = measurement;
				$scope.details = details;
				$scope.ns = settings.gmaNamespace;

				$scope.details.$promise.then( function () {
					$scope.spinner = false;

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
				} );

				$scope.filterSource = function ( items ) {
					var result = {};
					angular.forEach( items, function ( value, key ) {
						if ( key != settings.gmaNamespace && key != 'total' ) {
							result[key] = value;
						}
					} );
					return result;
				};

				$scope.save = function () {
					$scope.spinner = true;
					var measurements = [];
					angular.forEach( ['local', 'person'], function ( type ) {
						if ( $scope.editForm.hasOwnProperty( type ) && $scope.editForm[type].$dirty && typeof $scope.editForm[type] !== 'undefined' ) {
							measurements.push( {
								period:              $scope.current.period.format( 'YYYY-MM' ),
								mcc:                 $scope.current.mcc + '_' + settings.gmaNamespace,
								measurement_type_id: $scope.details.measurement_type_ids[type],
								related_entity_id:   type == 'local'
									? $scope.current.assignment.ministry_id
									: $scope.current.assignment.id,
								value:               $scope.editForm[type].$modelValue
							} );
						}
					} );

					if ( measurements.length > 0 ) {
						measurementService.saveMeasurement( {}, measurements, function () {
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

				$scope.approveSelfAssigned = function ( user, role ) {
					var user = user;
					user.state = 'pending';
					assignmentService.saveAssignment( {
						assignment_id: user.assignment_id
					}, {team_role: role}, function () {
						if ( role == 'blocked' ) {
							user.state = 'blocked';
							user.blocked = true;
						} else {
							user.success = true;
							user.state = 'member';
						}
					}, function () {
						delete user.state;
					} );
				};

			}
		] );
} );

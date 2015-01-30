Date.prototype.yyyymm = function () {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
	var dd = this.getDate().toString();
	return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
};

define( ['gcmApp', 'measurement_service', 'goog!visualization,1,packages:[corechart]'], function ( gcmApp ) {
	(function ( $ ) {
		var measurements_controller = function ( $scope, $document, $filter, measurement_service ) {
			$scope.$parent.is_loaded = false;
			$scope.edit_measurement = {};

			$scope.$watch( 'assignment.ministry_id', function ( a ) {
				if ( $scope.assignment ) {
					if ( typeof $scope.assignment.ministry_id !== 'undefined' ) {
						$scope.current_mcc = $scope.assignment.mccs[Object.keys( $scope.assignment.mccs )[0]];
						measurement_service.getMeasurements( $scope.user.session_ticket, $scope.assignment.ministry_id, $scope.current_period, Object.keys( $scope.assignment.mccs )[0] ).then( $scope.onGetMeasurements, $scope.onError );
					}
				}
			} );

			$scope.$watch( 'assignment.mcc', function () {
				if ( typeof $scope.assignment !== 'undefined' ) {
					if ( typeof $scope.assignment.ministry_id !== 'undefined' ) {
						measurement_service.getMeasurements( $scope.user.session_ticket, $scope.assignment.ministry_id, $scope.current_period, $scope.assignment.mcc ).then( $scope.onGetMeasurements, $scope.onError );
					}
				}
			} );

			$scope.$watch( 'current_period', function () {
				if ( typeof $scope.assignment !== 'undefined' ) {
					if ( typeof $scope.assignment.ministry_id !== 'undefined' ) {
						measurement_service.getMeasurements( $scope.user.session_ticket, $scope.assignment.ministry_id, $scope.current_period, $scope.assignment.mcc ).then( $scope.onGetMeasurements, $scope.onError );
					}
				}
			} );

			$scope.filterSource = function ( items ) {
				var result = {};
				angular.forEach( items, function ( value, key ) {
					if ( key != 'gcmapp' && key != 'total' ) {
						result[key] = value;
					}
				} );
				return result;
			};

			$scope.onGetMeasurements = function ( response ) {
				$scope.assignment.measurements = response;
				$scope.$parent.is_loaded = true;
			};

			$scope.onGetMeasurementDetail = function ( response ) {
				$scope.edit_measurement.details = response;
				var da = [['Period', 'Local', 'Total', 'Personal']];
				angular.forEach( response.total, function ( t, period ) {
					angular.forEach( response.local, function ( l, p ) {
						if ( p === period ) {
							angular.forEach( response.my_measurements, function ( m, p ) {
								if ( p === period ) da.push( [p, l, t, m] )
							} );
						}
					} );
				} );

				var data = google.visualization.arrayToDataTable( da );
				var options = {
					width:  550,
					height: 200
				};

				var chart = new google.visualization.LineChart( $document[0].getElementById( 'measurement_graph' ) );
				chart.draw( data, options );
				$scope.is_detail_loaded = true;
			};

			$scope.getMeasurementDetail = function ( id ) {
				measurement_service.getMeasurementDetail( $scope.user.session_ticket, id, $scope.assignment.ministry_id, $scope.current_period, $scope.assignment.mcc ).then( $scope.onGetMeasurementDetail, $scope.onError );
			};

			$scope.getMeasurementName = function ( id ) {
				angular.forEach( $scope.assignment.sub_ministries, function ( m ) {
					if ( m.ministry_id === id ) {
						console.log( m.name );
						return m.name;
					}
				} );
				return "";
			};

			$scope.saveMeasurement = function () {
				console.log( 'sending _sage' );
				var values = [
					{
						period:              $scope.current_period,
						mcc:                 $scope.assignment.mcc + '_gcmapp',
						measurement_type_id: $scope.edit_measurement.details.measurement_type_ids.local,
						related_entity_id:   $scope.assignment.ministry_id,
						value:               $scope.edit_measurement.details.local_breakdown.gcmapp
					},
					{
						period:              $scope.current_period,
						mcc:                 $scope.assignment.mcc + '_gcmapp',
						measurement_type_id: $scope.edit_measurement.details.measurement_type_ids.person,
						related_entity_id:   $scope.assignment.id,
						value:               $scope.edit_measurement.details.my_measurements[$scope.current_period]
					}
				];

				//measurement_service.saveMeasurement($scope.user.session_ticket, $scope.edit_measurement.details.measurement_type_ids.local,
				//    $scope.assignment.ministry_id, $scope.current_period, $scope.assignment.mcc, $scope.edit_measurement.details.local[$scope.current_period]).then($scope.onSaveMeasurement, $scope.onSaveMeasurement);
				measurement_service.saveMeasurement( $scope.user.session_ticket, values ).then( $scope.onSaveMeasurement, $scope.onSaveMeasurement );
			};

			$scope.onSaveMeasurement = function ( response ) {
				console.log( 'gotback from save' );
				measurement_service.getMeasurements( $scope.user.session_ticket, $scope.assignment.ministry_id, $scope.current_period, $scope.assignment.mcc ).then( $scope.onGetMeasurements, $scope.onError );
				console.log( 'sent get all' )
				$scope.edit_measurement.details = {};
			};
		};

		gcmApp.controller( "measurementsController", ["$scope", '$document', '$filter', "measurement_service", measurements_controller] );

	})( jQuery );
} );

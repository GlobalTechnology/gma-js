(function () {
	'use strict';

	function MeasurementDetailsCtrl( $scope, $modalInstance, Measurements, Assignments, measurement, details, Settings, GoogleAnalytics ) {
		$scope.spinner = true;
		$scope.measurement = measurement;
		$scope.details = details;
		$scope.ns = Settings.gmaNamespace;

		var sendAnalytics = _.throttle( function () {
			GoogleAnalytics.screen( 'Measurement Details', (function () {
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
				if( angular.isDefined( $scope.details.perm_link_stub ) ) {
					dimensions[GoogleAnalytics.DIM.perm_link] = $scope.details.perm_link_stub;
				}
				return dimensions;
			})() );
		}, 1000, {leading: false} );

		$scope.details.$promise.then( function () {
			$scope.spinner = false;
			sendAnalytics();

			var da = [['Period', 'Personal', 'Local Team', 'Total']];
			angular.forEach( details.total, function ( t, period ) {
				angular.forEach( details.local, function ( l, p ) {
					if ( p === period ) {
						angular.forEach( details.my_measurements, function ( m, p ) {
							if ( p === period ) da.push( [p, m, l, t] )
						} );
					}
				} );
			} );
			$scope.trend = google.visualization.arrayToDataTable( da );
		} );

		$scope.filterSource = function ( items ) {
			var result = {};
			angular.forEach( items, function ( value, key ) {
				if ( key != Settings.gmaNamespace && key != 'total' ) {
					result[key] = value;
				}
			} );
			return result;
		};

		$scope.saveDetails = function () {
			$scope.spinner = true;
			var measurements = [];
			angular.forEach( ['local', 'person'], function ( type ) {
				if ( $scope.editForm.hasOwnProperty( type ) && $scope.editForm[type].$dirty && typeof $scope.editForm[type] !== 'undefined' ) {
					measurements.push( {
						period:              $scope.current.period.format( 'YYYY-MM' ),
						mcc:                 $scope.current.mcc,
						source:              Settings.gmaNamespace,
						measurement_type_id: $scope.details.measurement_type_ids[type],
						related_entity_id:   type == 'local'
							? $scope.current.assignment.ministry_id
							: $scope.current.assignment.id,
						value:               $scope.editForm[type].$modelValue
					} );
				}
			} );

			if ( measurements.length > 0 ) {
				Measurements.saveMeasurement( {}, measurements, function () {
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
			Assignments.saveAssignment( {
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

	angular.module( 'gma.controllers.measurements' ).controller( 'MeasurementDetailsCtrl', MeasurementDetailsCtrl );
})();

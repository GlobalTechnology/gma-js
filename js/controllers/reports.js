define( ['app', 'underscore', 'measurementService', 'goog!visualization,1,packages:[corechart]'], function ( app, _ ) {
	app.controller( 'ReportsController', [
		'$scope', '$document', 'measurementService', 'settings',
		function ( $scope, $document, measurementService, settings ) {

			// Debounced method to fetch Measurements at most once every 100 milliseconds
			var getMeasurements = _.debounce( function () {
				if ( typeof $scope.current.assignment !== 'undefined' && typeof $scope.current.period !== 'undefined' && typeof $scope.current.mcc !== 'undefined' ) {
					$scope.current.isLoaded = false;
					$scope.measurements = measurementService.getMeasurements( {
						ministry_id: $scope.current.assignment.ministry_id,
						mcc:         $scope.current.mcc,
						historical:  true
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

		}] );
} );

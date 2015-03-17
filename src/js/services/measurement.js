angular.module( 'app' )
	.factory( 'measurementService', [
		'$resource', 'settings',
		function ( $resource, settings ) {
			return $resource( settings.api.measurements( '/measurements/:measurement_id' ), {}, {
				getMeasurement:  {method: 'GET'},
				getMeasurements: {method: 'GET', isArray: true, params: {source: settings.gmaNamespace}},
				saveMeasurement: {method: 'POST'}
			} );
		}] );

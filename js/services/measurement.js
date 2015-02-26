define( ['app'], function ( app ) {
	app.factory( 'measurementService', [
		'$resource', 'settings',
		function ( $resource, settings ) {
			return $resource( settings.api.measurements( '/measurements/:measurement_id' ), {}, {
				getMeasurement:  {method: 'GET'},
				getMeasurements: {method: 'GET', isArray: true},
				saveMeasurement: {method: 'POST'}
			} );
		}] );
} );

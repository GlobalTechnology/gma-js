define( ['gcmApp'], function ( gcmApp ) {
	gcmApp.factory( 'measurementService', ['$resource', '$rootScope', function ( $resource, $rootScope ) {
		return $resource( $rootScope.GCM_APP.api_url + '/measurements/:measurement_id', {}, {
			getMeasurement:  {method: 'GET'},
			getMeasurements: {method: 'GET', isArray: true},
			saveMeasurement: {method: 'POST'}
		} );
	}] );
} );

define( ['gcmApp'], function ( gcmApp ) {
	gcmApp.factory( 'measurementsService', ['$resource', '$rootScope', function ( $resource, $rootScope ) {
		return $resource( $rootScope.GCM_APP.api_url + '/measurements/:measurement_id', {}, {
			get:   {method: 'GET', withCredentials: true},
			query: {method: 'GET', withCredentials: true, isArray: true},
			save:  {method: 'POST', withCredentials: true}
		} );
	}] );
} );

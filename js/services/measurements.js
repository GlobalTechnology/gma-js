define( ['gcmApp'], function ( gcmApp ) {
	gcmApp.factory( 'measurementsService', ['$resource', '$rootScope', function ( $resource, $rootScope ) {
		return $resource( $rootScope.GCM_APP.api_url + '/measurements/:measurement_id', {token: $rootScope.current.sessionToken}, {
			get:   {withCredentials: true},
			query: {withCredentials: true, isArray: true},
			save:  {withCredentials: true, method: 'POST'}
		} );
	}] );
} );

define( ['gcmApp'], function ( gcmApp ) {
	gcmApp.factory( 'sessionService', ['$http', '$rootScope', function ( $http, $rootScope ) {
		return {
			startSession: function ( ticket ) {
				return $http.get( $rootScope.GCM_APP.api_url + "/token?st=" + ticket, {withCredentials: true} )
					.then( function ( response ) {
						$rootScope.current.user = response.data.user;
						$rootScope.current.sessionToken = response.data.session_ticket;
						if ( typeof response.data.assignments === 'object' ) {
							$rootScope.current.assignments = response.data.assignments;
						} else {
							delete $rootScope.current.assignments;
						}
						return response.data;
					} );
			},
			request: function() {}
		}
	}] );
} );

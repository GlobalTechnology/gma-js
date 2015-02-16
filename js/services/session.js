define( ['angularAMD'], function ( angularAMD ) {
	angularAMD.factory( 'sessionService', ['$rootScope', '$injector', '$q', '$location', '$log', function ( $rootScope, $injector, $q, $location, $log ) {
		var token,
			queue = [];

		return {
			startSession:  function ( ticket ) {
				return $injector.get( '$http' ).get( $rootScope.GCM_APP.api_url + "/token?st=" + ticket, {withCredentials: true} )
					.then( function ( response ) {
						$rootScope.current.user = response.data.user;
						$rootScope.current.sessionToken = response.data.session_ticket;
						token = response.data.session_ticket;
						if ( typeof response.data.assignments === 'object' ) {
							$rootScope.current.assignments = response.data.assignments;
						} else {
							delete $rootScope.current.assignments;
						}
						return response.data;
					} );
			},
			logout:        function () {
				return $injector.get( '$http' ).delete( $rootScope.GCM_APP.api_url + '/token', {withCredentials: true} );
			},
			// Request Interceptor
			request:       function ( config ) {
				if ( config.url.indexOf( $rootScope.GCM_APP.api_url ) !== -1 ) {
					if ( typeof token !== 'undefined' ) {
						config.headers['Authorization'] = 'Bearer ' + token;
					}
					config.attempts = ( typeof config.attempts === 'number' ) ? config.attempts + 1 : 1;
				}
				return config;
			},
			// Error Response Interceptor
			responseError: function ( response ) {
				if( response.status == 401 && response.config.url.indexOf( $rootScope.GCM_APP.api_url ) !== -1 ) {
					$log.debug( response );
				}
				return response;
			}
		}
	}] );
} );

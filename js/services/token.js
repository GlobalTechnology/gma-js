define( ['gcmApp'], function ( app ) {
	app.factory( 'token', ['$http', function ( $http ) {
		return {
			getSession: function () {
				return $http.get( _api_url + "/token?st=" + GCM_APP.ticket, {withCredentials: true} )
					.then( function ( response ) {
						return response.data;
					} );
			}
		}
	}] );
} );

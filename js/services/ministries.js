define( ['gcmApp'], function ( app ) {
	app.factory( 'ministry_service', ['$http', function ( $http ) {
		return {
			getMinistries: function ( session_ticket ) {
				return $http.get( _api_url + "/ministries" + "?token=" + session_ticket, {withCredentials: true} )
					.then( function ( response ) {
						return response.data;
					} );
			},
			getMinistry:   function ( session_ticket, id ) {
				return $http.get( _api_url + "/ministries/" + id + "?token=" + session_ticket, {withCredentials: true} )
					.then( function ( response ) {
						return response.data;
					} );
			}
		};
	}] );
} );

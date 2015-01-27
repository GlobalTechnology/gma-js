(function ( $ ) {

	var ministry_service = function ( $http ) {

		var getMinistries = function ( session_ticket ) {
			this._apiResourceUrl = _api_url + "/ministries" + "?token=" + session_ticket;

			return $http.get( this._apiResourceUrl, {withCredentials: true} )
				.then( function ( response ) {
					return response.data;
				} );
		};

		var getMinistry = function ( session_ticket, id ) {
			this._apiResourceUrl = _api_url + "/ministries/" + id + "?token=" + session_ticket;

			return $http.get( this._apiResourceUrl, {withCredentials: true} )
				.then( function ( response ) {
					return response.data;
				} );
		};

		return {
			getMinistries: getMinistries,
			getMinistry:   getMinistry

		};
	};

	var app = angular.module( "gcmApp" );
	//Of the 20 ways you can register a service you create in Angular, this is by far the easiest
	app.factory( "ministry_service", ministry_service );

})( jQuery );

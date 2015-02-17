define( ['gcmApp', 'angular'], function ( gcmApp ) {
	gcmApp.factory( 'churchService', ['$resource', '$rootScope', function ( $resource, $rootScope ) {
		return $resource( $rootScope.GCM_APP.api_url + '/churches/:church_id', {}, {
			getChurch:   {method: 'GET'},
			getChurches: {method: 'GET', isArray: true},
			addChurch:   {method: 'POST'},
			saveChurch:  {method: 'PUT', params: {church_id: '@id'}}
		} );
	}] );
} );

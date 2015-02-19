define( ['gcmApp'], function ( gcmApp ) {
	gcmApp.factory( 'ministryService', [
		'$resource', '$rootScope',
		function ( $resource, $rootScope ) {
			return $resource( $rootScope.GCM_APP.api_url + '/ministries/:ministry_id', {}, {
				getMinistry:   {method: 'GET'},
				getMinistries: {method: 'GET', isArray: true},
				saveMinistry:  {method: 'PUT', params: {ministry_id: '@ministry_id'}}
			} );
		}] );
} );

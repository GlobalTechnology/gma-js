define( ['app'], function ( app ) {
	app.factory( 'ministryService', [
		'$resource', 'settings',
		function ( $resource, settings ) {
			return $resource( settings.api.measurements( '/ministries/:ministry_id' ), {}, {
				getMinistry:    {method: 'GET'},
				getMinistries:  {method: 'GET', isArray: true},
				updateMinistry: {method: 'PUT', params: {ministry_id: '@ministry_id'}},
				createMinistry: {method: 'POST'}
			} );
		}] );
} );

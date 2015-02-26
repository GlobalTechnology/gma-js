define( ['app', 'angular'], function ( app ) {
	app.factory( 'churchService', [
		'$resource', 'settings',
		function ( $resource, settings ) {
			return $resource( settings.api.measurements( '/churches/:church_id' ), {}, {
				getChurch:   {method: 'GET'},
				getChurches: {method: 'GET', isArray: true},
				addChurch:   {method: 'POST'},
				saveChurch:  {method: 'PUT', params: {church_id: '@id'}}
			} );
		}] );
} );

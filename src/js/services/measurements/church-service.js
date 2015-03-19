(function () {
	'use strict';

	function churchService( $resource, settings ) {
		return $resource( settings.api.measurements( '/churches/:church_id' ), {}, {
			getChurch:   {method: 'GET'},
			getChurches: {method: 'GET', isArray: true},
			addChurch:   {method: 'POST'},
			saveChurch:  {method: 'PUT', params: {church_id: '@id'}}
		} );
	}

	angular.module( 'gma.services.measurements' ).factory( 'churchService', churchService );
})();

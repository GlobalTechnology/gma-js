(function () {
	'use strict';

	function Churches( $resource, Settings ) {
		return $resource( Settings.api.measurements( '/churches/:church_id' ), {}, {
			getChurch:   {method: 'GET'},
			getChurches: {method: 'GET', isArray: true},
			addChurch:   {method: 'POST'},
			saveChurch:  {method: 'PUT', params: {church_id: '@id'}}
		} );
	}

	angular.module( 'gma.services.measurements' ).factory( 'Churches', Churches );
})();

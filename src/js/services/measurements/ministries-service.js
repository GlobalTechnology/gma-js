﻿(function () {
	'use strict';

	function Ministries( $resource, Settings ) {
		return $resource( Settings.api.measurements( '/ministries/:ministry_id' ), {}, {
			getMinistry:    {method: 'GET'},
			getMinistries:  {method: 'GET', isArray: true},
			updateMinistry: {method: 'PUT', params: {ministry_id: '@ministry_id'}},
			createMinistry: {method: 'POST'}
		} );
	}

	angular.module( 'gma.services.measurements' ).factory( 'Ministries', Ministries );

})();

(function ( angular ) {
	'use strict';
	angular.module( 'gma.controllers', [
		'gma.controllers.admin',
		'gma.controllers.error',
		'gma.controllers.map',
		'gma.controllers.measurements',
		'gma.controllers.reports',
		'gma.controllers.preference',
        'gma.controllers.stories'
	] );
})( angular );

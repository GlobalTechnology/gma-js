(function ( angular ) {
	'use strict';
	angular.module( 'gma', [
		'ngRoute',
		'ui.bootstrap',
		'ngResource',
		'gma.controllers',
		'gma.directives',
		'gma.filters',
		'gma.services',
		'ngDragDrop'
	] );
})( angular );

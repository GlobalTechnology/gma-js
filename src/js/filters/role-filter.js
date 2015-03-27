(function () {
	'use strict';

	angular.module( 'gma.filters' )
		.filter( 'roleFilter', [function () {
			return function ( items, role ) {
				var filtered = [];
				angular.forEach( items, function ( item ) {
					if ( typeof role === 'string' && role == item.team_role ) {
						filtered.push( item );
					} else if ( typeof role === 'object' && _.contains( role, item.team_role ) ) {
						filtered.push( item );
					}
				} );
				return filtered;
			};
		}] );
})();

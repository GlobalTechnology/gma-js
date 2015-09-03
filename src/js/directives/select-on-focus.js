(function () {
	'use strict';

	angular.module( 'gma.directives' )
		.directive( 'selectOnFocus', [function () {
			return {
				restrict: 'A',
				link:     function ( $scope, $element ) {
					var focusedElement;
					$element.on( 'focus', function () {
						if ( focusedElement != this ) {
							this.select();
							focusedElement = this;
						}
					} );
					$element.on( 'blur', function () {
						focusedElement = null;
					} );
                    $element.on( 'mouseup', function (evt) {
                        evt.preventDefault();
                        return false;
                    } );
				}
			};
		}] )
})();

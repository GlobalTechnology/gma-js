(function ( $ ) {
	'use strict';

	function JoinMinistryCtrl( $scope, $modalInstance, ministries, allowClose ) {
		$scope.ministries = ministries;
		$scope.allowClose = allowClose;

		window.setTimeout( function () {
			window.parent.scrollTo( 0, 0 );
		}, 10 );

		$scope.join = function () {
			$modalInstance.close( $scope.ministry );
		};

		$scope.cancel = function () {
			$modalInstance.dismiss( 'cancel' );
		};
	}

	angular.module( 'gma.controllers' ).controller( 'JoinMinistryCtrl', JoinMinistryCtrl );
})( jQuery );

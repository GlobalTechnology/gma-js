(function ( $ ) {
	'use strict';

	function JoinMinistryCtrl( $scope, $modalInstance, ministries, allowClose, GoogleAnalytics ) {
		$scope.ministries = ministries;
		$scope.allowClose = allowClose;

		// Google Analytics
		GoogleAnalytics.screen( 'Join Ministry', (function () {
			var dimensions = {};
			dimensions[GoogleAnalytics.DIM.guid] = $scope.current.user.key_guid;
			return dimensions;
		})() );

		window.setTimeout( function () {
			window.parent.scrollTo( 0, 0 );
		}, 10 );

		$scope.join = function () {
			var data = {};
			data.ministry =  $scope.ministry;
			data.user_preference = $scope.user_preference;
			$modalInstance.close( data );
		};

		$scope.cancel = function () {
			$modalInstance.dismiss( 'cancel' );
		};
	}

	angular.module( 'gma.controllers' ).controller( 'JoinMinistryCtrl', JoinMinistryCtrl );
})( jQuery );

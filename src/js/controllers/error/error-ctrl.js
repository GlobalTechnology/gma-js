(function () {
	'use strict';

	function ErrorCtrl( $scope, $routeParams, Settings ) {
		$scope.current.isLoaded = true;

		$scope.loginUrl = Settings.api.login;
	};

	angular.module( 'gma.controllers.error' ).controller( 'ErrorCtrl', ErrorCtrl );
}());

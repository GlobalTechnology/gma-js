(function () {
	'use strict';

	angular.module( 'gma.directives' )
		.directive( 'gmaTrend', [function () {
			return {
				restrict: 'A',
				require:  'ngModel',
				link:     function ( $scope, $element, $attrs, ngModel ) {
					if ( !ngModel ) return;
					var chart = new google.visualization.LineChart( $element.get( 0 ) );

					ngModel.$render = function () {
						chart.draw( ngModel.$viewValue, {width: 550, height: 200, chartArea: {width: '65%'}} );
					};

					$scope.$on( '$destroy', function () {
						chart = null;
					} );
				}
			}
		}] )
})();

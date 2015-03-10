define( ['app', 'underscore', 'measurementService', 'goog!visualization,1,packages:[corechart,table]'], function ( app, _ ) {
	app.controller( 'ReportsController', [
		'$scope', '$document', 'measurementService', 'settings',
		function ( $scope, $document, measurementService, settings ) {

			$scope.chart = new google.visualization.LineChart( document.getElementById( 'reports-chart' ) );
			$scope.table = new google.visualization.Table( document.getElementById( 'reports-table' ) );

			// Debounced method to fetch Measurements at most once every 100 milliseconds
			var getMeasurements = _.debounce( function () {
				if ( typeof $scope.current.assignment !== 'undefined' && typeof $scope.current.period !== 'undefined' && typeof $scope.current.mcc !== 'undefined' ) {
					delete $scope.dataTable;
					$scope.current.isLoaded = false;
					$scope.measurements = measurementService.getMeasurements( {
						ministry_id: $scope.current.assignment.ministry_id,
						mcc:         $scope.current.mcc,
						period:      $scope.current.period.format( 'YYYY-MM' ),
						historical:  true
					}, function () {
						$scope.current.isLoaded = true;

						var chartData = new google.visualization.DataTable(),
							tableData = new google.visualization.DataTable(),
							rows = [];
						chartData.addColumn( 'string', 'Date' );
						angular.forEach( $scope.dates, function ( date, index ) {
							rows[index] = [date];
							angular.forEach( $scope.measurements, function ( measurement ) {
								if ( index === 0 ) {
									chartData.addColumn( 'number', measurement.name );
								}
								rows[index].push( measurement.total[date] );
							} );
						} );
						chartData.addRows( rows );
						$scope.dataTable = chartData;

						tableData.addColumn( 'string', 'Measurement' );
						angular.forEach( $scope.measurements, function ( measurement, index ) {
							var row = [];
							angular.forEach( $scope.dates, function ( date ) {
								if ( index === 0 ) tableData.addColumn( 'number', date );
								row.push( measurement.total[date] );
							} );
							if ( index === 0 ) tableData.addColumn( 'number', 'Total' );
							tableData.addRow( [measurement.name].concat( row, [walterMeanAvg( row )] ) );
						} );
						$scope.tableDataTable = tableData;
					}, function () {
					} );
				}
			}, 100 );

			$scope.$watch( 'current.assignment.ministry_id', function () {
				getMeasurements();
			} );

			$scope.$watch( 'current.mcc', function () {
				getMeasurements();
			} );

			$scope.$watch( 'current.period', function ( period ) {
				if ( typeof period === 'undefined' ) return;
				getMeasurements();

				var now = period.clone(),
					dates = [];
				for ( var i = 0; i < 12; i++ ) {
					dates.push( now.clone().format( 'YYYY-MM' ) );
					now.subtract( 1, 'M' );
				}
				$scope.dates = dates.reverse();
			} );

			$scope.$watch( 'dataTable', function ( data ) {
				if ( typeof data === 'undefined' ) return;
				$scope.chart.draw( data, {
					chartArea:   {
						top:    20,
						left:   50,
						width:  '80%',
						height: '90%'
					},
					legend:      {
						alignment: 'start',
						position:  'right'
					},
					orientation: 'horizontal'
				} );
			} );

			$scope.$watch( 'tableDataTable', function ( data ) {
				if ( typeof data === 'undefined' ) return;
				$scope.table.draw( data, {} );
			} );

			function walterMeanAvg( data ) {
				// Drop zeros
				var values = [],
					total = 0;
				angular.forEach( data, function ( val ) {
					if ( val === 0 ) return;
					values.push( val );
				} );

				if ( values.length === 0 ) return 0;

				if ( values.length > 4 ) {
					// Sort array
					values.sort( function ( a, b ) {
						return a - b;
					} );

					// Remove first element, lowest
					values.shift();

					// Remove last element, highest
					values.pop();
				}

				// Sum the values
				angular.forEach( values, function ( val ) {
					total = total + val;
				} );

				// Return the average
				return Math.round( (total / values.length) * 100 ) / 100;
			}

		}] );
} );

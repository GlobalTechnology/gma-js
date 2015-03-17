angular.module( 'app' )
	.controller( 'gcmController', [
		'$scope', '$filter', '$location', '$modal', 'sessionService', 'ministryService', 'assignmentService', 'settings', '$log',
		function ( $scope, $filter, $location, $modal, sessionService, ministryService, assignmentService, settings, $log ) {
			// Attach $location provider to scope, this is used to set active tabs
			$scope.$location = $location;

			//---------------------------------------
			// Assignments
			//---------------------------------------

			$scope.$on( 'sessionStart', function ( event, session ) {
				if ( typeof session.assignments === 'undefined' ) {
					//Open Modal if user has no assignment
					$scope.joinMinistry( false );
				}
			} );

			// Update current assignment when assignments is set - this occurs after a session is established
			$scope.$watch( 'current.assignments', function ( assignments, oldVal ) {
				if ( assignments === oldVal ) return;

				$log.debug( 'Assignments Changed' );

				if ( typeof assignments === 'object' ) {
					if ( angular.isUndefined( $scope.current.assignment ) || !_.contains( _.pluck( assignments, 'id' ), $scope.current.assignment.id ) ) {
						$scope.current.assignment = $filter( 'orderBy' )( assignments, 'name' )[0];
					}
					$scope.current.ministries = flattenMinistries( assignments );
				} else {
					delete $scope.current.assignment;
					$scope.current.ministries = [];
				}
			} );

			// Update assignment and mcc when assignment changes
			$scope.$watch( 'current.assignment', function ( assignment, oldVal ) {
				if ( assignment === oldVal ) return;

				$log.debug( 'Assignment Changed: ' + assignment.name );

				if ( typeof assignment === 'object' ) {

					if ( assignment.mccs.length > 0 ) {
						// Set mcc if none is currently set or new assignment does not include current mcc
						if ( typeof $scope.current.mcc === 'undefined' || assignment.mccs.indexOf( $scope.current.mcc ) < 0 ) {
							$scope.current.mcc = $filter( 'orderBy' )( assignment.mccs, $scope.mccSort )[0];
						}
					}
					else {
						// Delete current mcc if assignment has no mccs
						delete $scope.current.mcc;
					}
				}
			} );

			$scope.current.hasRole = function ( role ) {
				if ( typeof $scope.current.assignment === 'undefined' || typeof $scope.current.assignment.team_role === 'undefined' ) return false;
				return (typeof role === 'string') ? role == $scope.current.assignment.team_role : _.contains( role, $scope.current.assignment.team_role );
			};

			function flattenMinistries( arr ) {
				var ministries = [];
				angular.forEach( arr, function ( ministry ) {
					ministries.push( ministry );
					if ( ministry.hasOwnProperty( 'sub_ministries' ) && typeof ministry.sub_ministries === 'object' ) {
						ministries = ministries.concat( flattenMinistries( ministry.sub_ministries ) );
					}
				} );

				//sort by team role
				ministries = _.sortBy( ministries, function ( m ) {
					return (m.team_role === 'leader' ? 0 : 1);
				} );
				//remove duplicates
				return _.uniq( ministries, false, function ( m ) {
					return m.ministry_id;
				} );
			}

			//---------------------------------------
			// Mission Critical Components (MCC)
			//---------------------------------------

			// MCC labels, this should be done in localization in the future.
			$scope.mccLabels = {
				ds:  'Digital Strategies',
				gcm: 'Global Church Movements',
				llm: 'Leader Led',
				slm: 'Student Led'
			};

			$scope.mccSort = function ( value ) {
				return $scope.mccLabels[value];
			};

			//---------------------------------------
			// Periods
			//---------------------------------------
			var periods = [], now = moment().date( 1 );
			for ( var i = 0; i < 12; i++ ) {
				periods.push( now.clone() );
				now.subtract( 1, 'M' );
			}
			$scope.periods = periods;
			$scope.current.period = periods[0];

			$scope.prevPeriod = function () {
				var index = $scope.periods.indexOf( $scope.current.period );
				index = ( ( index + 1 ) >= $scope.periods.length ) ? 0 : index + 1;
				$scope.current.period = $scope.periods[index];
			};

			$scope.nextPeriod = function () {
				var index = $scope.periods.indexOf( $scope.current.period );
				index = ( ( index - 1 ) < 0 ) ? $scope.periods.length - 1 : index - 1;
				$scope.current.period = $scope.periods[index];
			};

			//---------------------------------------
			// Session
			//---------------------------------------

			$scope.logout = function () {
				sessionService.logout().then( function () {
					window.location = settings.api.logout;
				} );
			};

			$scope.invalidateSession = function () {
				sessionService.logout();
			};

			$scope.joinMinistry = function ( allowClose ) {
				allowClose = typeof allowClose !== 'undefined' ? allowClose : true;
				var instance = $modal.open( {
					templateUrl: 'join_ministry.html',
					controller:  'joinMinistryController',
					keyboard:    allowClose,
					backdrop:    allowClose ? true : 'static',
					resolve:     {
						'ministries': function () {
							return ministryService.getMinistries().$promise;
						},
						'allowClose': function () {
							return allowClose;
						}
					}
				} );
				instance.result.then( function ( ministry ) {
					assignmentService.addTeamMember( {
						username:    $scope.current.user.cas_username,
						ministry_id: ministry.ministry_id,
						team_role:   'self_assigned'
					}, function ( assignment ) {
						if ( typeof $scope.current.assignments === 'undefined' ) {
							// If assignments is empty, setting the array will also set the current assignment
							$scope.current.assignments = [assignment];
						}
						else {
							// Add new assignment
							$scope.current.assignments.push( assignment );

							// Set new assignment as current
							$scope.current.assignment = assignment;
						}
					} );
				} );
			};

			$scope.onError = function ( response, code ) {
				if ( code == 401 && response.hasOwnProperty( 'reason' ) ) {
					if ( response.reason == 'SESSION_INVALID' ) {
						window.location = window.location.pathname;
					}
				}
				$scope.error = response.reason;
			};

			$scope.mobileApps = settings.mobileApps;
		}] )
	.controller( 'joinMinistryController', [
		'$scope', '$modalInstance', 'ministries', 'allowClose',
		function ( $scope, $modalInstance, ministries, allowClose ) {
			$scope.ministries = ministries;
			$scope.allowClose = allowClose;

			$scope.join = function () {
				$modalInstance.close( $scope.ministry );
			};

			$scope.cancel = function () {
				$modalInstance.dismiss( 'cancel' );
			};
		}] )
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



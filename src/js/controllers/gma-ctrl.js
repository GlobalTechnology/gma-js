(function () {
	'use strict';

	function GMACtrl( $scope, $filter, $location, $modal, Session, Ministries, Assignments, Settings, $log, GoogleAnalytics, UserPreference ) {
		// Attach $location provider to scope, this is used to set active tabs
		$scope.$location = $location;

		$scope.tabs = Settings.tabs;

		$scope.appEnvironment = Settings.appEnvironment;
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
		$scope.$watch('current.assignments', function (assignments, oldVal) {
			if (assignments === oldVal) return;

			$log.debug('Assignments Changed');

			//first time when page loads
			if (typeof assignments === 'object' && typeof oldVal === 'undefined') {

				if ($scope.current.hasOwnProperty('user_preferences') && typeof $scope.current.user_preferences !== 'undefined') {
					var flat_assignments = UserPreference.getFlatMinistry(assignments);
					//apply user preference
					var found_assignment = _.find(flat_assignments, function (ministry) {
						return (ministry.ministry_id === $scope.current.user_preferences.preferred_ministry);
					});

					if (typeof found_assignment !== 'undefined' && typeof found_assignment !=='') {
						$scope.current.assignment = found_assignment;
					} else {
						$scope.current.assignment = $filter('orderBy')(assignments, 'name')[0];

					}
				} else {
					//load first ministry if user preferences not found
					$scope.current.assignment = $filter('orderBy')(assignments, 'name')[0];

				}
				$scope.current.ministries = flattenMinistries(assignments);

			} else if (typeof assignments === 'object') {
				if (angular.isUndefined($scope.current.assignment) || !_.contains(_.pluck(assignments, 'id'), $scope.current.assignment.id)) {

					$scope.current.assignment = $filter('orderBy')(assignments, 'name')[0];

				}
				$scope.current.ministries = flattenMinistries(assignments);
			} else {
				delete $scope.current.assignment;
				$scope.current.ministries = [];
			}

		});

		// Update assignment and mcc when assignment changes
		$scope.$watch('current.assignment', function (assignment, oldVal) {
			if (assignment === oldVal) return;

			$log.debug('Assignment Changed: ' + assignment.name);

			if (typeof assignment === 'object') {

				if (assignment.mccs.length > 0) {
					//check if first time
					if (typeof oldVal === 'undefined') {
						if ($scope.current.hasOwnProperty('user_preferences') && typeof $scope.current.user_preferences !== 'undefined') {
							//apply user preference here
							var user_mcc = _.find(assignment.mccs, function (mcc) {
								return (mcc === $scope.current.user_preferences.preferred_mcc);
							});

							if (typeof user_mcc !== 'undefined' && typeof user_mcc !== '') {
								$scope.current.mcc = user_mcc;

							} else {
								//check for admin preferences
								var admin_mcc = _.find(assignment.mccs, function (mcc) {
									return (mcc === $scope.current.assignment.default_mcc);
								});
								if (typeof admin_mcc !== 'undefined' || admin_mcc !== '') {
									$scope.current.mcc = admin_mcc;
								} else {
									//if admin preferences not found then use fist one
									$scope.current.mcc = $filter('orderBy')(assignment.mccs, $scope.mccSort)[0];
								}
							}

						} else {
							// Set mcc if none is currently set or new assignment does not include current mcc
							if (typeof $scope.current.mcc === 'undefined' || assignment.mccs.indexOf($scope.current.mcc) < 0) {
								$scope.current.mcc = $filter('orderBy')(assignment.mccs, $scope.mccSort)[0];
							}
						}
					} else {
						// Set mcc if none is currently set or new assignment does not include current mcc
						if (typeof $scope.current.mcc === 'undefined' || assignment.mccs.indexOf($scope.current.mcc) < 0) {
							$scope.current.mcc = $filter('orderBy')(assignment.mccs, $scope.mccSort)[0];
						}
					}

				}
				else {
					// Delete current mcc if assignment has no mccs
					delete $scope.current.mcc;
				}
			}
		});

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
			Session.logout().then( function () {
				window.location = Settings.api.logout;
			} );
		};

		$scope.invalidateSession = function () {
			Session.logout();
		};

		$scope.joinMinistry = function ( allowClose ) {
			allowClose = typeof allowClose !== 'undefined' ? allowClose : true;

			var instance = $modal.open( {
				templateUrl: 'partials/join-ministry.html',
				controller:  'JoinMinistryCtrl',
				keyboard:    allowClose,
				backdrop:    allowClose ? true : 'static',
				resolve:     {
					'ministries': function () {
						return Ministries.getMinistries().$promise;
					},
					'allowClose': function () {
						return allowClose;
					}
				}
			} );

			instance.result.then( function ( data ) {
				
				Assignments.addTeamMember( {
					username:    $scope.current.user.cas_username,
					ministry_id: data.ministry.ministry_id,
					team_role:   'self_assigned'
				}, function ( assignment ) {
					if ( typeof $scope.current.assignments === 'undefined' ) {
						// If assignments is empty, setting the array will also set the current assignment
						$scope.current.assignments = [assignment];

						//Also updating supported staff setting in user preference
						UserPreference.savePreference(data.user_preference)
							.success(function (){
								if(typeof $scope.current.user_preferences === 'undefined'){
									$scope.current.user_preferences = {};
								}

								$scope.current.user_preferences.supported_staff = data.user_preference.supported_staff;
							});
					}
					else {
						// Add new assignment
						$scope.current.assignments.push( assignment );

						// Set new assignment as current
						$scope.current.assignment = assignment;
					}

					// Google Analytics
					GoogleAnalytics.event( 'assignments', 'join ministry', (function () {
						var dimensions = {};
						dimensions[GoogleAnalytics.DIM.guid] = $scope.current.user.key_guid;
						dimensions[GoogleAnalytics.DIM.ministry_id] = assignment.ministry_id;
						return dimensions;
					})() );
				} );
			} );
		};

		$scope.onError = function ( response, code ) {
			$location.path( '/error' );
		};

		$scope.mobileApps = Settings.mobileApps;

		//---------------------------------------
		// User Preferences Dialog
		//---------------------------------------

		$scope.showUserPreference = function(){

			$modal.open( {
				templateUrl: 'partials/preference/user-preference-modal.html',
				controller:  'UserPreferenceCtrl',
				keyboard:     true,
				backdrop:     true,
				size : 		  'model-lg',
				resolve:     {
					modelData: function () {
						return {
							mccLabels: $scope.mccLabels
						}
					}
				}
			} );

            window.setTimeout( function () {
                window.parent.scrollTo( 0, 0 );
            }, 10 );

		};
		/**
		 * Sends true to show, false to hide
		 * @param tab
		 * @returns {boolean}
		 */
        $scope.hideTabsConditionally = function (tab) {
            //current may not be defined
            if (typeof $scope.current === 'undefined') return true;

            if (tab.path == '/reports') {
                //user preferences not found
                if (typeof $scope.current.user_preferences === 'undefined') {
                	//send admin preferences
                    return ($scope.current.hide_reports_tab != '1');
                }
                //lastly send user preferences
                return ($scope.current.user_preferences.hide_reports_tab !== '1');
            } else if (tab.path == '/measurements') {
                //if current ministry has no mcc then hide the tab
                return (typeof $scope.current.mcc !== 'undefined');
            } else {
                return true;
            }

        };
        /**
         * Show logged in user role on top navigation
         * @param role
         * @returns {string}
         */
		$scope.getCurrentUserRole = function(role){
			if (typeof role === 'undefined') return;
			//capitalize first latter
			return role.charAt(0).toUpperCase() + role.slice(1).replace('_',' ');
		}

	}

	angular.module( 'gma.controllers' ).controller( 'GMACtrl', GMACtrl );
})();

(function () {
	'use strict';

	function AdminCtrl( $scope, $modal, $filter, Assignments, Ministries, MeasurementTypes, GoogleAnalytics ) {
		$scope.current.isLoaded = false;

		$scope.roles = [
			{value: "admin", text: 'Admin'},
			{value: "inherited_admin", text: 'Admin (inherited)'},
			{value: "leader", text: 'Leader'},
			{value: "inherited_leader", text: "Leader (inherited)"},
			{value: "member", text: 'Member'},
			{value: "blocked", text: 'Deleted'},
			{value: "self_assigned", text: 'Self Assigned'}
		];

		$scope.mccs = [
			{value: 'ds', text: 'Digital Strategies'},
			{value: 'gcm', text: 'Global Church Movements'},
			{value: 'llm', text: 'Leader Led'},
			{value: 'slm', text: 'Student Led'}
		];

		$scope.includeBlocked = false;

		var sendAnalytics = _.throttle( function () {
			GoogleAnalytics.screen( 'Admin', (function () {
				var dimensions = {};
				dimensions[GoogleAnalytics.DIM.guid] = $scope.current.user.key_guid;
				dimensions[GoogleAnalytics.DIM.ministry_id] = $scope.current.assignment.ministry_id;
				return dimensions;
			})() );
		}, 1000, {leading: false} );

		$scope.$watch( 'current.assignment.ministry_id', function ( ministry_id ) {
			if ( typeof ministry_id === 'undefined' ) return;
			sendAnalytics();
			$scope.ministry = Ministries.getMinistry( {ministry_id: ministry_id}, function () {
				$scope.current.isLoaded = true;

				$scope.measurementTypes = [];
				MeasurementTypes.getMeasurementTypes().$promise.then( function ( data ) {
					angular.forEach( data, function ( type ) {
						if ( type.is_custom && _.contains( $scope.ministry.lmi_show, type.perm_link_stub ) ) {
							type.visible = true;
						} else if ( !type.is_custom && !_.contains( $scope.ministry.lmi_hide, type.perm_link_stub ) ) {
							type.visible = true;
						} else {
							type.visible = false;
						}
						$scope.measurementTypes.push( type );
					} );
				} );
			} );
		} );


		$scope.ableToChangeParentMinistry = function ( parentToFind ) {
			var availableMinIds = _.pluck( $filter( 'roleFilter' )( $scope.current.ministries, ['admin','inherited_admin','leader', 'inherited_leader'] ), 'ministry_id' );
			return _.contains( availableMinIds, parentToFind );
		};

		$scope.addSubMinistry = function () {
			$modal.open( {
				templateUrl: 'partials/admin/add-sub-ministry.html',
				controller:  function ( $scope, $modalInstance ) {
					$scope.close = function () {
						$modalInstance.dismiss();
					};

					$scope.add = function () {
						$modalInstance.close( $scope.newMinistry );
					};
				}
			} ).result.then( function ( newMinistry ) {
					newMinistry.parent_id = $scope.current.assignment.ministry_id;
					Ministries.createMinistry( newMinistry, function () {
						if ( angular.isDefined( $scope.current.assignment.sub_ministries ) ) {
							$scope.current.assignment.sub_ministries.push( newMinistry );
						} else {
							$scope.current.assignment.sub_ministries = [newMinistry];
						}
					} );
				} );
		};

		$scope.addMeasurement = function () {
			$modal.open( {
				templateUrl: 'partials/admin/add-measurement-type.html',
				controller:  function ( $scope, $modalInstance ) {
					$scope.close = function () {
						$modalInstance.dismiss();
					};

					$scope.add = function () {
						$modalInstance.close( $scope.newMeasurement );
					};
				}
			} ).result.then( function ( newMeasurement ) {
					MeasurementTypes.addMeasurementType( newMeasurement, function () {
					} );
				} );
		};

		$scope.saveDetails = function () {
			//additional check if admin un-select all mccs then default_mcc should be empty
			if(_.size($scope.mccs)==0){
				$scope.ministry.default_mcc= '';
			}

			var ministry = {
				ministry_id: $scope.ministry.ministry_id,
				min_code:    $scope.ministry.min_code,
				name:        $scope.ministry.name,
				mccs:        $scope.ministry.mccs,
				private:     $scope.ministry.private,
				hide_reports_tab: $scope.ministry.hide_reports_tab,
				default_mcc : $scope.ministry.default_mcc,
				lmi_hide:    _.pluck( _.where( $scope.measurementTypes, {
					is_custom: false,
					visible:   false
				} ), 'perm_link_stub' ),
				lmi_show:    _.pluck( _.where( $scope.measurementTypes, {
					is_custom: true,
					visible:   true
				} ), 'perm_link_stub' )
			};
			if ( $scope.ministry.hasOwnProperty( 'parent_id' ) && typeof $scope.ministry.parent_id === "string" ) {
				ministry.parent_id = $scope.ministry.parent_id;
			}
			$scope.saveDetailsResource = Ministries.updateMinistry( ministry,
				function () {
					$scope.saveDetailsAlert = {
						type: 'success',
						msg:  'Your changes have been saved.'
					};
				}, function ( response ) {
					$scope.saveDetailsAlert = {
						type: 'danger',
						msg:  response.Message || 'An error occurred while saving.'
					};
				} );
		};

		//function initializes sub-tabs of admin section
		$scope.initSubTabs = function () {

			//load all tab urls to scope
			$scope.adminTabTemplates = getAdminSubTabTemplates();

			//this is the default pill
			if (typeof $scope.activePill === 'undefined') {
				$scope.activePill = 'team-members';
			}
			//selecting current view for very first time
			$scope.selectTab($scope.activePill);
		};

		//function selects current sub-tab for admin section
		$scope.selectTab = function (tab) {

			$scope.activePill = tab;

			if (typeof tab === 'undefined') {
				$scope.activePill = 'team-members';
			}

			//selecting current tab view
			$scope.currentAdminTab = _.find(getAdminSubTabTemplates(), function (template) {
				return (template.name === tab);
			});
		};

		var getAdminSubTabTemplates = function () {

			return [
				{
					url: 'partials/admin/_team-members.html',
					name: 'team-members',
					label: 'Team Members',
					requiredRoles: ['admin', 'inherited_admin', 'leader', 'inherited_leader']
				},
				{
					url: 'partials/admin/_sub-ministry.html',
					name: 'sub-ministry',
					label: 'Sub Teams/Ministries',
					requiredRoles: ['admin', 'inherited_admin']

				},
				{
					url: 'partials/admin/_edit-ministry.html',
					name: 'edit-ministry',
					label: 'Edit Ministry',
					requiredRoles: ['admin', 'inherited_admin']
				},
				{
					url: 'partials/admin/_measurement.html',
					name: 'measurement',
					label: 'Manage Measurements',
					requiredRoles: ['admin', 'inherited_admin']
				}
			];
		};

		$scope.initTeamAndMembers = function () {
			$scope.allCurrentTeams = [];
			$scope.allCurrentTeams.push($scope.current.assignment);
			$scope.activeTeamMembers = $scope.ministry.team_members;
			//first time init
			$scope.activeTeamMinistryId= $scope.current.assignment.ministry_id;
			$scope.membersLoaded = true;
		};

		$scope.setActiveTeam = function (team) {
			//prevent ajax request if clicked team is already active
			if ($scope.activeTeamMinistryId===team.ministry_id) {
				return false;
			}

			$scope.activeTeamMinistryId = team.ministry_id;
			$scope.membersLoaded = false;
			//pull down the selected ministry team members, and update scope
			Ministries.getMinistry({ministry_id: team.ministry_id}, function (response) {
				$scope.activeTeamMembers = response.team_members;
				$scope.membersLoaded = true;
			});

		};

		$scope.filter = {
			memberSearch: '',
			inheritedLeader: true,
			inheritedAdmin: true,
			deletedUser: true,
			checkDeleted: function (item) {
				return $scope.filter.deletedUser ? true : item.team_role != 'blocked';
			},
			checkLeader: function (item) {
				return $scope.filter.inheritedLeader ? true : item.team_role != 'inherited_leader';
			},
			checkAdmin: function (item) {
				return $scope.filter.inheritedAdmin ? true : item.team_role != 'inherited_admin';
			}

		};

		$scope.addNewTeamMember = function () {
			$modal.open({
				templateUrl: 'partials/admin/add-team-member.html',
				controller: function ($scope, $modalInstance, roles) {
					$scope.roles = roles;

					$scope.close = function () {
						$modalInstance.dismiss();
					};

					$scope.add = function () {
						$modalInstance.close($scope.newMember);
					};
				},
				resolve: {
					'roles': function () {
						return $scope.roles;
					}
				}
			}).result.then(function (newMember) {
					newMember.ministry_id = $scope.activeTeamMinistryId;
					Assignments.addTeamMember(newMember, function () {
						Ministries.getMinistry({ministry_id: $scope.activeTeamMinistryId}, function (response) {
							$scope.activeTeamMembers = response.team_members;
						});
					});
				});
			window.setTimeout( function () {
				window.parent.scrollTo( 0, 0 );
			}, 10 );
		};

		$scope.updateUserRole = function (old_role, user) {
			//prevent
			console.log(old_role);
			if (old_role === user.team_role) return false;

			$modal.open({
				animation: false,
				backdrop: false,
				templateUrl: 'partials/admin/confirm-update-role.html',
				controller: function ($scope, $modalInstance, userInfo) {
					$scope.userInfo = userInfo;
					$scope.choice = 0;

					$scope.no = function () {
						$modalInstance.close($scope.choice);
					};

					$scope.yes = function () {
						$modalInstance.close($scope.choice);
					};
					$scope.getRoleName = function (role) {
						if (typeof role === 'undefined') return;
						return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
					}
				},
				resolve: {
					'userInfo': function () {
						return {
							old_role: old_role,
							user: user
						};
					}
				}
			}).result.then(function (choice) {
					if (choice === 1) {
						//update user role
						Assignments.saveAssignment({assignment_id: user.assignment_id}, {team_role: user.team_role}, function () {
							//success so update old_role
							console.log('updated');
							old_role = user.team_role;

						}, function () {
							//failed so restore
							user.team_role = old_role;
						});
					} else {
						//restore user role
						user.team_role = old_role;
					}

				});

			window.setTimeout( function () {
				window.parent.scrollTo( 0, 0 );
			}, 10 );

		};

	}
	angular.module( 'gma.controllers.admin' ).controller( 'AdminCtrl', AdminCtrl );
}());

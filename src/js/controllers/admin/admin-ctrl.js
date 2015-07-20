(function () {
	'use strict';

	function AdminCtrl( $scope, $modal, $filter, Assignments, Ministries, MeasurementTypes, GoogleAnalytics ) {
		$scope.current.isLoaded = false;

		$scope.roles = [
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

		$scope.saveRole = function ( assignment ) {
			Assignments.saveAssignment( {
				assignment_id: assignment.assignment_id
			}, {team_role: assignment.team_role} );
		};

		$scope.ableToChangeParentMinistry = function ( parentToFind ) {
			var availableMinIds = _.pluck( $filter( 'roleFilter' )( $scope.current.ministries, ['leader', 'inherited_leader'] ), 'ministry_id' )
			return _.contains( availableMinIds, parentToFind );
		};

		$scope.memberFilter = function ( value ) {
			return $scope.includeBlocked ? true : value.team_role != 'blocked';
		};

		$scope.addTeamMember = function () {
			$modal.open( {
				templateUrl: 'partials/admin/add-team-member.html',
				controller:  function ( $scope, $modalInstance, roles ) {
					$scope.roles = roles;

					$scope.close = function () {
						$modalInstance.dismiss();
					};

					$scope.add = function () {
						$modalInstance.close( $scope.newMember );
					};
				},
				resolve:     {
					'roles': function () {
						return $scope.roles;
					}
				}
			} ).result.then( function ( newMember ) {
					newMember.ministry_id = $scope.current.assignment.ministry_id;
					Assignments.addTeamMember( newMember, function () {
						$scope.ministry = Ministries.getMinistry( {ministry_id: $scope.current.assignment.ministry_id} );
					} );
				} );
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

		//function initializes tab of admin section
		$scope.initTabs = function (tab) {
			//selecting default tab
			$scope.pill = tab;
			if(typeof tab === 'undefined'){
				$scope.pill = 'ministry';
			}

			//all tab urls
			$scope.adminTabTemplates = [
				{
					url : 'partials/admin/_ministry.html',
					name : 'ministry'
				},
				{
					url : 'partials/admin/_edit.html',
					name : 'edit'
				},
				{
					url : 'partials/admin/_measurement.html',
					name : 'measurement'
				}
			];

			//selecting current view to include
			$scope.selectTab($scope.pill);
		};

		//function selects tab for admin section 
		$scope.selectTab = function (tab) {
			$scope.pill = tab;
			if(typeof tab === 'undefined'){
				$scope.pill = 'ministry';
			}

			//selecting current tab view
			$scope.adminTabTemplate = _.find($scope.adminTabTemplates, function (template){
				if(template.name === tab){
					return true;
				}
				return false;
			});
		};

	}
	angular.module( 'gma.controllers.admin' ).controller( 'AdminCtrl', AdminCtrl );
}());

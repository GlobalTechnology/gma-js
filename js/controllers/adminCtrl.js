define( ['app', 'assignmentService', 'ministryService', 'measurementTypeService'], function ( app ) {
	app.controller( 'adminController', [
		'$scope', '$modal', 'assignmentService', 'ministryService', 'measurementTypeService',
		function ( $scope, $modal, assignmentService, ministryService, measurementTypeService ) {
			$scope.current.isLoaded = false;

			$scope.roles = [
				{value: "leader", text: 'Leader'},
				{value: "inherited_leader", text: "Leader (inherited)"},
				{value: "member", text: 'Member'},
				{value: "blocked", text: 'Blocked'},
				{value: "self_assigned", text: 'Self Assigned'}
			];

			$scope.$watch( 'current.assignment.ministry_id', function ( ministry_id ) {
				if ( typeof ministry_id === 'undefined' ) return;
				$scope.ministry = ministryService.getMinistry( {ministry_id: ministry_id}, function () {
					$scope.current.isLoaded = true;

					$scope.measurementTypes = [];
					measurementTypeService.getMeasurementTypes().$promise.then(function(data){
						angular.forEach(data, function(type){
							if(type.is_custom && _.contains($scope.ministry.lmi_show, type.Id)){
								type.visible = true;
							}else if(!type.is_custom && !_.contains($scope.ministry.lmi_hide, type.Id)){
								type.visible = true;
							}else{
								type.visible = false;
							}
							$scope.measurementTypes.push(type);
						});
					});
				} );
			} );

			$scope.saveRole = function ( assignment ) {
				assignmentService.saveAssignment( {
					assignment_id: assignment.assignment_id
				}, {team_role: assignment.team_role} );
			};

            $scope.addTeamMember = function () {
                $modal.open({
                    templateUrl: 'add_team_member.html',
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
                        newMember.ministry_id = $scope.current.assignment.ministry_id;
                        assignmentService.addTeamMember(newMember, function () {
                            $scope.ministry = ministryService.getMinistry({ministry_id: $scope.current.assignment.ministry_id});
                        });
                    });
            };

            $scope.addSubMinistry = function () {
                $modal.open({
                    templateUrl: 'add_sub_ministry.html',
                    controller: function ($scope, $modalInstance) {
                        $scope.close = function () {
                            $modalInstance.dismiss();
                        };

                        $scope.add = function () {
                            $modalInstance.close($scope.newMinistry);
                        };
                    }
                }).result.then(function (newMinistry) {
                        newMinistry.parent_id = $scope.current.assignment.ministry_id;
                        ministryService.createMinistry(newMinistry, function () {
                            $scope.current.assignment.sub_ministries.push(newMinistry);
                        });
                    });
            };

            $scope.saveDetails = function () {
				var ministry = {
					ministry_id: $scope.ministry.ministry_id,
					min_code: $scope.ministry.min_code,
					name: $scope.ministry.name,
					has_ds: $scope.ministry.has_ds,
					has_gcm: $scope.ministry.has_gcm,
					has_llm: $scope.ministry.has_llm,
					has_slm: $scope.ministry.has_slm,
					private: $scope.ministry.private,
					lmi_hide: _.pluck(_.where($scope.measurementTypes, {is_custom: false, visible: false}), 'Id'),
					lmi_show: _.pluck(_.where($scope.measurementTypes, {is_custom: true, visible: true}), 'Id')
				};
				if( $scope.ministry.hasOwnProperty('parent_id') && typeof $scope.ministry.parent_id === "string" ) {
					ministry.parent_id = $scope.ministry.parent_id;
				}
                $scope.saveDetailsResource = ministryService.updateMinistry( ministry,
				function () {
                    $scope.saveDetailsAlert = {
                        type: 'success',
                        msg: 'Your changes have been saved.'
                    };
                }, function (response) {
                    $scope.saveDetailsAlert = {
                        type: 'danger',
                        msg: response.Message || 'An error occurred while saving.'
                    };
                });
            };
        }]);
} );

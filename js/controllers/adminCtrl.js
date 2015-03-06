define( ['app', 'assignmentService', 'ministryService'], function ( app ) {
	app.controller( 'adminController', [
		'$scope', 'assignmentService', 'ministryService',
		function ( $scope, assignmentService, ministryService ) {
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
				} );
			} );

			$scope.saveRole = function ( assignment ) {
				assignmentService.saveAssignment( {
					assignment_id: assignment.assignment_id
				}, {team_role: assignment.team_role} );
				$scope.newMember = {};
			};

			$scope.addTeamMember = function () {
				$scope.newMember.ministry_id = $scope.current.assignment.ministry_id;
				assignmentService.addTeamMember( $scope.newMember, function () {
					$scope.ministry = ministryService.getMinistry( {ministry_id: $scope.current.assignment.ministry_id} );
				} );
			};

			$scope.changeParent = function() {
        $scope.changeParentResource = ministryService.updateMinistry( {
					ministry_id: $scope.ministry.ministry_id,
          min_code: $scope.ministry.min_code,
					parent_id: $scope.ministry.parent_id
				}, function(){
          $scope.changeParentAlert = {
            type: 'success',
            msg: 'Parent ministry has been saved.'
          };
        }, function(response){
          $scope.changeParentAlert = {
            type: 'danger',
            msg: response.Message || 'An error occurred while saving.'
          };
        });
			};

      $scope.saveDetails = function(){
        $scope.saveDetailsResource = ministryService.updateMinistry( {
          ministry_id: $scope.ministry.ministry_id,
          min_code: $scope.ministry.min_code,
          name: $scope.ministry.name,
          has_ds: $scope.ministry.has_ds,
          has_gcm: $scope.ministry.has_gcm,
          has_llm: $scope.ministry.has_llm,
          has_slm: $scope.ministry.has_slm,
          private: $scope.ministry.private
        }, function(){
          $scope.saveDetailsAlert = {
            type: 'success',
            msg: 'Your changes have been saved.'
          };
        }, function(response){
          $scope.saveDetailsAlert = {
            type: 'danger',
            msg: response.Message || 'An error occurred while saving.'
          };
        });
      };
		}] );
} );

define( ['gcmApp', 'assignmentService', 'ministryService'], function ( gcmApp ) {
	gcmApp.controller( 'adminController', [
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
					assignment_id: s.assignment_id
				}, {team_role: s.team_role} );
				$scope.newMember = {};
			};

			$scope.addTeamMember = function () {
				$scope.newMember.ministry_id = $scope.current.assignment.ministry_id;
				assignmentService.addTeamMember( {}, $scope.newMember, function () {
					console.log( 'adding_team_member' );
				} );
			};
		}] );
} );

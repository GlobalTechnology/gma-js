(function () {
    'use strict';

    function TeamMembersCtrl($scope, $modal, Assignments, Ministries) {

        $scope.roles = [
            {value: "admin", text: 'Admin'},
            {value: "inherited_admin", text: 'Admin (inherited)'},
            {value: "leader", text: 'Leader'},
            {value: "inherited_leader", text: "Leader (inherited)"},
            {value: "member", text: 'Member'},
            {value: "blocked", text: 'Deleted'},
            {value: "self_assigned", text: 'Self Assigned'}
        ];


        $scope.initTeamAndMembers = function () {
            $scope.allCurrentTeams = [];
            $scope.allCurrentTeams.push($scope.current.assignment);

            $scope.activeTeamMembers = {};
            if ($scope.ministry.hasOwnProperty('team_members')) {
                $scope.activeTeamMembers = $scope.ministry.team_members;
            }
            //activate first top most team
            $scope.activeTeam = $scope.current.assignment;
            $scope.membersLoaded = true;
        };

        $scope.setActiveTeam = function (team) {
            //prevent ajax request if clicked team is already active
            if ($scope.activeTeam.ministry_id === team.ministry_id) {
                return false;
            }

            $scope.activeTeam = team;
            $scope.membersLoaded = false;
            //pull down the selected ministry team members, and update scope
            Ministries.getMinistry({ministry_id: team.ministry_id}, function (response) {
                $scope.activeTeamMembers = response.team_members;
                $scope.membersLoaded = true;
            }, function () {
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
                    newMember.ministry_id = $scope.activeTeam.ministry_id;
                    Assignments.addTeamMember(newMember, function () {
                        //refresh current team member list
                        //todo server is not saving new user properly,check it
                        /*Ministries.getMinistry({ministry_id: $scope.activeTeam.ministry_id}, function (response) {
                            $scope.activeTeamMembers = response.team_members;
                         });*/
                    });
                });
            scrollToTop();
        };

        $scope.updateUserRole = function (old_role, user) {

            if (old_role === user.team_role) {
                return false;
            }

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
                            old_role = user.team_role;

                        }, function () {
                            //failed so lets restore
                            user.team_role = old_role;
                        });
                    } else {
                        //restore user role
                        user.team_role = old_role;
                    }

                });

            scrollToTop();

        };

        $scope.addNewSubMinistry = function () {
            $modal.open({
                templateUrl: 'partials/admin/add-sub-ministry.html',
                controller: function ($scope, $modalInstance) {
                    $scope.close = function () {
                        $modalInstance.dismiss();
                    };

                    $scope.add = function () {
                        $modalInstance.close($scope.newMinistry);
                    };
                }
            }).result.then(function (newMinistry) {

                    newMinistry.parent_id = $scope.activeTeam.ministry_id;

                    Ministries.createMinistry(newMinistry, function () {
                        //append response data to $scope.activeTeam
                        //todo server should send proper response with all properties of newly added ministry
                        /*Ministries.getMinistry({ministry_id: $scope.current.assignment.ministry_id}).$promise.then(function (data){
                            var data = angular.fromJson(angular.toJson(data));
                         });*/
                    });
                });

            scrollToTop();

        };

        function scrollToTop() {
            window.setTimeout(function () {
                window.parent.scrollTo(0, 0);
            }, 10);
        }
    }

    angular.module('gma.controllers.admin').controller('TeamMembersCtrl', TeamMembersCtrl);
}());

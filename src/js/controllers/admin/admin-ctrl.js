(function () {
    'use strict';

    function AdminCtrl($scope, $filter, $modal, Assignments, MeasurementTypes, GoogleAnalytics, Ministries) {
        $scope.current.isLoaded = false;

        var sendAnalytics = _.throttle(function () {
            GoogleAnalytics.screen('Admin', (function () {
                var dimensions = {};
                dimensions[GoogleAnalytics.DIM.guid] = $scope.current.user.key_guid;
                dimensions[GoogleAnalytics.DIM.ministry_id] = $scope.current.assignment.ministry_id;
                return dimensions;
            })());
        }, 1000, {leading: false});

        $scope.$watch('current.assignment.ministry_id', function (new_ministry_id) {
            if (typeof new_ministry_id === 'undefined') return;
            sendAnalytics();
            $scope.current.isLoaded = false;
            $scope.ministry = Ministries.getMinistry({ministry_id: new_ministry_id}, function () {
                $scope.current.isLoaded = true;
                //refresh the teams and team member view
                $scope.initTeamAndMembers();
                //refresh the manage measurement view
                $scope.measurementTypes = [];
                MeasurementTypes.getMeasurementTypes().$promise.then(function (data) {
                    angular.forEach(data, function (type) {
                        if (type.is_custom && _.contains($scope.ministry.lmi_show, type.perm_link_stub)) {
                            type.visible = true;
                        } else if (!type.is_custom && !_.contains($scope.ministry.lmi_hide, type.perm_link_stub)) {
                            type.visible = true;
                        } else {
                            type.visible = false;
                        }
                        $scope.measurementTypes.push(type);
                    });
                });
            });
        });

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
                    label: 'Team & Members',
                    requiredRoles: ['admin', 'inherited_admin', 'leader', 'inherited_leader']
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

        /** functions for edit-ministry and manage measurement tabs */
        $scope.mccs = [
            {value: 'ds', text: 'Digital Strategies'},
            {value: 'gcm', text: 'Global Church Movements'},
            {value: 'llm', text: 'Leader Led'},
            {value: 'slm', text: 'Student Led'}
        ];

        $scope.ableToChangeParentMinistry = function (parentToFind) {
            var availableMinIds = _.pluck($filter('roleFilter')($scope.current.ministries, ['admin', 'inherited_admin', 'leader', 'inherited_leader']), 'ministry_id');
            return _.contains(availableMinIds, parentToFind);
        };

        $scope.saveDetails = function () {
            //additional check if admin un-select all mccs then default_mcc should be empty
            if (_.size($scope.mccs) == 0) {
                $scope.ministry.default_mcc = '';
            }

            var ministry = {
                ministry_id: $scope.ministry.ministry_id,
                min_code: $scope.ministry.min_code,
                name: $scope.ministry.name,
                mccs: $scope.ministry.mccs,
                private: $scope.ministry.private,
                hide_reports_tab: $scope.ministry.hide_reports_tab,
                default_mcc: $scope.ministry.default_mcc,
                lmi_hide: _.pluck(_.where($scope.measurementTypes, {
                    is_custom: false,
                    visible: false
                }), 'perm_link_stub'),
                lmi_show: _.pluck(_.where($scope.measurementTypes, {
                    is_custom: true,
                    visible: true
                }), 'perm_link_stub')
            };
            if ($scope.ministry.hasOwnProperty('parent_id') && typeof $scope.ministry.parent_id === "string") {
                ministry.parent_id = $scope.ministry.parent_id;
            }
            $scope.saveDetailsResource = Ministries.updateMinistry(ministry,
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

        $scope.addMeasurement = function () {
            $modal.open({
                templateUrl: 'partials/admin/add-measurement-type.html',
                controller: function ($scope, $modalInstance) {
                    $scope.close = function () {
                        $modalInstance.dismiss();
                    };

                    $scope.add = function () {
                        $modalInstance.close($scope.newMeasurement);
                    };
                }
            }).result.then(function (newMeasurement) {
                    MeasurementTypes.addMeasurementType(newMeasurement, function () {
                    });
                });
        };

        /** functions for team-members tab **/

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
            //load selected ministry members
            $scope.loadMinistryMembers(team.ministry_id);

        };
        $scope.loadMinistryMembers = function (ministry_id) {
            $scope.membersLoaded = false;
            //pull down the selected ministry team members, and update scope
            Ministries.getMinistry({ministry_id: ministry_id}, function (response) {
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
            deletedUser: false,
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
                    if (typeof newMember === 'undefined') return false;
                    newMember.ministry_id = $scope.activeTeam.ministry_id;
                    Assignments.addTeamMember(newMember, function (response) {
                        //push new member to current member list
                        var new_member = {
                            first_name: response.first_name,
                            last_name: response.last_name,
                            team_role: response.team_role,
                            person_id: response.person_id,
                            key_username: (typeof response.cas_username === 'undefined') ? '' : response.cas_username
                        };
                        $scope.activeTeamMembers.push(new_member);
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
                            //if failed lets restore old role
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
                    $scope.newMinistry = {};
                    $scope.close = function () {
                        $modalInstance.dismiss();
                    };

                    $scope.add = function () {
                        $modalInstance.close($scope.newMinistry);
                    };
                }
            }).result.then(function (newMinistry) {
                    if (typeof newMinistry === 'undefined') return false;

                    newMinistry.parent_id = $scope.activeTeam.ministry_id;

                    Ministries.createMinistry(newMinistry, function (response) {
                        var got_ministry = {
                            ministry_id: response.id,
                            name: response.name,
                            min_code: response.min_code,
                            parent_id: response.parent_id
                        };
                        //append newly created ministry to current select team
                        if (angular.isDefined($scope.activeTeam.sub_ministries)) {
                            $scope.activeTeam.sub_ministries.push(got_ministry);
                        } else {
                            $scope.activeTeam.sub_ministries = [got_ministry];
                        }


                    });
                });

            scrollToTop();

        };

        function scrollToTop() {
            window.setTimeout(function () {
                window.parent.scrollTo(0, 0);
            }, 10);
        }

        $scope.memberDraggableOptions = {
            helper: function (event) {
                var tr = $(event.target).closest('tr');
                var first_name = tr.find('td:first').text();
                var last_name = tr.find('td:nth-child(2)').text();
                var email = tr.find('td:nth-child(3)').text();
                var hide = (email === '') ? 'none' : 'hide';
                return $('<tr class="drag-member"><td><i class="glyphicon glyphicon-user"></i></td><td>' + first_name + '</td><td>' + last_name + '</td><td style="display:' + hide + '">' + email + '</td></tr>');

            }
        };
        $scope.teamDraggableOptions = {
            helper: function (event) {
                var team = $(event.target).closest('span').text();
                return $('<span class="drag-team"><i class="glyphicon glyphicon-certificate"></i> ' + team + '</span>');

            }
        };
        $scope.teamOnStart = function (event, ui, team) {
            $scope.draggedType = 'team';
            $scope.draggedTeam = team;
            console.log('Start dragging the team: ' + team.name);
        };
        $scope.memberOnStart = function (event, ui, member) {
            $scope.draggedType = 'member';
            $scope.draggedMember = member;
            console.log('Start dragging the member: ' + member.first_name + ' ' + member.last_name);
        };
        $scope.teamOnDrop = function (event, ui, team) {
            $(event.target).removeClass('drag-on-over');
            //todo hit the actual API
            if($scope.draggedType==='team'){
                console.log('A team was dropped')
            }else if($scope.draggedType==='member'){
                console.log('A member was dropped ')
            }else{
                console.log('Invalid object type');
                return false;
            }

        };
        $scope.teamBeforeDrop = function (event, ui, team) {
            $(event.target).removeClass('drag-on-over');
            // detect what type of object is being dropped and show relate popup
            if ($scope.draggedType == 'team') {
                //check if team can be dropped or not
                //todo show growl notification if drop is not allowed
                if(team.ministry_id===$scope.draggedTeam.parent_id){
                    console.log('Drop canceled, can be dropped on parent team');
                    return {
                        then:function(){
                            return false;
                        }
                    };
                }else if(team.parent_id===$scope.draggedTeam.ministry_id){
                    console.log('Drop canceled, can be dropped on child team');
                    return {
                        then:function(){
                            return false;
                        }
                    };
                }else{
                    return confirmTeamDrop(team);
                }

            } else if ($scope.draggedType == 'member') {
                return confirmMemberDrop(team);
            } else {
                console.log('Invalid object type');
                return false;
            }

        };

        var confirmMemberDrop = function (team) {
            var modalInstance = $modal.open({
                templateUrl: 'partials/admin/confirm-member-drop.html',
                controller: function ($scope, $modalInstance, modalData) {
                    $scope.member = modalData.member;
                    $scope.team = modalData.team;

                    $scope.yes = function () {
                        $modalInstance.close();
                    };
                    $scope.no = function () {
                        $modalInstance.dismiss('cancel');
                    };
                    $scope.getRoleName = function (role) {
                        if (typeof role === 'undefined') return;
                        return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
                    }
                },
                resolve: {
                    modalData: function () {
                        return {
                            member: $scope.draggedMember,
                            team: team
                        }
                    }
                }
            });
            scrollToTop();
            return modalInstance.result;

        };
        var confirmTeamDrop = function (team) {
            var modalInstance = $modal.open({
                templateUrl: 'partials/admin/confirm-team-drop.html',
                controller: function ($scope, $modalInstance, modalData) {
                    $scope.source_team = modalData.source;
                    $scope.target_team = modalData.target;

                    $scope.yes = function () {
                        $modalInstance.close();
                    };
                    $scope.no = function () {
                        $modalInstance.dismiss('cancel');
                    };

                },
                resolve: {
                    modalData: function () {
                        return {
                            source: $scope.draggedTeam.name,
                            target: team.name
                        }
                    }
                }
            });
            scrollToTop();
            return modalInstance.result;

        };

        $scope.teamOnOver = function (event) {
            $(event.target).addClass('drag-on-over');

        };

        $scope.teamOnOut = function (event) {
            $(event.target).removeClass('drag-on-over');
        };

        $scope.isMemberDraggable = function (member) {
            var blocked_roles = ['inherited_admin', 'inherited_leader', 'blocked'];
            return !_.contains(blocked_roles, member.team_role)
        };


    }

    angular.module('gma.controllers.admin').controller('AdminCtrl', AdminCtrl);
}());

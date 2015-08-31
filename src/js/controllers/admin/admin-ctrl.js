(function () {
    'use strict';

    function AdminCtrl($scope, $filter, $modal, Assignments, MeasurementTypes, GoogleAnalytics, Ministries, growl, UserPreference) {
        $scope.current.isLoaded = false;

        var sendAnalytics = _.throttle(function () {
            GoogleAnalytics.screen('Admin', (function () {
                var dimensions = {};
                dimensions[GoogleAnalytics.DIM.guid] = $scope.current.user.key_guid;
                dimensions[GoogleAnalytics.DIM.ministry_id] = $scope.current.assignment.ministry_id;
                return dimensions;
            })());
        }, 1000, {leading: false});

        $scope.$watch('current.assignment.ministry_id', function (ministry_id) {
            if (typeof ministry_id === 'undefined') return;
            if ($scope.current.canAccessCurrentTab()) {
                //move user to first tab if he is a leader
                if(!$scope.current.hasRole(['admin','inherited_admin'])){
                    $scope.selectTab('team-members');
                }

                sendAnalytics();
                $scope.current.isLoaded = false;
                $scope.ministry = Ministries.getMinistry({ministry_id: ministry_id}, function () {
                    $scope.current.isLoaded = true;
                    //refresh the teams and team member view
                    $scope.initTeamAndMembers();
                    //load next data only if has permissions
                    if($scope.current.hasRole(['admin','inherited_admin'])){
                        //refresh the manage measurement view
                        $scope.measurementTypes = [];
                        $scope.current.loadLanguages();
                        MeasurementTypes.getMeasurementTypes({ministry_id: ministry_id}).$promise.then(function (data) {
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
                    }
                });
            } else {
                $scope.current.redirectToHomeTab();
            }
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
            {value: 'ds', text: 'Digital Strategies', checked: false},
            {value: 'gcm', text: 'Global Church Movements', checked: false},
            {value: 'llm', text: 'Leader Led', checked: false},
            {value: 'slm', text: 'Student Led', checked: false}
        ];

        $scope.ableToChangeParentMinistry = function (parentToFind) {
            var availableMinIds = _.pluck($filter('roleFilter')($scope.current.ministries, ['admin', 'inherited_admin', 'leader', 'inherited_leader']), 'ministry_id');
            return _.contains(availableMinIds, parentToFind);
        };

        $scope.getMCCValue = function (mcc) {
            return _.contains($scope.ministry.mccs, mcc);
        };

        $scope.createMCCArray = function (status, value) {
            if (status) {
                if ($scope.ministry.mccs.indexOf(value) === -1) {
                    $scope.ministry.mccs.push(value);
                }
            } else {
                var index = $scope.ministry.mccs.indexOf(value);
                if (index !== -1) {
                    $scope.ministry.mccs.splice(index, 1);
                }
            }
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
                content_locales: $scope.ministry.content_locales,
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
                    growl.success('Changes saved successfully');
                }, function (response) {
                    growl.error('Unable to save changes');
                });
        };

        $scope.addNewMeasurement = function () {
            $modal.open({
                templateUrl: 'partials/admin/add-measurement-type.html',
                controller: function ($scope, $modalInstance) {
                    $scope.newMeasurement = {};
                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    };

                    $scope.add = function () {
                        $modalInstance.close($scope.newMeasurement);
                    };
                }
            }).result.then(function (newMeasurement) {
                    MeasurementTypes.addMeasurementType(newMeasurement, function (response) {
                        growl.success('Measurement was created successfully');

                        //push new measurement type to current list of measurement
                        var new_measurement = angular.fromJson(angular.toJson(response));
                        new_measurement.visible = false;
                        $scope.measurementTypes.push(new_measurement);

                    }, function () {
                        growl.error('Unable to create measurement');
                    });
                });
            scrollToTop();
        };

        $scope.editMeasurement = function (measurement) {

            $modal.open({
                templateUrl: 'partials/admin/edit-measurement-type.html',
                controller: function ($scope, $modalInstance, modalData) {
                    $scope.measurement = {};
                    $scope.contentLocales = modalData.contentLocales;
                    $scope.original = modalData.measurement;

                    $scope.close = function () {
                        $modalInstance.dismiss('cancel');
                    };

                    $scope.filterByLangCode = function (lang) {

                        return (_.contains(modalData.supportedLanguages, lang.iso_code)) ? lang : false;

                    };
                    $scope.save = function () {
                        $modalInstance.close($scope.measurement);
                    };

                    $scope.changeLocale = function (locale) {
                        MeasurementTypes.getMeasurementType({
                            measurement_type_id: modalData.measurement.perm_link_stub,
                            ministry_id: modalData.ministry_id,
                            locale: locale
                        }, function (response) {
                            $scope.measurement.localized_name = response.localize_name || response.localized_name;
                            $scope.measurement.localized_description = response.localize_description || response.localized_description;
                        }, function () {
                            growl.error('Unable to get measurement');
                        })
                    }
                },
                resolve: {
                    'modalData': function () {
                        return {
                            measurement: angular.copy(measurement),
                            ministry_id: $scope.current.assignment.ministry_id,
                            contentLocales: $scope.availableLanguages,
                            supportedLanguages: $scope.ministry.content_locales || {}
                        }
                    }
                }
            }).result.then(function (form) {
                    form.measurement_type_id = measurement.perm_link_stub;
                    form.ministry_id = $scope.current.assignment.ministry_id;

                    MeasurementTypes.updateMeasurementType(form, function (response) {
                        growl.success('Measurement was updated');
                    }, function () {
                        growl.error('Unable to update measurement');
                    });


                });
            scrollToTop();
        };

        /** functions for team-members tab **/

        $scope.roles = [
            {value: "admin", text: 'Admin'},
            {value: "inherited_admin", text: 'Admin (inherited)'},
            {value: "leader", text: 'Leader'},
            {value: "inherited_leader", text: "Leader (inherited)"},
            {value: "member", text: 'Member'},
            {value: "blocked", text: 'Deleted'},
            {value: "former_member", text: 'Former Member'},
            {value: "self_assigned", text: 'Self Assigned'}
        ];

        $scope.initTeamAndMembers = function () {
            $scope.allCurrentTeams = [];
            $scope.allCurrentTeams.push(angular.copy($scope.current.assignment));

            $scope.activeTeamMembers = {};
            if ($scope.ministry.hasOwnProperty('team_members')) {
                $scope.activeTeamMembers = $scope.ministry.team_members;
            }
            //activate first top most team
            $scope.activeTeam = angular.copy($scope.current.assignment);
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
                growl.error('Unable to load team members');
                $scope.membersLoaded = true;
            });
        };

        $scope.filter = {
            memberSearch: '',
            inheritedLeader: true,
            inheritedAdmin: true,
            deletedUser: false,
            formerMember: false,
            checkFormer: function (item) {
                return $scope.filter.formerMember ? true : item.team_role != 'former_member';
            },
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
                controller: function ($scope, $modalInstance, modalData) {
                    $scope.roles = modalData.roles;
                    $scope.activeTeamName = modalData.activeTeam;

                    $scope.close = function () {
                        $modalInstance.dismiss();
                    };

                    $scope.add = function () {
                        $modalInstance.close($scope.newMember);
                    };
                },
                resolve: {
                    'modalData': function () {
                        return {
                            roles: $scope.roles,
                            activeTeam: $scope.activeTeam.name
                        }
                    }
                }
            }).result.then(function (newMember) {
                    if (typeof newMember === 'undefined') return false;
                    newMember.ministry_id = $scope.activeTeam.ministry_id;
                    Assignments.addTeamMember(newMember, function (response) {
                        growl.success('New member was added successfully');
                        //refresh members list
                        //todo append new member to current member list instead of refreshing team list
                        $scope.loadMinistryMembers($scope.activeTeam.ministry_id);

                    }, function (response) {
                        if (response.status === 404) {
                            growl.error('Failed, User not found');
                        } else {
                            growl.error('Unable to add new member');
                        }
                    });
                });
            scrollToTop();
        };

        $scope.updateUserRole = function (old_role, user) {

            if (old_role === user.team_role) {
                return false;
            }

            $modal.open({
                templateUrl: 'partials/admin/confirm-update-role.html',
                controller: function ($scope, $modalInstance, userInfo) {
                    $scope.userInfo = userInfo;

                    $scope.no = function () {
                        $modalInstance.dismiss();
                    };

                    $scope.yes = function () {
                        $modalInstance.close(true);
                    };
                    $scope.getRoleName = function (role) {
                        return getActualRoleName(role);
                    }
                },
                resolve: {
                    'userInfo': function () {
                        return {
                            old_role: angular.copy(old_role),
                            user: angular.copy(user)
                        };
                    }
                }
            }).result.then(function (c) {
                    //check if user has a real assignment
                    if (typeof user.assignment_id !== 'undefined' && user.assignment_id.trim() !== '') {
                        //update user role
                        Assignments.saveAssignment({assignment_id: user.assignment_id}, {team_role: user.team_role}, function () {
                            growl.success('User role was updated');
                            //success so update old_role in scope also
                            old_role = user.team_role;

                        }, function () {
                            growl.error('Unable to update user role');
                            //if failed lets restore old role
                            user.team_role = old_role;
                        });
                    } else {
                        //if user does not hav a real assignment it should a new Assignment call
                        var post_data = {
                            ministry_id: $scope.activeTeam.ministry_id,
                            key_guid: user.key_guid || '',
                            username: user.key_username || '',
                            team_role: user.team_role
                        };
                        Assignments.addTeamMember(post_data, function (response) {
                            growl.success('User role was updated');
                            //refresh members list
                            //todo update user_role and assignment_id in scope instead of refreshing list
                            $scope.loadMinistryMembers($scope.activeTeam.ministry_id);

                        }, function () {
                            growl.error('Unable to update user role');
                            //if failed lets restore old role
                            user.team_role = old_role;

                        });
                    }

                }, function () {
                    //restore user role upon cancel
                    user.team_role = old_role;
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
                        growl.success('Sub ministry was created successfully');

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

                    }, function () {
                        growl.error('Unable to add sub ministry');
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
            containment: "#team-member-pane",
            refreshPositions: true,
            cursorAt: {bottom: 0},
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
            refreshPositions: true,
            helper: function (event) {
                var team = $(event.target).closest('span').text();
                return $('<span class="drag-team"><i class="glyphicon glyphicon-certificate"></i> ' + team + '</span>');
            }
        };
        $scope.teamOnStart = function (event, ui, team) {
            $scope.draggedType = 'team';
            $scope.draggedTeam = team;
        };
        $scope.memberOnStart = function (event, ui, member) {
            $scope.draggedType = 'member';
            $scope.draggedMember = member;
        };

        /**
         * Function will be fired when a team/member is dropped on a team
         * @param event
         * @param ui
         * @param team The team on which a team/member is being dropped
         * @returns {boolean}
         */
        $scope.teamOnDrop = function (event, ui, team) {
            $(event.target).removeClass('drag-on-over');

            //case when moving team
            if ($scope.draggedType === 'team') {
                var draggedTeam = angular.copy($scope.draggedTeam);
                //update ministry parent id
                var ministry = {
                    ministry_id: $scope.draggedTeam.ministry_id,
                    min_code: $scope.draggedTeam.min_code,
                    parent_id: team.ministry_id
                };
                Ministries.updateMinistry(ministry, function (response) {
                    growl.success('Ministry was moved successfully');
                    //append team to new location
                    if (team.hasOwnProperty('sub_ministries')) {
                        team.sub_ministries.push(draggedTeam);
                    } else {
                        team.sub_ministries = [];
                        team.sub_ministries.push(draggedTeam);
                    }
                    //remove team from list
                    if ($scope.draggedTeam.ministry_id === ministry.ministry_id) {
                        $scope.draggedTeam.hide_after_drop = true;
                    }
                }, function () {
                    growl.error('Unable to move ministry');
                });

                //case when moving member
            } else if ($scope.draggedType === 'member') {
                var member = {
                    assignment_id: $scope.draggedMember.assignment_id,
                    key_guid: $scope.draggedMember.key_guid,
                    username: $scope.draggedMember.key_username,
                    team_role: $scope.draggedMember.team_role,
                    ministry_id: team.ministry_id
                };

                Assignments.addTeamMember(member, function () {
                    $scope.draggedMember.team_role = 'former_member';
                    growl.success('Member was moved to ministry successfully');
                    //set user's old role to former_member
                    Assignments.saveAssignment({assignment_id: member.assignment_id}, {team_role: 'former_member'}, function () {
                        $scope.draggedMember.team_role = 'former_member';
                    }, function () {
                        //restore upon fail
                        $scope.draggedMember.team_role = member.team_role;
                    });
                }, function () {
                    growl.error('Unable to move member');
                });
            } else {
                return false;
            }

        };

        /**
         * Function will be fired just before drop event
         * @param event
         * @param ui
         * @param team Then team on which the object is being dropped
         * @returns {boolean}
         */
        $scope.teamBeforeDrop = function (event, ui, team) {
            $(event.target).removeClass('drag-on-over');
            // detect what type of object is being dropped and show relate popup
            if ($scope.draggedType == 'team') {
                //check if team can be dropped or not
                if (team.ministry_id === $scope.draggedTeam.parent_id) {
                    growl.error("Drop canceled, can't be dropped on parent team");
                    return {
                        then: function () {
                            return false;
                        }
                    };
                } else if (team.parent_id === $scope.draggedTeam.ministry_id) {
                    growl.error("Drop canceled, can't be dropped on child team");
                    return {
                        then: function () {
                            return false;
                        }
                    };
                } else if ($scope.draggedTeam.hasOwnProperty('sub_ministries') && checkIfDroppingOnChildTeam($scope.draggedTeam, team)) {
                    growl.error("Drop canceled, can't be dropped on child team");
                    return {
                        then: function () {
                            return false;
                        }
                    };
                } else {
                    return confirmTeamDrop(team);
                }

            } else if ($scope.draggedType == 'member') {
                //prevent member drop on current active team itself
                if ($scope.activeTeam.ministry_id === team.ministry_id) {
                    growl.error("Drop canceled, can't be dropped on selected team");
                    return {
                        then: function () {
                            return false;
                        }
                    };
                } else {
                    return confirmMemberDrop(team);
                }

            } else {
                return false;
            }

        };

        function confirmMemberDrop(team) {
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
                        return getActualRoleName(role);
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

        }

        function confirmTeamDrop(team) {
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

        }

        $scope.teamOnOver = function (event, ui, teamCollapsed) {
            $(event.target).addClass('drag-on-over');
            //expand tree if collapsed
            if (teamCollapsed === true) {
                angular.element(event.target).find('i').trigger('click');
            }
        };

        $scope.teamOnOut = function (event) {
            $(event.target).removeClass('drag-on-over');
        };

        $scope.isMemberDraggable = function (member) {
            //if member does not have assignment id
            if (typeof member.assignment_id === 'undefined' || member.assignment_id.trim() === '') {
                return false;
            }
            //members who don't have key_guid or key_username are not be movable
            else if (typeof member.key_guid === 'undefined') {
                return false
            } else if (typeof member.key_username === 'undefined') {
                return false;
            } else if (member.key_guid == '') {
                return false;
            } else if (member.key_username == '') {
                return false;
            }
            //members who has these roles are not movable too
            return !_.contains(['inherited_admin', 'inherited_leader', 'blocked', 'former_member'], member.team_role)
        };


        $scope.getCurrentUserRole = function (role) {
            return getActualRoleName(role);
        };

        function getActualRoleName(role) {
            var found_role = _.find($scope.roles, function (r) {
                return r.value === role;
            });

            if (found_role !== undefined) {
                return found_role.text;
            }
            return role;
        }


        function checkIfDroppingOnChildTeam(sourceTeam, targetTeam) {
            var flatTeams = UserPreference.getFlatMinistry(angular.copy(sourceTeam.sub_ministries));
            //check if target is in source team's list
            var foundAsChild = _.find(flatTeams, function (team) {
                return team.ministry_id === targetTeam.ministry_id;
            });

            return (foundAsChild !== undefined);
        }

    }

    angular.module('gma.controllers.admin').controller('AdminCtrl', AdminCtrl);
}());

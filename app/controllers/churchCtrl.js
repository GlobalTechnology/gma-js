
(function () {
    //Find existing Module instance named 'gcmApp'
    var app = angular.module("gcmApp");

    var church_controller = function ($scope, church_service, ministry_service) {
        $scope.$parent.is_loaded = false;
        $scope.edit_church = {};

      




        $scope.loadChurches = function () {
            console.log('loading churches');
            var extras = '&ministry_id=' + $scope.assignment.ministry_id

           // ministry_service.getMinistry($scope.user.session_ticket, $scope.assignment.ministry_id).then($scope.onGetMinistry, $scope.onError);

            church_service.getChurches($scope.user.session_ticket, null, extras).then($scope.onGetChurches, $scope.onError);

        };

      //  $scope.loadChurches();


        $scope.onSaveChurch = function (response) {
            $scope.loadChurches();
        };


        $scope.$watch('assignment.id', function (a) {
            $scope.loadChurches();


        });



        $scope.getIcon = function(development){
            switch(development){
                case 1: 
                    return "/Content/map_icons/targeticon.png";
                case 2: 
                    return "/Content/map_icons/groupicon.png";
                case 3:
                    return "/Content/map_icons/churchicon.png";
                case 5:
                    return "/Content/map_icons/multipliedchurchicon.png";
                default:
                    return "";
            }
        }

        $scope.$on('ngGridEventEndCellEdit', function (evt) {
         //   console.log('saving church');
            $scope.updateEntity(evt.targetScope.row);
          //  church_service.saveChurch($scope.user.session_ticket, evt.targetScope.row.entity).then($scope.onSaveChurch, $scope.onError);
           
        });


        $scope.updateEntity = function (row) {
            console.log('saving church');
            church_service.saveChurch($scope.user.session_ticket, row.entity).then($scope.onSaveChurch, $scope.onError);

        };

        $scope.gridOptions = {
            data: 'assignment.churches',
            columnDefs: [{ field: 'development', displayName: 'Type', cellTemplate: ' <img src="{{getIcon(row.entity[col.field])}}" />', editableCellTemplate: ' <select ng-class="\'colt\' + col.index"  ng-input="COL_FIELD"  ng-model="COL_FIELD" ><option value="1">Target</option><option value="2">Group</option><option value="3">Church</option><option value="5">Multiplying Church</option> </select>' },
                   { field: 'name', displayName: 'Name' },
                   { field: 'contact_name', displayName: 'Contact' },
            { field: 'contact_email', displayName: 'Email', cellTemplate: ' <a href="mailto:{{row.entity[col.field]}}">{{row.entity[col.field]}}</a>' },
            { field: 'size', displayName: 'Size' },



            ],
            enableCellEdit: true,
            enableRowSelection: false,
            plugins: [new ngGridFlexibleHeightPlugin()]
        };
  


        $scope.onGetChurches = function (response) {
            $scope.assignment.churches = response;
            console.log('got churches');



        };




    };


    app.controller("churchController", ["$scope", "church_service","ministry_service", church_controller]);

}());


function ngGridFlexibleHeightPlugin(opts) {
    var self = this;
    self.grid = null;
    self.scope = null;
    self.init = function (scope, grid, services) {
        self.domUtilityService = services.DomUtilityService;
        self.grid = grid;
        self.scope = scope;
        var recalcHeightForData = function () { setTimeout(innerRecalcForData, 1); };
        var innerRecalcForData = function () {
            var gridId = self.grid.gridId;
            var footerPanelSel = '.' + gridId + ' .ngFooterPanel';
            var extraHeight = self.grid.$topPanel.height() + $(footerPanelSel).height();
            var naturalHeight = self.grid.$canvas.height() + 1;
            if (opts != null) {
                if (opts.minHeight != null && (naturalHeight + extraHeight) < opts.minHeight) {
                    naturalHeight = opts.minHeight - extraHeight - 2;
                }
            }

            var newViewportHeight = naturalHeight + 3;
            if (!self.scope.baseViewportHeight || self.scope.baseViewportHeight !== newViewportHeight) {
                self.grid.$viewport.css('height', newViewportHeight + 'px');
                self.grid.$root.css('height', (newViewportHeight + extraHeight) + 'px');
                self.scope.baseViewportHeight = newViewportHeight;
                self.domUtilityService.RebuildGrid(self.scope, self.grid);
            }
        };
        self.scope.catHashKeys = function () {
            var hash = '',
                idx;
            for (idx in self.scope.renderedRows) {
                hash += self.scope.renderedRows[idx].$$hashKey;
            }
            return hash;
        };
        self.scope.$watch('catHashKeys()', innerRecalcForData);
        self.scope.$watch(self.grid.config.data, recalcHeightForData);
    };
}
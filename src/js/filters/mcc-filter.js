(function () {
    'use strict';

    angular.module('gma.filters')
        .filter('mccFilter', [function () {
            return function (all_mccs, selected_mccs) {

                var filtered = [];
                angular.forEach(all_mccs, function (mcc) {
                    if (selected_mccs.indexOf(mcc.value) !== -1) {
                        filtered.push(mcc);
                    }
                });

                return filtered;
            };
        }]);
})();

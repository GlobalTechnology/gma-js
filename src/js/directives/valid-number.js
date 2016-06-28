(function () {
    'use strict';
    angular.module('gma.directives')
        .directive('validNumber', function () {
            return {
                require: '?ngModel',
                restrict: 'A',
                link: function (scope, element, attrs, ngModelCtrl) {
                    if (!ngModelCtrl) {
                        return;
                    }

                    ngModelCtrl.$parsers.push(function (val) {
                        if (angular.isUndefined(val)) {
                            val = '';
                        }

                        var clean = val.replace(/[^0-9]/g, '');
                        if (clean === '') {
                            clean = '0';
                        }
                        //remove 0 from value if it is like: 0123
                        if (clean.length > 1 && clean[0] === '0') {
                            clean = clean.slice(1);
                        }

                        if (val !== clean) {
                            ngModelCtrl.$setViewValue(clean);
                            ngModelCtrl.$render();
                        }
                        return parseInt(clean);
                    });

                    element.bind('keypress', function (event) {
                        if (event.keyCode === 32) {
                            event.preventDefault();
                        }
                    });
                }
            };
        })
})();
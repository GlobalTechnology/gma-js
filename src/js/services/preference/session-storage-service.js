(function () {
    'use strict';

    function SessionStorage($window) {

        var storage = $window.sessionStorage,
            prefix = '_gma_';

        return {
            set: function (key, val) {
                storage.setItem(prefix + key, angular.toJson(val));
            },
            get: function (key) {
                var value = storage.getItem(prefix + key);
                return value && angular.fromJson(value);
            },
            remove: function (key) {
                storage.removeItem(prefix + key);
            },
            clearAll: function () {
                var keys = Object.keys(storage);
                for (var i = 0; i < keys.length; i += 1) {
                    //If stored key has our prefix then remove this key
                    if (keys[i].substr(0, prefix.length) === prefix) {
                        storage.removeItem(keys[i]);
                    }
                }
            }
        };

    }

    angular.module('gma.services.preference').factory('SessionStorage', SessionStorage);
})();
/*
 * @source https://github.com/Mischi/angularjs-imageupload-directive
 * Made some changes
 */
(function (angular) {
    angular.module('gma.directives')
        .directive('imageResizer', function ($q) {
            'use strict';

            var URL = window.URL || window.webkitURL;

            /**
             * http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata/5100158
             */
            function dataURItoBlob(dataURI) {
                var byteString = atob(dataURI.split(',')[1]);
                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                // separate out the mime component
                var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                return new Blob([ab], {type: mimeString});
            }

            var getResizeArea = function () {
                var resizeAreaId = 'fileupload-resize-area';

                var resizeArea = document.getElementById(resizeAreaId);

                if (!resizeArea) {
                    resizeArea = document.createElement('canvas');
                    resizeArea.id = resizeAreaId;
                    resizeArea.style.visibility = 'hidden';
                    document.body.appendChild(resizeArea);
                }

                return resizeArea;
            };

            var resizeImage = function (origImage, options) {

                var maxHeight = options.resizeMaxHeight || 128;
                var maxWidth = options.resizeMaxWidth || 128;
                var quality = options.resizeQuality || 0.8;
                var type = options.resizeType || 'image/jpg';

                var canvas = getResizeArea();

                var height = origImage.height;
                var width = origImage.width;

                // calculate the width and height, constraining the proportions
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round(height *= maxWidth / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round(width *= maxHeight / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                //draw image on canvas
                var ctx = canvas.getContext("2d");
                ctx.drawImage(origImage, 0, 0, width, height);

                // get the data from canvas as 80% jpg (or specified type).
                return canvas.toDataURL(type, quality);
            };

            var createImage = function (url, callback) {
                var image = new Image();
                image.onload = function () {
                    callback(image);
                };
                image.src = url;
            };

            var fileToDataURL = function (file) {
                var deferred = $q.defer();
                var reader = new FileReader();
                reader.onload = function (e) {
                    deferred.resolve(e.target.result);
                };
                reader.readAsDataURL(file);
                return deferred.promise;
            };


            return {
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    imageModel: '=',
                    resizeMaxHeight: '@?',
                    resizeMaxWidth: '@?',
                    resizeQuality: '@?',
                    resizeType: '@?'
                },
                link: function (scope, element, attrs, ctrl) {

                    var doResizing = function (imageResult, callback) {
                        createImage(imageResult.url, function (image) {
                            var dataURL = resizeImage(image, scope);
                            var blob = dataURItoBlob(dataURL);
                            imageResult.resized = {
                                blob: blob, //added blob data also
                                dataURL: dataURL,
                                type: dataURL.match(/:(.+\/.+);/)[1]
                            };
                            callback(imageResult);
                        });
                    };

                    var applyScope = function (imageResult) {
                        scope.$apply(function () {
                            //do not support multiple image select
                            scope.imageModel = imageResult;
                        });
                    };
                    var setValidity = function (val) {
                        scope.$apply(function () {
                            ctrl.$setValidity('invalidImage', val);
                        });
                    };


                    element.bind('change', function (evt) {
                        //we do not support for multiple image select
                        var files = evt.target.files;
                        //additional check, be fail safe
                        if (files.length === 0) {
                            applyScope({});//empty scope
                            evt.preventDefault();
                            evt.stopPropagation();
                            return false;
                        }
                        //check for file extension
                        if (files[0].type.match('image/*') === null) {
                            angular.element(evt.target).val(''); //empty file input
                            applyScope({});//empty scope
                            setValidity(false); //invalidate input
                            evt.preventDefault();
                            return false;
                        }
                        //validate input
                        setValidity(true);
                        //create a result object to store file info
                        var imageResult = {
                            file: files[0], //original file
                            //Next attribute is required, don't try to remove it
                            url: URL.createObjectURL(files[0])
                        };
                        //convert to base 64
                        fileToDataURL(files[0]).then(function (dataURL) {
                            imageResult.dataURL = dataURL;
                        });

                        if (scope.resizeMaxHeight || scope.resizeMaxWidth) {
                            //resize image
                            doResizing(imageResult, function (imageResult) {
                                applyScope(imageResult);
                            });
                        }
                        else {
                            //no resizing
                            applyScope(imageResult);
                        }

                    });
                }
            };
        });
})(angular);
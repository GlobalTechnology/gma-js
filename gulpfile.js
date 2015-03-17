"use strict";

var gulp        = require( 'gulp' ),
	del         = require( 'del' ),
	cdnizer     = require( 'gulp-cdnizer' ),
	htmlreplace = require( 'gulp-html-replace' ),
	minifyHTML  = require( 'gulp-minify-html' ),
	concat      = require( 'gulp-concat' ),
	ngAnnotate  = require( 'gulp-ng-annotate' ),
	uglify      = require( 'gulp-uglify' ),
	minifyCSS   = require( 'gulp-minify-css' );

gulp.task( 'clean', function ( callback ) {
	del( ['dist'], callback );
} );

gulp.task( 'html', ['clean'], function () {
	return gulp.src( 'src/gma.html' )
		.pipe( cdnizer( {
			allowMin:     true,
			relativeRoot: 'src/',
			files:        [
				// JavaScript
				'google:jquery',
				'google:angular-resource',
				'google:angular-route',
				'google:angular',
				{
					file:    'bower_components/angular-bootstrap/*.js',
					package: 'angular-bootstrap',
					cdn:     'cdnjs:angular-ui-bootstrap:${ filenameMin }'
				},
				{
					file:    'bower_components/moment/*.js',
					package: 'moment',
					cdn:     'cdnjs:moment.js:${ filenameMin }'
				},
				{
					file:    'bower_components/underscore/underscore.js',
					package: 'underscore',
					cdn:     'cdnjs:underscore.js:underscore-min.js'
				},

				// CSS
				{
					file:    'bower_components/bootstrap/**/*.css',
					package: 'bootstrap',
					cdn:     'cdnjs:twitter-bootstrap:css/${ filenameMin }'
				}
			]
		} ) )
		.pipe( htmlreplace( {
			js:  'app.min.js',
			css: 'styles.min.css',
			lib: 'lib.min.js'
		} ) )
//		.pipe( minifyHTML( {} ) )
		.pipe( gulp.dest( 'dist/' ) );
} );

gulp.task( 'scripts', ['clean'], function () {
	return gulp.src( ['src/js/services/settings.js', 'src/js/app.js', 'src/js/**/*.js'] )
		.pipe( concat( 'app.min.js' ) )
		.pipe( ngAnnotate() )
		.pipe( uglify() )
		.pipe( gulp.dest( 'dist/' ) );
} );

gulp.task( 'styles', ['clean'], function () {
	return gulp.src( ['src/css/*.css'] )
		.pipe( concat( 'styles.min.css' ) )
		.pipe( minifyCSS() )
		.pipe( gulp.dest( 'dist/' ) );
} );

gulp.task( 'library', ['clean'], function () {
	return gulp.src( ['bower_components/easy-markerwithlabel/src/markerwithlabel.js', 'bower_components/iframe-resizer/src/iframeResizer.contentWindow.js'] )
		.pipe( concat( 'lib.min.js' ) )
		.pipe( uglify() )
		.pipe( gulp.dest( 'dist/' ) );
} );

gulp.task( 'iframe', ['clean'], function () {
	return gulp.src( ['bower_components/iframe-resizer/js/iframeResizer.min.js'] )
		.pipe( gulp.dest( 'dist/' ) );
} );

gulp.task( 'build', ['scripts', 'styles', 'library', 'iframe', 'html'] );

gulp.task( 'default', ['build'] );

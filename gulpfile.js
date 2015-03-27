"use strict";

var gulp        = require( 'gulp' ),
	bower       = require( 'gulp-bower' ),
	del         = require( 'del' ),
	cdnizer     = require( 'gulp-cdnizer' ),
	htmlreplace = require( 'gulp-html-replace' ),
	minifyHTML  = require( 'gulp-minify-html' ),
	concat      = require( 'gulp-concat' ),
	ngAnnotate  = require( 'gulp-ng-annotate' ),
	uglify      = require( 'gulp-uglify' ),
	minifyCSS   = require( 'gulp-minify-css' ),
	ngHtml2Js   = require( 'gulp-ng-html2js' ),
	sourcemaps  = require( 'gulp-sourcemaps' ),
	path        = require( 'path' ),
	crypto      = require( 'crypto' ),
	revisions   = {};

function revisionMap() {

	function md5( str ) {
		return crypto.createHash( 'md5' ).update( str ).digest( 'hex' ).slice( 0, 8 );
	}

	function saveRevision( file, callback ) {
		revisions[ file.relative ] = file.relative + '?rev=' + md5(file.contents);
		callback( null, file );
	}

	return require( 'event-stream' ).map( saveRevision );
}

gulp.task( 'clean', function ( callback ) {
	del( ['dist'], callback );
} );

gulp.task( 'html', ['clean', 'bower', 'scripts', 'partials', 'styles', 'library'], function () {
	return gulp.src( 'src/index.html' )
		.pipe( cdnizer( {
			allowMin:     true,
			relativeRoot: 'src/',
			files:        [
				// JavaScript
				'google:jquery',
				'google:angular-resource',
				'google:angular-loader',
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
			application: [
				'js/' + revisions['application.min.js'],
				'js/' + revisions['partials.min.js']
			],
			styles:      'css/' + revisions['styles.min.css'],
			other:       'js/' + revisions['common.min.js']
		} ) )
		.pipe( minifyHTML() )
		.pipe( gulp.dest( 'dist' ) );
} );

gulp.task( 'scripts', ['clean'], function () {
	return gulp.src( ['src/js/**/_*.js', 'src/js/**/*.js', '!src/js/wrapper.js'] )
		.pipe( sourcemaps.init() )
		.pipe( concat( 'application.min.js' ) )
		.pipe( ngAnnotate() )
		.pipe( uglify() )
		.pipe( revisionMap() )
		.pipe( sourcemaps.write( '.' ) )
		.pipe( gulp.dest( 'dist/js' ) );
} );

gulp.task( 'partials', ['clean'], function () {
	return gulp.src( ['src/partials/**/*.html'] )
		.pipe( sourcemaps.init() )
		.pipe( minifyHTML() )
		.pipe( ngHtml2Js( {
			moduleName:    'gma',
			prefix:        'partials/',
			declareModule: false
		} ) )
		.pipe( concat( 'partials.min.js' ) )
		.pipe( uglify() )
		.pipe( revisionMap() )
		.pipe( sourcemaps.write( '.' ) )
		.pipe( gulp.dest( 'dist/js' ) );
} );

gulp.task( 'styles', ['clean'], function () {
	return gulp.src( ['src/css/application.css', 'src/css/**/*.css'] )
		.pipe( concat( 'styles.min.css' ) )
		.pipe( minifyCSS() )
		.pipe( revisionMap() )
		.pipe( gulp.dest( 'dist/css' ) );
} );

gulp.task( 'library', ['clean', 'bower'], function () {
	return gulp.src( ['bower_components/easy-markerwithlabel/src/markerwithlabel.js', 'bower_components/iframe-resizer/src/iframeResizer.contentWindow.js'] )
		.pipe( sourcemaps.init() )
		.pipe( concat( 'common.min.js' ) )
		.pipe( uglify() )
		.pipe( revisionMap() )
		.pipe( sourcemaps.write( '.' ) )
		.pipe( gulp.dest( 'dist/js' ) );
} );

gulp.task( 'wrapper', ['clean', 'bower'], function () {
	return gulp.src( ['bower_components/iframe-resizer/src/iframeResizer.js'] )
		.pipe( sourcemaps.init() )
		.pipe( concat( 'wrapper.min.js' ) )
		.pipe( uglify() )
		.pipe( sourcemaps.write( '.' ) )
		.pipe( gulp.dest( 'dist/js' ) );
} );

gulp.task( 'images', ['clean'], function () {
	return gulp.src( ['src/img/**/*.png'] )
		.pipe( gulp.dest( 'dist/img' ) );
} );

gulp.task( 'angular-i18n', ['clean', 'bower'], function () {
	return gulp.src( ['bower_components/angular-i18n/*.js'] )
		.pipe( uglify() )
		.pipe( gulp.dest( 'dist/angular-i18n' ) );
} );

gulp.task( 'bower', function () {
	return bower();
} );

gulp.task( 'build', ['images', 'wrapper', 'html', 'angular-i18n'] );

gulp.task( 'default', ['build'] );

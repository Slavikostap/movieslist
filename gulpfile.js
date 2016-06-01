var gulp = require ('gulp');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');

//Js Minification
gulp.task('minifyjs',function(){
	return gulp.src('js/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});

//Webserver
gulp.task('webserver',function(){
	return gulp.src('app')
		.pipe(webserver({
			port: '8080',
			livereload: true,
			open: true
		}));
});

//Default tast
gulp.task('default', ['minifyjs', 'webserver']);
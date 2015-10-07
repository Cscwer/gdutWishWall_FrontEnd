/**
	@author ShiJianwen
*/
var gulp = require('gulp');
var connect = require('gulp-connect');
var less = require('gulp-less');

gulp.task('connect', function() {
	connect.server({
		root: [__dirname],
		livereload: true
	});
});

gulp.task('style', function() {
	gulp.src('./src/css/*.css')
		// .pipe(less())
		// .pipe(gulp.dest('./public/css'))
		.pipe(connect.reload());
});

gulp.task('script', function() {
	gulp.src('./src/js/*.js')
		.pipe(connect.reload());
});

gulp.task('html', function() {
	gulp.src(['./src/views/**/*.html', './src/index.html'])
		.pipe(connect.reload());
});

gulp.task('watch', function() {
	gulp.watch(['./src/views/**/*.html', './src/index.html'], ['html']);
	gulp.watch(['./src/css/*.css'], ['style']);
	gulp.watch(['./src/js/*.js'], ['script']);
});





gulp.task('default', ['style', 'script', 'connect', 'watch']);
/**
	@author ShiJianwen
*/
var gulp = require('gulp');
var connect = require('gulp-connect');
var less = require('gulp-less');
var del = require('del');
var htmlmin = require('gulp-htmlmin');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var usemin = require('gulp-usemin');

// 删除 css
gulp.task('clean:css', function() {
    del.sync('./css/*.css');
})

// 启动本地服务
gulp.task('connect', function() {
	connect.server({
        root: './app/',
        port: 8080,
		livereload: true
	});
});

// 编译 less
gulp.task('less', ['clean:css'], function() {
	gulp.src('./css/*.less')
		.pipe(less())
        .pipe(gulp.dest('./css/'))
		.pipe(connect.reload());
});

// 处理 js
gulp.task('script', function() {
	gulp.src('./js/*.js')
		.pipe(connect.reload());
});

// 处理 html
gulp.task('html', function() {
	gulp.src(['./views/**/*.html', './app/index.html'])
		.pipe(connect.reload());
});

// 监控文件
gulp.task('watch', function() {
	gulp.watch(['./views/**/*.html', './app/index.html'], ['html']);
	gulp.watch(['./css/*.css'], ['style']);
	gulp.watch(['./js/*.js'], ['script']);
});

// 本地开发
gulp.task('server', ['less', 'connect', 'watch']);


gulp.task('clean:build', function() {
    del.sync('dist/', {force: true});
});

gulp.task('minify', ['clean:build', 'less'], function() {

    gulp.src('./app/index.html')
        .pipe(usemin({
            js: [uglify(), rev()],
            css: [minifyCss(), 'concat', rev()]
        }))
        .pipe(gulp.dest('dist/'));

    gulp.src('./app/views/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist/views'));
});

// build 上线代码
gulp.task('build', ['clean:build', 'minify']);




gulp.task('default', ['style', 'script', 'connect', 'watch']);

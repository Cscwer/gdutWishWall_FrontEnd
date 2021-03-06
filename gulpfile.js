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
var concat = require('gulp-concat');
var rev = require('gulp-rev');
var usemin = require('gulp-usemin');
var sourcemaps = require('gulp-sourcemaps');
var lessAutoprefix = require('less-plugin-autoprefix');
var autoprefix = new lessAutoprefix({browsers: ['last 2 versions'], cascade: false});

// 删除 css
gulp.task('clean:css', function () {
    del.sync('./src/public/css/*.css');
});

// 启动本地服务
gulp.task('connect', function () {
    connect.server({
        root: 'src/',
        port: 8080,
        livereload: true
    });
});

// 编译 less
gulp.task('less', ['clean:css'], function () {
	return gulp.src('./src/less/*.less')
            .pipe(sourcemaps.init())
            .pipe(less({
                plugins: [autoprefix]
            }))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('./src/public/css/'))
		    .pipe(connect.reload());
});

// 处理 js
gulp.task('script', function () {
	return gulp.src('./src/public/js/*.js')
		    .pipe(connect.reload());
});

// 处理 html
gulp.task('html', function () {
    return gulp.src(['./src/views/**/*.html'])
            .pipe(connect.reload());
});

// 处理图片
gulp.task('images', function () {
    return gulp.src('./src/public/img/*')
    .pipe(gulp.dest('./dist/public/img/'));
});

// 监控文件
gulp.task('watch', function () {
	gulp.watch(['./src/views/**/*.html', './src/index.html'], ['html']);
	gulp.watch(['./src/less/*.less'], ['less']);
	gulp.watch(['./src/public/js/*.js'], ['script']);
});

// 本地开发
gulp.task('server', ['less', 'connect', 'watch']);


gulp.task('clean:build', function () {
    del.sync('dist/', {
        force: true
    });
});

gulp.task('minify', ['clean:build', 'less', 'images'], function() {

    gulp.src('src/views/**/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('dist/views'));

    gulp.src('src/index.html')
        .pipe(usemin({
            js: [uglify({mangle: false}), rev()],
            css: [minifyCss(), 'concat', rev()]
        }))
        .pipe(gulp.dest('dist/'));

    gulp.src('./src/views/**/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('dist/views'));
});

// build 上线代码
gulp.task('build', ['minify']);




gulp.task('default', ['style', 'script', 'connect', 'watch']);

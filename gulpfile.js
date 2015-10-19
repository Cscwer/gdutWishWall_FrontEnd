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
nixie
var usemin = require('gulp-usemin');

// 删除 css
gulp.task('clean:css', function() {
    del.sync('./src/css/*.css');
})

// 启动本地服务
gulp.task('connect', function() {
    connect.server({
        root: 'src/',
        port: 8080,
        livereload: true
    });
});

// 编译 less
gulp.task('less', ['clean:css'], function() {
    gulp.src('./src/less/*.less')
        .pipe(less())
        .pipe(gulp.dest('./src/css/'))
        .pipe(connect.reload());
});

// 处理 js
gulp.task('script', function() {
    gulp.src('./src/js/*.js')
        .pipe(connect.reload());
});

// 处理 html
gulp.task('html', function() {
    gulp.src(['./src/views/**/*.html'])
        .pipe(connect.reload());
});

// 监控文件
gulp.task('watch', function() {
    gulp.watch(['./src/views/**/*.html'], ['html']);
    gulp.watch(['./src/less/*.less'], ['less']);
    gulp.watch(['./src/js/*.js'], ['script']);
});

// 本地开发
gulp.task('server', ['less', 'connect', 'watch']);


gulp.task('clean:build', function() {
    del.sync('dist/', {
        force: true
    });
});

gulp.task('minify', ['clean:build', 'less'], function() {

    gulp.src('src/views/**/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('dist/views'));

    gulp.src('src/index.html')

    .pipe(usemin({
        js: [uglify({
            mangle: false
        }), rev()],
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
gulp.task('build', ['clean:build', 'minify']);




gulp.task('default', ['style', 'script', 'connect', 'watch']);
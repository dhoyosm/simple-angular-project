var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    usemin = require('gulp-usemin'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    changed = require('gulp-changed'),
    rev = require('gulp-rev'),
    browserSync = require('browser-sync'),
    del = require('del');

var ngannotate = require('gulp-ng-annotate');

gulp.task('jshint', function() {
    return gulp.src('app/scripts/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

// Clean
gulp.task('clean', function() {
    return del(['dist', 'json-server/public']);
});

// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('usemin', 'imagemin', 'copyfonts', 'public');
});

gulp.task('usemin', ['jshint'], function() {
    return gulp.src('./app/**/*.html')
        .pipe(usemin({
            css: [minifycss(), rev()],
            js: [ngannotate(), uglify(), rev()]
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('public', ['usemin', 'imagemin', 'copyfonts'], function() {
    gulp.src('dist/**/*.html')
        .pipe(gulp.dest('json-server/public/'));
    gulp.src('dist/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('json-server/public/fonts'));
    gulp.src('dist/images/**/*')
        .pipe(gulp.dest('json-server/public/images'));
    gulp.src('dist/scripts/**/*.js')
        .pipe(gulp.dest('json-server/public/scripts'));
    gulp.src('dist/styles/**/*.css')
        .pipe(gulp.dest('json-server/public/styles'));
});

// Images
gulp.task('imagemin', function() {
    return del(['dist/images']), gulp.src('app/images/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe(notify({
            message: 'Images task complete'
        }));
});

gulp.task('copyfonts', ['clean'], function() {
    gulp.src('./bower_components/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('./dist/fonts'));
    gulp.src('./bower_components/bootstrap/dist/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('./dist/fonts'));
});

// Watch
gulp.task('watch', ['browser-sync'], function() {
    // Watch .js files
    gulp.watch('{app/scripts/**/*.js,app/styles/**/*.css,app/**/*.html}', ['usemin']);
    // Watch image files
    gulp.watch('app/images/**/*', ['imagemin']);

});

gulp.task('browser-sync', ['default'], function() {
    var files = [
        'app/**/*.html',
        'app/styles/**/*.css',
        'app/images/**/*.png',
        'app/scripts/**/*.js',
        'dist/**/*'
    ];

    browserSync.init(files, {
        server: {
            baseDir: "dist",
            index: "index.html"
        }
    });
    // Watch any files in dist/, reload on change
    gulp.watch(['dist/**']).on('change', browserSync.reload);
});

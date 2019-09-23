const app = 'app/',
    build = 'build/';
const {src, dest, parallel, series} = require('gulp'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    autoprefixer = require('autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    del = require('del'),
    postcss = require('gulp-postcss'),
    pug = require('gulp-pug'),
    babel = require('gulp-babel'),
    imagemin = require('gulp-imagemin');

function css() {
    return src(app + 'scss/**/*.scss')
        .pipe(concat('main.min.css'))
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer()]))
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(build + 'css'));
        done();
}

function delBuild() {
    return del([build + '*']);
    done();
}

function pugToHtml() {
    return src(app + 'pug/**/*.pug')
        .pipe(pug())
        .pipe(dest(build));
}

function jsCompiled() {
    return src([
        app + 'js/**/*.js',
        'node_modules/materialize-css/dist/js/materialize.min.js'
    ], { sourcemaps: true })
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('main.min.js'))
        .pipe(uglify({toplevel: true}))
        .pipe(dest(build + 'js', { sourcemaps: true }));
    done();
}

function watch() {
    gulp.watch(app + 'scss/**/*.scss', parallel('css'));
    gulp.watch(app + 'js/**/*.js', parallel('jsCompiled'));
    gulp.watch(app + 'pug/**/*.pug', parallel('pugToHtml'));
}
function image() {
    del([build + 'img/*'])
    return src(app + 'img/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true, optimizationLevel: 2}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })]))
        .pipe(dest(build + 'img'))
}

exports.css = css;
exports.jsCompiled = jsCompiled;
exports.pugToHtml = pugToHtml;
exports.watch = watch;
exports.image = image;
exports.build = series(delBuild,
                        parallel(css, jsCompiled, pugToHtml)
                        );
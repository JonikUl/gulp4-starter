const app = 'app/',
    build = 'build/';
const {src, dest, parallel, series, watch} = require('gulp'),
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

const css = _ => {
    return src(app + 'scss/**/*.scss')
        .pipe(concat('main.min.css'))
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer()]))
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(build + 'css'));
        done();
}

const delBuild = _ => {
    return del([build + '**/*.*']);
}

const pugToHtml = _ => {
    return src(app + 'pug/**/*.pug')
        .pipe(pug())
        .pipe(dest(build));
}

const jsCompiled = _ => {
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

const watchAll = _ => {
    watch(app + 'scss/**/*.scss', parallel('css'));
    watch(app + 'js/**/*.js', parallel('jsCompiled'));
    watch(app + 'pug/**/*.pug', parallel('pugToHtml'));
}
const image = _ => {
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
exports.watchAll = watchAll;
exports.delBuild = delBuild;
exports.image = image;
exports.build = series(delBuild,
                        parallel(css, jsCompiled, pugToHtml)
                        );
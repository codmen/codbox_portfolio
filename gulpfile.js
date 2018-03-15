'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    less = require('gulp-less'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    notify = require("gulp-notify"),
    reload = browserSync.reload;

var path = {  //Aici salvam fisierele dupa prlucrare
    dist: {
        html: 'dist/',
        js: 'dist/assets/js/',
        css: 'dist/assets/css/',
        img: 'dist/assets/img/',
        fonts: 'dist/assets/fonts/'
    },
    src: { //De aici luam codul sursa
        html: 'app/*.html', //Sintaxa src/*.html indica ca putem lua toate fisierele cu extensia .html
        js: 'app/js/main.js', //In stiluri si scripturi avem nevoie doar de fisierele principale
        style: 'app/style/main.less',
        img: 'app/img/**/*.*', //Sintaxa img/**/*.* înseamnă - să preluați toate fișierele tuturor extensiilor din dosar și din directoriile imbricate
        fonts: 'app/fonts/**/*.*'
    },
    watch: { //Aici indicăm ce fișiere vrem să monitorizăm
        html: 'app/**/*.html',
        js: 'app/js/**/*.js',
        style: 'app/style/**/*.less',
        img: 'app/img/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    clean: './dist'
};

var config = {
    server: {
        baseDir: "./dist"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Codbox"
};

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb)
});

gulp.task('html:dist', function () {
    gulp.src(path.src.html)  //Selectați fișierele după calea dorită
        .pipe(rigger())  //Le trcem prin rigger
        .pipe(gulp.dest(path.dist.html)) //le punem in dosarul dist
        .pipe(reload({stream: true})) //Si vom restarta serverul pentru actualizări
        //.pipe(notify('HTML is build!'));
});

gulp.task('js:dist', function () {
    gulp.src(path.src.js)   //Să găsim dosarul nostru principal
        .pipe(rigger())  //Le trcem prin rigger
        //.pipe(sourcemaps.init())  //Initializam sourcemap
        .pipe(uglify())  //Minifiam codul nostru js
        //.pipe(sourcemaps.write())   //Scrim sourcemap
        .pipe(gulp.dest(path.dist.js)) //Punem fisierul in dosarul dist
        .pipe(reload({stream: true})) //Restartam servrul
         .pipe(notify('JS is build!'));
});

gulp.task('style:dist', function () {
    gulp.src(path.src.style) //Alegem fisierul nostru main.less
        //.pipe(sourcemaps.init()) //Tot aceia ce am facut si cu js
        .pipe(less({ //Copiem
            sourceMap: true,
            errLogToConsole: true
        }))
        .pipe(prefixer())  //Adaugam automat prefixele
        .pipe(cssmin())  //Minifiem
        .pipe(sourcemaps.write())
        //.pipe(sourcemaps.write('.')) generate main.css.map
        .pipe(gulp.dest(path.dist.css)) //Punm fisierul primit in dist
        .pipe(reload({stream: true}))
        .pipe(notify('CSS is build!'));
});

gulp.task('image:dist', function () {
    gulp.src(path.src.img)  //Alegm imaginile noastre
        .pipe(imagemin({  //Le minifiam
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.dist.img)) //le punem in dist
        .pipe(reload({stream: true}));
});

gulp.task('fonts:dist', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.dist.fonts));

});

gulp.task('dist', [
    'html:dist',
    'js:dist',
    'style:dist',
    'fonts:dist',
    'image:dist'
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:dist');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:dist');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:dist');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:dist');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:dist');
    });
});


gulp.task('default', ['dist', 'webserver', 'watch']);
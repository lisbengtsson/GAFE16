var gulp = require('gulp');
require('gulp-grunt')(gulp); // add all the gruntfile tasks to gulp 
var tslint = require('gulp-tslint');
var bower = require('gulp-bower');
var sass = require('gulp-sass');
var del = require('del');
var rootPath = "source/gafe/";
var tsRootPath = rootPath + "ts/";
var sassRootPath = rootPath + "sass/";
var jsRootPath = rootPath + "js/";
var modules = ['gafe'];

/* Js */

gulp.task('js-watch', function () {
  gulp.watch([jsRootPath + '**/*.js'], ['js-build']);
});

gulp.task('js-build', function () {
  return gulp.src([jsRootPath + '**/*.js']).pipe(gulp.dest('js/'));
});

/* Sass */

gulp.task('sass-bootstrap-watch', function () {
  gulp.watch([sassRootPath + 'Bootstrap/bootstrap/**/*.scss'], ['sass-bootstrap-build']);
});

gulp.task('sass-bootstrap-build', function () {
  return gulp.src(sassRootPath + 'Bootstrap/bootstrap.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('css'));
});

gulp.task('sass-theme-watch', function () {
  gulp.watch([sassRootPath + 'theme/**/*.scss'], ['sass-theme-build']);
});

gulp.task('sass-theme-build', function () {
  return gulp.src(sassRootPath + 'theme/theme.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('css'));
});

/* Modules */

for (var i = 0; i < modules.length; i++) {
  (function (cm) {
    gulp.task('ts-' + cm + '-clean', function () {
      return del([tsRootPath + 'apps/' + cm + '/**/*.js', tsRootPath + 'apps/' + cm + '/**/*.js.map']);
    });

    gulp.task('ts-' + cm + '-clean-including-templates', function () {
      return del([tsRootPath + 'apps/' + cm + '/**/*.js', tsRootPath + 'apps/' + cm + '/**/*.js.map', tsRootPath + 'apps/' + cm + '/**/*.tpl.html.ts']);
    });

    gulp.task('ts-' + cm + '-build', ['ts-' + cm + '-lint'], function () {
      gulp.start('grunt-ts:' + cm);
    });

    gulp.task('ts-' + cm + '-watch', function () {
      gulp.watch([tsRootPath + 'apps/' + cm + '/**/*.ts', tsRootPath + 'apps/' + cm + '/**/*.tpl.html'], ['ts-' + cm + '-build']);
    });

    gulp.task('ts-' + cm + '-lint', function () {
      return gulp.src([tsRootPath + 'apps/' + cm + '/**/*.ts', "!" + tsRootPath + 'apps/' + cm + '/**/*.html.ts'])
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
    });
  })(modules[i]);
}

/* Watch All */

gulp.task('modules-watch', function () {
  for (var i = 0; i < modules.length; i++) {
    gulp.watch([tsRootPath + 'apps/' + modules[i] + '/**/*.ts', tsRootPath + 'apps/' + modules[i] + '/**/*.tpl.html'], ['ts-' + modules[i] + '-build']);
  }
});

/* Build All */

var allTasksBuild = [];

for (var i = 0; i < modules.length; i++) {
  allTasksBuild.push('ts-' + modules[i] + '-build');
}

gulp.task('modules-build', allTasksBuild, function () {
  return;
});

/* Clean All */

var allTasksClean = [];

for (var i = 0; i < modules.length; i++) {
  allTasksClean.push('ts-' + modules[i] + '-clean');
}

gulp.task('modules-clean', allTasksClean, function () {
  return;
});

/* Clean All Include Templates */

var allTasksClean = [];

for (var i = 0; i < modules.length; i++) {
  allTasksClean.push('ts-' + modules[i] + '-clean-including-templates');
}

gulp.task('modules-clean-including-templates', allTasksClean, function () {
  return;
});

/* Bower */

gulp.task('bower-libraries-copy-js', function () {
  return gulp.src([
    'bower_components/angular/angular.min.js',
    'bower_components/angular-animate/angular-animate.min.js',
    'bower_components/angular-aria/angular-aria.min.js',
    'bower_components/angular-material/angular-material.min.js',
    'bower_components/angular-messages/angular-messages.min.js',
    'bower_components/angular-packery/dist/packery.min.js',
    'bower_components/angular-ui-router/release/angular-ui-router.min.js',
    'bower_components/angular-ui-sortable/sortable.min.js',
    'bower_components/bootstrap/dist/js/bootstrap.min.js',
    'bower_components/draggabilly/dist/draggabilly.pkgd.min.js',
    'bower_components/jQuery/dist/jquery.min.js',
    'bower_components/moment/min/moment.min.js',
    'bower_components/ng-flow/dist/ng-flow-standalone.min.js',
    'bower_components/ng-module/ng-module.js',
    'bower_components/packery/dist/packery.pkgd.min.js',
    'bower_components/rx.angular/dist/rx.angular.min.js',
    'bower_components/rxjs/dist/rx.all.min.js',
    'bower_components/angular-local-storage/dist/angular-local-storage.min.js',
    'bower_components/async/dist/async.min.js'
  ]).pipe(gulp.dest('js/lib/'));
});

gulp.task('bower-libraries-copy-css', function () {
  return gulp.src([
    'bower_components/angular/angular.min.css',
    'bower_components/bootstrap/dist/css/bootstrap.min.css',
  ]).pipe(gulp.dest('css/lib/'));
});

gulp.task('bower-libraries-copy-fonts', function () {
  return gulp.src([
    'bower_components/bootstrap/dist/fonts/**/*.*',
    'bower_components/font-awesome/fonts/**/*.*',
  ]).pipe(gulp.dest('fonts/lib/'));
});

gulp.task('bower-libraries-restore', function () {
  return bower();
});

/* Continous Delivery */

var releaseTasks = [
    'bower-libraries-copy-js',
    'bower-libraries-copy-css',
    'bower-libraries-copy-fonts',
    'modules-build',
    'sass-bootstrap-build',
    'sass-theme-build',
    'js-build'
];

gulp.task('release', function () {
  for (var i = 0; i < releaseTasks.length; i++) {
    gulp.run(releaseTasks[i]);
  }

  return;
});
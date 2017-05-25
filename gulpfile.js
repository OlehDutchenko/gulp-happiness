'use strict';

/**
 * [Gulp](http://gulpjs.com/) plugin for [happiness](https://github.com/JedWatson/happiness)
 * @module gulp-happiness
 *
 * @author Oleg Dutchenko <dutchenko.o.wezom@gmail.com>
 * @version 0.0.4
 */

// ----------------------------------------
// Imports
// ----------------------------------------

const gulp = require('gulp');
const gulpHappiness = require('./index');

// ----------------------------------------
// Exports
// ----------------------------------------

gulp.task('lint', function () {
	let sources = [
		'./*.js',
		'./node_modules/gulp-not-supported-file/*.js'
	];

	return gulp.src(sources)
		.pipe(gulpHappiness({
			noUnderscore: false
		}))
		.pipe(gulpHappiness.format({
			showHappyFiles: true,
			noUnderscore: false
		}));
});

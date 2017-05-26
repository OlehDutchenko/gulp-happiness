'use strict';

/**
 * [Gulp](http://gulpjs.com/) plugin for [happiness](https://github.com/JedWatson/happiness)
 * @module gulp-happiness
 * @author Oleg Dutchenko <dutchenko.o.wezom@gmail.com>
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
		'./*.js'
	];

	return gulp.src(sources)
		.pipe(gulpHappiness())
		.pipe(gulpHappiness.format())
		.pipe(gulpHappiness.failAfterError());
});

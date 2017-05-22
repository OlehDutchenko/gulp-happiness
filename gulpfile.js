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

gulp.task('lint', function() {
	return gulp.src('./*.js')
		.pipe(gulpHappiness())
		.pipe(gulpHappiness.format())
		.pipe(gulpHappiness.failOnError({
			disabled: true
		}));
});

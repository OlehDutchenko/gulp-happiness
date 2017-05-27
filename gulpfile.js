'use strict';

/**
 * @fileOverview Testing with `gulp-mocha`
 * @author Oleg Dutchenko <dutchenko.o.dev@gmail.com>
 */

// ----------------------------------------
// Imports
// ----------------------------------------

const gulp = require('gulp');
const multipipe = require('multipipe');
const gulpHappiness = require('./index');

// ----------------------------------------
// Helpers
// ----------------------------------------

// ----------------------------------------
// Exports
// ----------------------------------------

gulp.task('lint', function (done) {
	let sources = [
		'./*.js'
	];

	return gulp.src(sources)
		.pipe(multipipe(
			gulpHappiness(),
			gulpHappiness.format(),
			gulpHappiness.failOnError()
		))
		.on('error', function (err) {
			console.log(String(err) );
			done();
		})
		.pipe(gulp.dest('results'));
});

gulp.task('lint-fix', function (done) {
	let sources = [
		'./*.js'
	];

	return gulp.src(sources)
		.pipe(multipipe(
			gulpHappiness({
				fix: true
			}),
			gulpHappiness.format()
			// gulpHappiness.failOnError()
		))
		.on('error', function (err) {
			console.log(String(err) );
			done();
		})
		.pipe(gulp.dest('results'));
});

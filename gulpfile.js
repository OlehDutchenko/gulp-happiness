'use strict';

/**
 * @fileOverview Testing with `gulp-mocha`
 * @author Oleg Dutchenko <dutchenko.o.dev@gmail.com>
 */

// ----------------------------------------
// Imports
// ----------------------------------------

const del = require('del');
const gulp = require('gulp');
const multipipe = require('multipipe');
const gulpHappiness = require('./index');
const mocha = require('gulp-mocha');
const through2 = require('through2');

// ----------------------------------------
// Helpers
// ----------------------------------------

let lintNotFail = true;
let lintFixNotFail = true;

// ----------------------------------------
// Exports
// ----------------------------------------

gulp.task('clean-results', function () {
	return del('./test/results/');
});

gulp.task('lint', function () {
	let sources = [
		'./test/fixtures/playground.js'
	];

	return gulp.src(sources)
		.pipe(multipipe(
			gulpHappiness(),
			gulpHappiness.format(),
			gulpHappiness.failOnError({
				disabled: true,
				onEnd: function (errorMsg) {
					if (errorMsg) {
						lintNotFail = false;
					}
				}
			})
		))
		.on('error', function (err) {
			console.log(String(err));
		})
		.pipe(through2.obj(function (file, enc, cb) {
			file.contents = Buffer.from(`module.exports = ${lintNotFail};\n`);
			cb(null, file);
		}))
		.pipe(gulp.dest('./test/results/'));
});

gulp.task('lint-fix', function (done) {
	let sources = [
		'./test/fixtures/playground-should-be-fixed.js'
	];

	return gulp.src(sources)
		.pipe(multipipe(
			gulpHappiness({
				fix: true
			}),
			gulpHappiness.format(),
			gulpHappiness.failOnError({
				disabled: true,
				onEnd: function (errorMsg) {
					if (errorMsg) {
						lintFixNotFail = false;
					}
				}
			})
		))
		.on('error', function (err) {
			console.log(String(err));
			done();
		})
		.pipe(through2.obj(function (file, enc, cb) {
			file.contents = Buffer.from(`module.exports = ${lintFixNotFail};\n`);
			cb(null, file);
		}))
		.pipe(gulp.dest('./test/results/'));
});

gulp.task('test', function () {
	return gulp.src('test/test.js', {read: false})
		.pipe(mocha({
			reporter: 'spec'
		}));
});

gulp.task('default', gulp.series(
	'clean-results',
	'lint',
	'lint-fix',
	'test'
));

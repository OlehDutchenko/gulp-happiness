# gulp-happiness

![Work in progress](https://img.shields.io/badge/Status-WIP-red.svg)
![npm](https://img.shields.io/badge/node-6.3.1-yellow.svg)
[![es2015](https://img.shields.io/badge/ECMAScript-2015_(ES6)-blue.svg)](https://nodejs.org/en/docs/es6/)
[![license](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/dutchenkoOleg/gulp-happiness/blob/master/LICENSE)

> _Gulp plugin for [happiness](https://www.npmjs.com/package/happiness)_  
> ___Coming Soon___

[![js-happiness-style](https://cdn.rawgit.com/JedWatson/happiness/master/badge.svg)](https://github.com/JedWatson/happiness)

---

## Installing

```shell
npm install --save gulp-happiness
# or using yarn cli
yarn add gulp-happiness
```

## Usage

Check out files with [happiness](https://www.npmjs.com/package/happiness) linter

```js
const gulp = require('gulp');
const gulpHappiness = require('gulp-happiness');

gulp.task('lint', function () {
	return gulp.src(['**/*.js','!node_modules/**'])
		// attaches the lint data to the "eslint" property
		// of the file object so it can be used by other modules. 
		// By default it will skip files with empty content
		// and if filename starts with _ (underscore)
		.pipe(gulpHappiness())
		// eslint.format() outputs the lint results to the console.
		.pipe(gulpHappiness.format())
		// Look after checking all the streamed files,
		// and if at least one of them has errors it will fail.
		// Note! This method does not transfer files further to the stream!
		.pipe(gulpHappiness.failAfterError());
});
```

Lint files, fix and transfer

```js
const gulp = require('gulp');
const gulpHappiness = require('gulp-happiness');

gulp.task('lint', function () {
	return gulp.src('./src/scripts/**/*.js')
		// Enable fixing - fix: true.
		// If auto fixing cannot be done, 
		// you will see message in console about it
		.pipe(gulpHappiness({
			fix: true
		}))
		// Show in console happy files ;)
		.pipe(gulpHappiness.format({
			showHappyFiles: true
		}))
		// Failing if file has eslint errors,
		// it will break task immediately.
		// Current file and all next not will be transferred
		.pipe(gulpHappiness.failOnError())
		// transfer files
		.pipe(gulp.dest('./dist/assets/js/'));
});
```

## API

### gulpHappiness(options)

#### options.fix

type `boolean` /
default `undefined`

Fix most issues automatically.

*__Note!__ It will not fix original file in your fs.  
It fix files in stream and you must save them where you need by using `gulp.dest()`  after linting*

*__Note!__ If auto fixing cannot be done - you will see message in console about it*  
_Example of log:_

![Cannot auto fix example](https://raw.githubusercontent.com/dutchenkoOleg/gulp-happiness/master/assets/connot-auto-fix.png)

#### options.noEmpty

type `boolean` /
default `true`

File with empty content will be skipped and not using in stream next.  
_You will receive message in console if it happens_

_**Note!** Spaces, tabs and newlines will be treated as empty content._  


#### options.noUnderscore

type `boolean` /
default `true`

File which name starts with _ (underscore) will be skipped and not using in stream next.  
_You will receive message in console if it happens_



## Changelog

Please read [CHANGELOG.md](https://github.com/dutchenkoOleg/gulp-happiness/blob/master/CHANGELOG.md)

## Contributing

Please read [CONTRIBUTING.md](https://github.com/dutchenkoOleg/gulp-happiness/blob/master/CONTRIBUTING.md)

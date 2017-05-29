# gulp-happiness

![npm](https://img.shields.io/badge/node-6.3.1-yellow.svg)
[![es2015](https://img.shields.io/badge/ECMAScript-2015_(ES6)-blue.svg)](https://nodejs.org/en/docs/es6/) 
[![license](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/dutchenkoOleg/gulp-happiness/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/dutchenkoOleg/gulp-happiness.svg?branch=master)](https://travis-ci.org/dutchenkoOleg/gulp-happiness)
[![Dependencies](https://www.versioneye.com/user/projects/592bb907a8a056006137f481/badge.svg?style=flat)](https://www.versioneye.com/user/projects/592bb907a8a056006137f481?child=summary)

> _Gulp plugin for [happiness](https://www.npmjs.com/package/happiness)_

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
		// Attaches the lint data to the "eslint" property
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

---

## API

- [gulpHappiness()](#gulphappiness)
- [gulpHappiness(options)](#gulphappinessoptions)



- [gulpHappiness.format()](#gulphappinessformat)
- [gulpHappiness.format(formatterName)](#gulphappinessformatformattername)
- [gulpHappiness.format(formatterFunction)](#gulphappinessformatformatterfunction)
- [gulpHappiness.format(formatterName/formatterFunction, options)](#gulphappinessformatformatternameformatterfunction-options)



- [gulpHappiness.failOnError()](#gulphappinessfailonerror)
- [gulpHappiness.failOnError(options)](#gulphappinessfailonerroroptions)



- [gulpHappiness.failAfterError()](#gulphappinessfailaftererror)
- [gulpHappiness.failAfterError(options)](#gulphappinessfailaftererroroptions)

### gulpHappiness()

_No explicit configuration._   
Linting with default options.  
Attaches the lint data to the "eslint" property of the file object so it can be used by other modules. 

### gulpHappiness(options)

#### options.fix

type `boolean` /
default `undefined`  
Fix most issues automatically if set `true`.

*__Note!__ It will not fix original files in your fs.  
It will fix files in stream and you must save them where you need by using `gulp.dest()`  after linting*

*__Note!__ If auto fixing cannot be done - you will see message in console about it.*  
_Example of log:_

![Cannot auto fix example](https://raw.githubusercontent.com/dutchenkoOleg/gulp-happiness/master/assets/connot-auto-fix.png)

#### options.linterOptions

type `Object` /
default `undefined`  
Options for [happiness](https://www.npmjs.com/package/happiness) linter

#### options.linterOptions.globals  

type `Array.<string>` /
default `undefined`  
Custom global variables to declare (e.g. `['jquery', '$']`)

#### options.linterOptions.plugins  

type `Array.<string>` /
default `undefined`  
Custom eslint plugins

#### options.linterOptions.envs  

type `Array.<string>` /
default `undefined`  
Custom eslint environment

#### options.linterOptions.parser  

type `string` /
default `undefined`  
Custom js parser (e.g. `'babel-eslint'`)

#### options.noUnderscore

type `boolean` /
default `true`  
File which name starts with _ (underscore) will be skipped and not using in stream next.  

_You will receive message in console if it happens._  
_Example of log:_

![no-empty log example](https://raw.githubusercontent.com/dutchenkoOleg/gulp-not-supported-file/master/assets/no-underscore.png)


#### options.noEmpty

type `boolean` /
default `true`  
File with empty content will be skipped and not using in stream next.  
_**Note!** Spaces, tabs and newlines will be treated as empty content._  

_You will receive message in console if it happens._  
_Example of log:_

![no-empty log example](https://raw.githubusercontent.com/dutchenkoOleg/gulp-not-supported-file/master/assets/no-empty.png)


#### options.silent

type `boolean` /
default `undefined`  
No logs about `noEmpty` and `noUnderscore` files

### gulpHappiness.format()

_No explicit configuration._   
Outputs the lint results to the console.  
Default formatter is [`eslint-formatter-pretty`](https://www.npmjs.com/package/eslint-formatter-pretty)

### gulpHappiness.format(formatterName)

#### formatterName

type `string`  
You can use formatter by default  
`gulpHappiness.format('default')` - same as `gulpHappiness.format()`  

or use one of the [ESLint-provided formatters](https://github.com/eslint/eslint/tree/master/lib/formatters),  
for example `gulpHappiness.format('stylish')` 

or use some else formatter which you can install from npm [https://www.npmjs.com/search?q=eslint+formatter](https://www.npmjs.com/search?q=eslint+formatter)  
_Example_

```shell
npm i --save eslint-friendly-formatter
```

```js
const gulp = require('gulp');
const gulpHappiness = require('gulp-happiness');

gulp.task('lint', function () {
	return gulp.src(['**/*.js','!node_modules/**'])
		.pipe(gulpHappiness())
		.pipe(gulpHappiness.format('eslint-friendly-formatter'))
});
```

### gulpHappiness.format(formatterFunction)

#### formatterFunction(results[, formatterOptions])

type `function`

_Parameters:_

Name | Data type | Description
 --- | --- | ---
 `results` | `Array` | Results of eslint
 `formatterOptions` | `Object/undefined` | Options for formatter
	
You can use own function or existing formatters as function [https://www.npmjs.com/search?q=eslint+formatter](https://www.npmjs.com/search?q=eslint+formatter)

___Note!___ Function will receive results array from  eslint data for formatting.   
And it is must return output as string if has problems in received results for console or some negative value, e.g. `null | undefined | false | '' `.

_Example with custom formatter function_

```js
const gulp = require('gulp');
const gulpHappiness = require('gulp-happiness');

gulp.task('lint', function () {
	return gulp.src(['**/*.js','!node_modules/**'])
		.pipe(gulpHappiness())
		.pipe(gulpHappiness.format(function(results, formatterOptions={}) {
			// process results and options
			// ...
			
			let output = myOwnMethodForTransformResults(results, transformOptions);
			
			return output;
		}))
});
```

_Example with installed formatter function_

```shell
npm i --save eslint-friendly-formatter
```

```js
const gulp = require('gulp');
const gulpHappiness = require('gulp-happiness');
const eslintFriendlyFormatter = require('eslint-friendly-formatter');

gulp.task('lint', function () {
	return gulp.src(['**/*.js','!node_modules/**'])
		.pipe(gulpHappiness())
		.pipe(gulpHappiness.format(eslintFriendlyFormatter))
});
```

### gulpHappiness.format(formatterName/formatterFunction, options)

#### formatterName/formatterFunction

see above [formatterName](#formattername) and [formatterFunction](#formatterfunctionresults-formatteroptions)


#### options.formatterOptions

type `Object` /
default `undefined`  
Options for the chosen formatter 

#### options.showHappyFiles

type `boolean` /
default `undefined`  
Show files without problems in console

_Example of log:_

![Show happy files example](https://raw.githubusercontent.com/dutchenkoOleg/gulp-happiness/master/assets/show-hapy-files.png)

#### options.noUnderscore

Same as [gulpHappiness(options) → options.noUnderscore](#optionsnounderscore)

#### options.noEmpty

Same as [gulpHappiness(options) → options.noEmpty](#optionsnoempty)

#### options.silent

Same as [gulpHappiness(options) → options.silent](#optionssilent)


### gulpHappiness.failOnError()

_No explicit configuration._ 

### gulpHappiness.failOnError(options)

#### options.disabled

type `boolean` /
default `undefined`  
Not fail on errors 

#### options.onEnd(errorMsg, eslintData)

type `fucnction` /
default `undefined`  

_Parameters:_

Name | Data type | Description
 --- | --- | ---
 `errorMsg` | `null/string` | Is `null` if no errors were found and is `string` if errors were found. String contains a short message about errors
 `eslintData` | `Object` | eslint data from file
 
Its call will be before ending of pipe. So you don't need apply no callbacks or return some values.  
You can use it for own custom actions, e.g rewrite some globals.  
___Note!___ Even if `options.disabled` - is `true` - this function will be called


#### options.noUnderscore

Same as [gulpHappiness(options) → options.noUnderscore](#optionsnounderscore)

#### options.noEmpty

Same as [gulpHappiness(options) → options.noEmpty](#optionsnoempty)

#### options.silent

Same as [gulpHappiness(options) → options.silent](#optionssilent)


### gulpHappiness.failAfterError()

_No explicit configuration._ 

### gulpHappiness.failAfterError(options)

#### options.disabled

Same as [gulpHappiness.failOnError(options) → options.disabled](#optionsdisabled)

#### options.onEnd(errorMsg, errorFilesPaths, allErrorsCount)

type `fucnction` /
default `undefined`  

_Parameters:_

Name | Data type | Description
 --- | --- | ---
 `errorMsg` | `null/string` | Is `null` if no errors were found and is `string` if errors were found. String contains a short message about errors
 `errorFilesPaths` | `Array` | Array of files with errors. It will an empty if no files.
 `allErrorsCount` | `number` | Count of all errors. Will be 0 if no errors
 
Its call will be before ending of pipe. So you don't need apply no callbacks or return some values.  
You can use it for own custom actions, e.g rewrite some globals.  
___Note!___ Even if `options.disabled` - is `true` - this function will be called

#### options.noUnderscore

Same as [gulpHappiness(options) → options.noUnderscore](#optionsnounderscore)

#### options.noEmpty

Same as [gulpHappiness(options) → options.noEmpty](#optionsnoempty)

#### options.silent

Same as [gulpHappiness(options) → options.silent](#optionssilent)

## Tests

1. `npm test` for testing code style and run mocha tests
1. `npm run happiness-fix` for automatically fix most of problems with code style 

## Changelog

Please read [CHANGELOG.md](https://github.com/dutchenkoOleg/gulp-happiness/blob/master/CHANGELOG.md)

## Contributing

Please read [CONTRIBUTING.md](https://github.com/dutchenkoOleg/gulp-happiness/blob/master/CONTRIBUTING.md)

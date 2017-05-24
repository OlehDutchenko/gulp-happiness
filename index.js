'use strict';

/**
 * [Gulp](http://gulpjs.com/) plugin for [happiness](https://github.com/JedWatson/happiness)
 * @module
 * @author Oleg Dutchenko <dutchenko.o.dev@gmail.com>
 * @version 0.1.0
 */

// ----------------------------------------
// Imports
// ----------------------------------------

const path = require('path');
const gutil = require('gulp-util');
const through2 = require('through2');
const happiness = require('happiness');
const _isArray = require('lodash.isarray');
const _cloneDeep = require('lodash.clonedeep');
const _isPlainObject = require('lodash.isplainobject');

// ----------------------------------------
// Helpers
// ----------------------------------------

/**
 * Saved plug-in name for use in terminal logs
 * @const {string}
 * @private
 */
const pluginName = 'gulp-happiness';

/**
 * Allow console log if `false`
 * @type {boolean}
 * @private
 */
let silent = false;

/**
 * Checking if silent mode turned on
 * @param {Object} [options={}]
 */
function setSilent(options={}) {
	if (_isPlainObject(options)) {
		silent = !!options.silent;
	} else {
		silent = false;
	}
}

/**
 * Custom log method
 * @param {*} args
 */
function consoleLog (...args) {
	if (silent !== true) {
		console.log(...args);
	}
}

/**
 * [FW] Colored console log, based on `gutil.colors`
 * @param {string} keyword
 * @return {Function}
 * @private
 * @sourceCode
 */
function colorLog(keyword) {
	let list = [
		'yellow',
		'red',
		'blue',
		'magenta',
		'white',
		'black',
		'cyan',
		'gray',
		'green'
	];
	let color = list.indexOf(keyword) >= 0 ? gutil.colors[keyword] :  gutil.colors['white'] ;
	
	return function(...args) {
		let msg = color(args.join(' '));

		consoleLog(msg);
	}
}

const yellowLog = colorLog('yellow');
const greenLog = colorLog('green');
const redLog = colorLog('red');

/**
 * Plugin error constructor
 * @param {string|Error} sample
 * @param {Object} [options]
 * @see {@link https://github.com/gulpjs/gulp-util#new-pluginerrorpluginname-message-options}
 * @private
 * @sourceCode
 */
function pluginError (sample, options) {
	return new gutil.PluginError(pluginName, sample, options);
}

/**
 * Checking if file is supported for processing  
 * returns `false` if supported
 * returns `Array` if not supported
 * @param {Object} file
 * @param {boolean} [breakImmediately]
 * @return {boolean|Array}
 */
function notSupportedFile (file, breakImmediately) {
	if (breakImmediately) {
		return [null, file];
	}

	if (file.isNull()) {
		yellowLog('WARN ! file isNull');
		consoleLog(file);
		return [];
	}

	if (file.isStream()) {
		redLog('ERROR ! Streams are not supported!');
		consoleLog(file);
		return [pluginError('Streams are not supported!')];
	}

	if (!file.contents.length) {
		yellowLog('WARN ! No file content');
		consoleLog(file);
		return [null, file];
	}
	
	return false;
}

// ----------------------------------------
// Public
// ----------------------------------------

/**
 * @param options
 * @returns {DestroyableTransform} through2.obj
 */
function gulpHappiness (options={}) {
	let runOptions = _cloneDeep(options);
	
	setSilent(runOptions);
	
	return through2.obj(function (file,...args) {
		let cb = args[1];
		let notSupported = notSupportedFile(file);
		
		if (_isArray(notSupported)) {
			return cb(...notSupported);
		}

		happiness.lintText(String(file.contents), runOptions, function (err, data) {
			if (err) {
				return cb(pluginError(err));
			}

			data.results.forEach(result => {
				result.filePath = file.path;
			});

			file.eslint = data;
			cb(null, file);
		});
	});
}

// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = gulpHappiness;

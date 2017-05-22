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

const path = require('path');
const gutil = require('gulp-util');
const through2 = require('through2');
const happiness = require('happiness');
const _cloneDeep = require('lodash.clonedeep');



// ----------------------------------------
// Private helpers
// ----------------------------------------

/**
 * Saved plug-in name for use in terminal logs
 * @const {string}
 * @private
 * @sourceCode
 */
const pluginName = 'gulp-happiness';

/**
 * @method
 * @private
 * @sourceCode
 */
const terminalLogger = console.warn;

/**
 * @private
 * @sourceCode
 */
function pluginLogger () {
	let args = arguments;
	let sampleData = args[0] || '';

	if (typeof sampleData !== 'string') {
		args.shift();
	}

	gutil.log(...args);
	
	if (sampleData) {
		terminalLogger(sampleData);
	}
}

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
 * List of default formatters
 * according to node_modules/happiness/node_modules/eslint/lib/formatters/
 * @const {Array}
 * @private
 * @sourceCode
 */
const defaultFormatters = [
	'checkstyle',
	'compact',
	'html',
	'jslint-xml',
	'json',
	'junit',
	'stylish',
	'table',
	'tap',
	'unix',
	'visualstudio'
];

/**
 * Get formatter for report
 * @param {string|function} [formatter='stylish']
 * @param {object} [options]
 * @private
 * @sourceCode
 */
function pluginReporter (formatter = 'stylish', options) {
	// execute and return formatter fn
	if (typeof formatter === 'function') {
		return formatter(options);
	}

	// get formatter from node modules
	if (!formatter && typeof formatter === 'string') {
		let formatterPath = formatter;
		
		// default
		if (defaultFormatters.indexOf(formatter) >= 0) {
			formatterPath = path.join(
				'happiness/node_modules/eslint/lib/formatters',
				formatter
			);
		}
		
		try {
			let formatterModule = require(formatterPath);
			return formatterModule(options);
		} catch (err) {
			pluginError('Streams are not supported!');
		}
	}

	pluginError('formatter must be function or string');
}

/**
 * [FW] Send to linting
 * @param {Object} [options]
 * @return {Function}
 */
function bufferReader(options) {
	const runOptions = _cloneDeep(options);

	return function(file, enc, cb) {
		// check
		if (file.isNull()) {
			pluginLogger(file, 'null file');
			return cb(null, file);
		}

		if (file.isStream()) {
			pluginLogger(file);
			return cb(pluginError('Streams are not supported!'));
		}
		
		if (!file.contents.length) {
			pluginLogger(file, 'No content');
			return cb(null, file);
		}
		
		// lint
		let fileContent = file.contents.toString(enc);

		happiness.lintText(fileContent, runOptions, function (err, data) {
			if (err) {
				return cb(pluginError(err));
			}
			file.happiness = data;
			cb(null, file);
		});
	}
}

/**
 * Lookup for errors and fail if has one
 * @param {Buffer} file
 * @param {string} enc
 * @param {function} cb
 * @return {*}
 */
function bufferErrors (file, enc, cb) {
	let data = file.happiness || null;
	
	if (data === null) {
		return cb(null, file);
	}
	
	console.warn( data );
	return cb(null, file);
}



// ----------------------------------------
// Public
// ----------------------------------------

/**
 * @param userOptions
 * @returns {DestroyableTransform} through2.obj
 * @sourceCode +7
 */
function gulpHappiness (userOptions) {
	return through2.obj(bufferReader(userOptions));
}

gulpHappiness.reporter = pluginReporter;
gulpHappiness.name = pluginName;
gulpHappiness.failOnError = function() {
	return through2.obj(bufferErrors);
};



// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = gulpHappiness;

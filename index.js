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
	let nonStringData = typeof sampleData !== 'string';

	if (nonStringData) {
		args.shift();
	}

	gutil.log(...args);

	if (nonStringData) {
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
 * [FW] Send to linting
 * @param {Object} [options]
 * @return {Function}
 */
function bufferReader (options) {
	const runOptions = _cloneDeep(options);

	return function (file, enc, cb) {
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
	};
}

/**
 * Get formatter for report
 * @param {string|function} [formatter='stylish']
 * @param {object} [options]
 * @return {Function}
 * @private
 * @sourceCode
 */
function bufferFormatter (formatter, options) {
	return function (file) {
		let cb = arguments[2];
		let data = file.happiness;

		if (typeof data !== 'object' || data === null) {
			cb(null, file);
		}
		if (typeof formatter === 'function') {
			formatter(data, options);
			cb(null, file);
		}

		if (!formatter || typeof formatter === 'string') {
			let yellow = gutil.colors.yellow

			if (data.errorCount <= 0) {
				pluginLogger(yellow('Congratulations, your code is happy!'));
				pluginLogger(yellow('************************************'));
				return cb(null, file);
			}

			let formatterPath = formatter;

			if (defaultFormatters.indexOf(formatter) >= 0) {
				formatterPath = path.join(
					'happiness/node_modules/eslint/lib/formatters',
					formatter
				);
			}

			try {
				let formatterModule = require(formatterPath);
				let result = formatterModule(data.results, options);

				if (result && typeof result === 'string') {
					console.warn(yellow(`> ${file.path}`));
					console.warn(result);
				}

				return cb(null, file);
			} catch (err) {
				cb(pluginError(err));
			}
		}
	};
}

/**
 * Lookup for errors and fail if has one
 * @param {object} [options]
 * @return {Function}
 * @private
 * @sourceCode
 */
function bufferErrors (options) {
	return function (file) {
		let data = file.happiness || null;
		let cb = arguments[2];

		if (options.disabled) {
			return cb(null, file);
		}

		if (data === null) {
			return cb(null, file);
		}

		if (data.errorCount) {
			let red = gutil.colors.red;
			let s = ' ';
			let errorMsgList = [
				red(`errorCount ${data.errorCount}`),
				red('================================='),
				red(' ')
			];

			let errorMsg = errorMsgList.join(`\n${s + s + s + s}`);

			return cb(pluginError(errorMsg));
		}

		return cb(null, file);
	}
}

// ----------------------------------------
// Public
// ----------------------------------------

/**
 * @param userOptions
 * @returns {DestroyableTransform} through2.obj
 * @sourceCode +10
 */
function gulpHappiness (userOptions) {
	return through2.obj(bufferReader(userOptions));
}

gulpHappiness.format = function (formatter = 'stylish', options) {
	return through2.obj(bufferFormatter(formatter, options));
};

gulpHappiness.failOnError = function (options) {
	return through2.obj(bufferErrors(options));
};

// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = gulpHappiness;

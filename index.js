'use strict';

/**
 * [Gulp](http://gulpjs.com/) plugin for [happiness](https://github.com/JedWatson/happiness)
 * @module
 * @author Oleg Dutchenko <dutchenko.o.dev@gmail.com>
 */

// ----------------------------------------
// Imports
// ----------------------------------------

const path = require('path');
const gutil = require('gulp-util');
const through2 = require('through2');
const happiness = require('happiness');
const _cloneDeep = require('lodash.clonedeep');
const _isPlainObject = require('lodash.isplainobject');
const _isFunction = require('lodash.isfunction');
const _isString = require('lodash.isstring');
const notSupportedFile = require('gulp-not-supported-file');

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
 * Plugin error constructor
 * @param {string|Error} sample
 * @param {Object}       [options]
 * @see {@link https://github.com/gulpjs/gulp-util#new-pluginerrorpluginname-message-options}
 * @private
 * @sourceCode
 */
function pluginError (sample, options) {
	return new gutil.PluginError(pluginName, sample, options);
}

function getEslintData (file, pluginError, runOptions) {
	let notSupported = notSupportedFile(file, pluginError, {
		silent: runOptions.silent,
		noUnderscore: runOptions.noUnderscore,
		noEmpty: runOptions.noEmpty
	});

	if (Array.isArray(notSupported)) {
		return notSupported;
	}

	let eslintData = file.eslint;

	if (_isPlainObject(eslintData)) {
		return eslintData;
	}

	if (runOptions.silent !== true) {
		console.log(gutil.colors.yellow('eslint data not found'));
		console.log(gutil.colors.magenta(file.path));
	}

	return ['isNoEslintData'];
}

// ----------------------------------------
// Public
// ----------------------------------------

/**
 * Main lint method.
 * Add linting data as property `eslint` to file.
 * @param {Object}  [options={}]
 * @param {boolean} [options.silent]
 * @param {boolean} [options.noUnderscore=true]
 * @param {boolean} [options.noEmpty=true]
 * @returns {DestroyableTransform} through2.obj
 */
function gulpHappiness (options = {}) {
	let runOptions = _cloneDeep(options);

	return through2.obj(function (file, ...args) {
		let cb = args[1];
		let notSupported = notSupportedFile(file, pluginError, {
			silent: runOptions.silent,
			noUnderscore: runOptions.noUnderscore,
			noEmpty: runOptions.noEmpty
		});

		if (Array.isArray(notSupported)) {
			notSupported.shift();
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

/**
 * Get linting data from from file and show it in terminal
 * @param {string|Object} [formatter='default'] if it is Object using as options
 * @param {Object}        [options={}]
 * @param {boolean}       [options.silent]
 * @param {boolean}       [options.showHappyFiles]
 * @returns {DestroyableTransform} through2.obj
 */
gulpHappiness.format = function (formatter = 'default', options = {}) {
	if (_isPlainObject(formatter)) {
		options = _cloneDeep(formatter);
		formatter = 'default';
	}

	let runOptions = _cloneDeep(options);
	let defaultFormatter = 'eslint-formatter-pretty';
	let eslintFormattersFolder = 'eslint/lib/formatters';
	let eslintFormattersList = [
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

	if (runOptions.silent) {
		runOptions.showHappyFiles = false;
	}

	return through2.obj(function (file, ...args) {
		let cb = args[1];
		let eslintData = getEslintData(file, pluginError, runOptions);

		if (Array.isArray(eslintData)) {
			eslintData.shift();
			return cb(...eslintData);
		}

		if (eslintData.errorCount + eslintData.warningCount === 0) {
			if (runOptions.showHappyFiles) {
				console.log(gutil.colors.green(`HAPPY FILE > ${file.path}`));
			}
			return cb(null, file);
		}

		if (_isFunction(formatter)) {
			formatter(eslintData, runOptions);
			return cb(null, file);
		}

		if (_isString(formatter)) {
			let formatterPath = formatter;
			let isDefault = !formatter || formatter === 'default';
			let fromList = !isDefault && eslintFormattersList.indexOf(formatter) >= 0;

			if (isDefault) {
				formatterPath = defaultFormatter;
			}

			if (fromList) {
				formatterPath = path.join(eslintFormattersFolder, formatter);
			}

			try {
				let formatterModule = require(formatterPath);
				let result = formatterModule(eslintData.results);

				console.log(gutil.colors.red(`SAD FILE > ${file.path}`));
				console.log(result);
				return cb(null, file);
			} catch (err) {
				return cb(pluginError(err));
			}
		}

		return cb(pluginError(`No suitable formatter - ${formatter}`));
	});
};

// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = gulpHappiness;

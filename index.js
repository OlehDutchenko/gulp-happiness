'use strict';

/**
 * Gulp plugin for [happiness](https://github.com/JedWatson/happiness)
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
 * @sourceCode
 */
const pluginName = 'gulp-happiness';

/**
 * Text message about how get more information
 * @const {string}
 * @private
 * @sourceCode
 */
const moreInfo = '\n    Info:\n    Use gulpHappiness.format() method for more information about errors';

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

/**
 * Get 'error' or 'errors' text
 * @param {number} count
 * @return {string}
 * @private
 * @sourceCode
 */
function getErrorText (count) {
	return count > 1 ? 'errors' : 'error';
}

/**
 * Get 'path' or 'paths' text
 * @param {number} count
 * @return {string}
 * @private
 * @sourceCode
 */
function getPathText (count) {
	return count > 1 ? 'paths' : 'path';
}

/**
 * Get eslint result data from file
 * @param {File} file
 * @param {function} pluginError
 * @param {Object} [runOptions={}]
 * @return {Object|Array}
 * @private
 * @sourceCode
 */
function getEslintData (file, pluginError, runOptions = {}) {
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
 * @sourceCode
 */
function gulpHappiness (options = {}) {
	let runOptions = _cloneDeep(options);

	if (!_isPlainObject(runOptions.linterOptions)) {
		runOptions.linterOptions = {};
	}

	return through2.obj(function (file, enc, cb) {
		let notSupported = notSupportedFile(file, pluginError, {
			silent: runOptions.silent,
			noUnderscore: runOptions.noUnderscore,
			noEmpty: runOptions.noEmpty
		});

		if (Array.isArray(notSupported)) {
			notSupported.shift();
			return cb(...notSupported);
		}

		let fixProblems = runOptions.fix;
		let lintOptions = {
			globals: runOptions.linterOptions.globals,
			plugins: runOptions.linterOptions.plugins,
			envs: runOptions.linterOptions.envs,
			parser: runOptions.linterOptions.parser
		};

		if (fixProblems) {
			happiness.eslintConfig.fix = true;
			happiness.lintFiles([file.path], lintOptions, function (err, data) {
				if (err) {
					return cb(pluginError(err));
				}

				let output = data.results && data.results[0] && data.results[0].output;

				if (typeof output === 'string') {
					file.contents = Buffer.from(output, enc);
				}
				if (data.errorCount > 0) {
					console.log(gutil.colors.yellow(`\nCannot auto fix ${file.path}\nDo it yourself manual\n`));
				}
				file.eslint = data;
				cb(null, file);
			});
			return;
		}

		happiness.lintText(String(file.contents), lintOptions, function (err, data) {
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
 * @param {boolean}       [options.noUnderscore=true]
 * @param {boolean}       [options.noEmpty=true]
 * @param {boolean}       [options.showHappyFiles]
 * @returns {DestroyableTransform} through2.obj
 * @sourceCode
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
			let output = formatter(eslintData.results, runOptions.formatterOptions);

			console.log(output);
			file.eslintIsFormeated = true;
			return cb(null, file);
		}

		if (_isString(formatter)) {
			let formatterPath = formatter;
			let isDefault = !formatter || formatter === 'default' || formatter === defaultFormatter;
			let fromList = !isDefault && eslintFormattersList.indexOf(formatter) >= 0;

			if (isDefault) {
				formatterPath = defaultFormatter;
			}
			if (fromList) {
				formatterPath = path.join(eslintFormattersFolder, formatter);
			}

			try {
				let formatterModule = require(formatterPath);
				let result = formatterModule(eslintData.results, runOptions.formatterOptions);

				console.log(gutil.colors.red(`SAD FILE > ${file.path}`));
				console.log(result);
				file.eslintIsFormeated = true;
				return cb(null, file);
			} catch (err) {
				return cb(pluginError(err));
			}
		}

		return cb(pluginError(`Error! No suitable formatter - ${formatter}`));
	});
};

/**
 * Failing if file has eslint errors
 * @param {Object}  [options={}]
 * @param {boolean} [options.silent]
 * @param {boolean} [options.noUnderscore=true]
 * @param {boolean} [options.noEmpty=true]
 * @returns {DestroyableTransform} through2.obj
 * @sourceCode
 */
gulpHappiness.failOnError = function (options = {}) {
	let runOptions = _cloneDeep(options);

	return through2.obj(function (file, ...args) {
		let cb = args[1];
		let filePaths = [];
		let eslintData = getEslintData(file, pluginError, runOptions);

		if (Array.isArray(eslintData)) {
			eslintData.shift();
			return cb(...eslintData);
		}

		if (eslintData.errorCount === 0) {
			if (_isFunction(runOptions.onEnd)) {
				runOptions.onEnd(null, eslintData);
			}
			return cb(null, file);
		}

		eslintData.results.forEach(result => {
			filePaths.push(result.filePath);
		});

		let count = eslintData.errorCount;
		let errorText = getErrorText(count);
		let pathText = getPathText(filePaths.length);
		let errorMsg = `Fail on Error! ${count} ${errorText} in ${pathText}:\n    ${filePaths.join('\n    ')}`;

		if (file.eslintIsFormeated !== true) {
			errorMsg += moreInfo;
		}

		if (_isFunction(runOptions.onEnd)) {
			runOptions.onEnd(errorMsg, eslintData);
		}

		if (runOptions.disabled) {
			return cb(null, file);
		}

		return cb(pluginError(errorMsg));
	});
};

/**
 * Look after checking all the streamed files,
 * and if at least one of them has errors it will fail.
 * __Note!__ This method does not transfer files further to the stream!
 * @param {Object}  [options={}]
 * @param {boolean} [options.silent]
 * @param {boolean} [options.noUnderscore=true]
 * @param {boolean} [options.noEmpty=true]
 * @returns {DestroyableTransform} through2.obj
 * @sourceCode
 */
gulpHappiness.failAfterError = function (options = {}) {
	let runOptions = _cloneDeep(options);
	let eslintIsFormatted = false;
	let allErrorsCount = 0;
	let filePaths = [];

	return through2.obj(function (file, ...args) {
		let cb = args[1];
		let eslintData = getEslintData(file, pluginError, runOptions);

		if (Array.isArray(eslintData)) {
			eslintData.shift();
			return cb(...eslintData);
		}

		if (eslintData.errorCount === 0) {
			return cb();
		}

		eslintIsFormatted = file.eslintIsFormeated;
		allErrorsCount += eslintData.errorCount;
		eslintData.results.forEach(result => {
			let count = result.errorCount;
			let errorText = getErrorText(count);

			filePaths.push(`has ${count} ${errorText} in ${result.filePath}`);
		});

		cb();
	}, function (cb) {
		if (allErrorsCount === 0) {
			if (_isFunction(runOptions.onEnd)) {
				runOptions.onEnd(null, allErrorsCount, filePaths);
			}
			return cb();
		}

		let errorText = getErrorText(allErrorsCount);
		let pathText = getPathText(filePaths.length);
		let errorMsg = `Fail after Error! ${allErrorsCount} ${errorText} in ${pathText}:\n    ${filePaths.join('\n    ')}`;

		if (eslintIsFormatted !== false) {
			errorMsg += moreInfo;
		}

		if (_isFunction(runOptions.onEnd)) {
			runOptions.onEnd(errorMsg, allErrorsCount, filePaths);
		}

		if (runOptions.disabled) {
			return cb();
		}

		cb(pluginError(errorMsg));
	});
};

// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = gulpHappiness;

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
const _cloneDeep = require('lodash.clonedeep');
const _isPlainObject = require('lodash.isplainobject');

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
 * @private
 * @sourceCode
 */
const redLog = gutil.colors.red;

/**
 * @private
 * @sourceCode
 */
const greenLog = gutil.colors.green;

/**
 * @private
 * @sourceCode
 */
const yellowLog = gutil.colors.yellow;

/**
 * @method
 * @private
 * @sourceCode
 */
const consoleLog = console.warn;

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
		consoleLog(sampleData);
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
 * Checking file
 * @param {Object} file
 * @param {function} callback
 * @param {boolean} [breakImmediately]
 * @return {boolean|undefined}
 */
function pluginCheckFile (file, callback, breakImmediately) {
	if (breakImmediately) {
		callback(null, file);
		return true;
	}

	if (file.isNull()) {
		pluginLogger(file, yellowLog('null file'));
		callback(null, file);
		return true;
	}

	if (file.isStream()) {
		pluginLogger(file);
		callback(pluginError('Streams are not supported!'));
		return true;
	}

	if (!file.contents.length) {
		pluginLogger(file, yellowLog('No content'));
		callback(null, file);
		return true;
	}
}

function pluginGetFileData(runOptions, file, callback, breakImmediately) {
	let eslintData = file.eslint;

	if (typeof eslintData === 'undefined') {
		pluginLogger(yellowLog('eslint result data not found'));
		breakImmediately = true;
	}

	if (eslintData.errorCount + eslintData.warningCount === 0) {
		if (runOptions.showHappyFiles) {
			consoleLog(greenLog(`HAPPY FILE > ${file.path}`));
		}
		callback(null, file);
		return null;
	}

	if (fileFail) {
		return null;
	}
	return eslintData;
};

/**
 * [FW] Send file to linting by [happiness module](https://github.com/JedWatson/happiness)
 * @param {Object} [options]
 * @return {function}
 */
function fileLinting (options = {}) {
	let runOptions = _cloneDeep(options);

	return function (file) {
		let callback = arguments[2];
		let fileFail = pluginCheckFile(file, callback);

		if (fileFail) {
			return;
		}

		happiness.lintText(String(file.contents), runOptions, function (err, data) {
			if (err) {
				return callback(pluginError(err));
			}

			data.results.forEach(result => {
				result.filePath = file.path;
			});

			file.eslint = data;
			callback(null, file);
		});
	};
}

/**
 * [FW] Get formatter for report
 * @param {string|function|object} [formatter='default']
 * @param {Object} [options={}]
 * @return {function}
 * @private
 * @sourceCode
 */
function fileFormatter (formatter = 'default', options = {}) {
	if (_isPlainObject(formatter)) {
		options = formatter;
		formatter = 'default';
	}

	let runOptions = _cloneDeep(options);
	let isFunction = typeof formatter === 'function';
	let isString = typeof formatter === 'string';
	let defaultFormatter = 'eslint-formatter-pretty';
	let formattersFolder = 'eslint/lib/formatters';
	let formattersList = [
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

	if (runOptions.quite || runOptions.silent) {
		runOptions.showHappyFiles = false;
	}

	return function (file) {
		let callback = arguments[2];
		let breakImmediately = false;
		let eslintData = pluginGetFileData(runOptions, file, callback, breakImmediately);

		if (eslintData === null) {
			return;
		}

		if (isFunction) {
			formatter(eslintData, runOptions);
			callback(null, file);
			return;
		}

		if (isString) {
			let formatterPath = formatter;
			let isDefault = !formatter || formatter === 'default';
			let fromList = !isDefault && formattersList.indexOf(formatter) >= 0;

			if (isDefault) {
				formatterPath = defaultFormatter;
			}

			if (fromList) {
				formatterPath = path.join(formattersFolder, formatter);
			}

			try {
				let formatterModule = require(formatterPath);
				let result = formatterModule(eslintData.results);

				consoleLog(redLog(`SAD FILE > ${file.path}`));
				consoleLog(result);
				callback(null, file);
			} catch (err) {
				callback(pluginError(err));
			}

			return;
		}

		callback(pluginError('Your formatter is not suitable for work'));
		return;
	};
}

function fileOnError(options) {
	let runOptions = _cloneDeep(options);

	return function (file) {
		let callback = arguments[2];
		let eslintData = pluginGetFileData(runOptions, file, callback);

		if (eslintData === null) {
			return;
		}

		if (eslintData.errorCount > 0) {
			let s = ' ';
			let errorMsg = [
				redLog(file.path),
				redLog(`errorCount ${eslintData.errorCount}`),
				redLog('================================='),
				redLog(' ')
			].join(`\n${s + s + s + s}`);

			callback(pluginError(errorMsg));
			return;
		}

		callback(null, file);
		return;
	}

}

function fileAfterErrorsIn (errorsList) {
	return function (file) {
		let callback = arguments[2];
		let eslintData = pluginGetFileData(runOptions, file, callback);
		console.log( eslintData );

		if (eslintData === null) {
			return;
		}

		if (eslintData.errorCount > 0) {
			errorsList._count += eslintData.errorCount;
			errorsList[file.path] = eslintData.errorCount;
		}

		callback(null, file);
	}
}

function fileAfterErrorsOut (errorsList) {
	return function (callback) {
		if (errorsList._count > 0) {
			let count = errorsList._count;
			let length = Object.keys(errorsList).length  - 1;

			consoleLog(`has ${count} err in ${length} files`)
		}
	}
}

// ----------------------------------------
// Public
// ----------------------------------------

/**
 * @param options
 * @returns {DestroyableTransform} through2.obj
 */
function gulpHappiness (options) {
	return through2.obj(fileLinting(options));
}

gulpHappiness.format = function (formatter, options) {
	return through2.obj(fileFormatter(formatter, options));
};

gulpHappiness.failOnError = function (options) {
	return through2.obj(fileOnError(options));
};

gulpHappiness.failAfterErrors = function (options) {
	let errors = {
		_count: 0
	};
	return through2.obj(
		fileAfterErrorsIn(errors),
		fileAfterErrorsOut(errors)
	);
};

// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = gulpHappiness;

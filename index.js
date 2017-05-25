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
 * @param {Object} [options]
 * @see {@link https://github.com/gulpjs/gulp-util#new-pluginerrorpluginname-message-options}
 * @private
 * @sourceCode
 */
function pluginError (sample, options) {
	return new gutil.PluginError(pluginName, sample, options);
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

	return through2.obj(function (file,...args) {
		let cb = args[1];
		let notSupported = notSupportedFile(file, pluginError);

		if (notSupported) {
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

// ----------------------------------------
// Exports
// ----------------------------------------

module.exports = gulpHappiness;

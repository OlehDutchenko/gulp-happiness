'use strict';

/**
 * Testing with `gulp-mocha`
 * @module
 * @author Oleg Dutchenko <dutchenko.o.dev@gmail.com>
 */

// ----------------------------------------
// Imports
// ----------------------------------------

const should = require('should');

// ----------------------------------------
// Tests
// ----------------------------------------

// eslint-disable-next-line
describe('passing all sources', function () {
	// eslint-disable-next-line
	it(`should not fail on lint ./test/fixtures/playground.js`, function () {
		const lintNotFail = require('./results/playground.js');

		should.equal(true, lintNotFail);
	});

	// eslint-disable-next-line
	it(`should not fail on lint and fixing ./test/fixtures/playground-should-be-fixed.js`, function () {
		const lintFixFail = require('./results/playground-should-be-fixed.js');

		should.equal(true, lintFixFail);
	});
});


/**
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 * Author: Marcos Minond
 * 
 */


"use strict";


(function (global) {
	/**
	 * @constructor TestCase
	 * @param mixed exact test result value
	 */
	var TestCase = function (expects) {
		this.expects = expects;
	};

	/**
	 * @name on
	 * @param list of test case parameters
	 */
	TestCase.prototype.on = function () {
		this.parameters = Array.prototype.splice.call(arguments, 0);
	};

	/**
	 * @constructor TestResult
	 * @param bool passed test case
	 * @param mixed test result
	 * @param mixed extected test result
	 * @param array of test case parameters
	 * @param int test case name/number
	 */
	var TestResult = function (pass, actual_grade, expected_grade, parameters, case_name) {
		this.results = {
			pass: !! pass,
			expected: expected_grade,
			actual: actual_grade,
			case_name: test,
			parameters, parameters
		};
	};

	/**
	 * @constructor Test
	 * @param string test name
	 */
	var Test = window.Test = function (test_name) {
		this.test_name = test_name;
	};

	/**
	 * @name test_cases
	 * array of test cases
	 */
	Test.prototype.cases = [];

	/**
	 * @name test_results
	 * array of the test results
	 */
	Test.prototype.retultss = [];

	/**
	 * @name test
	 * @param test function
	 */
	Test.prototype.test = function (test) {
		this.test = test;
	};

	/**
	 * @name expect
	 * @param result value
	 * @return TestCase instance
	 */
	Test.prototype.expect = function (result) {
		this.cases.push(
			new TestCase(result);
		);

		return this.cases[ this.cases.length - 1 ];
	};

	/**
	 * @name run
	 * @return void
	 */
	Test.prototype.run = function () {
		var test, grade, pass;

		// loop through all test cases
		for (var i = 0, max = this.cases.length; i < max; i++) {
			test = this.cases[ i ];
			grade = this.test.apply(window, test.parameters);
			pass = test.expects === grade;

			this.results.push(
				new TestResult(pass, grade, test.expects, test.parameters, i)
			);
		};
	};
})(Test);


var eq_check = new Test;

// the test
eq_check.test(function (a, b) {
	return a === b;
});

// the test cases
eq_check.expect(true).on(1, 1);
eq_check.expect(false).on(1, "1");

// run the tests
eq_check.run();

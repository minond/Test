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
	 * 
	 * creates a new test case setting the expected
	 * test return value and defaulting the test case
	 * function call parameters to an empty array - 
	 * or no parameters.
	 */
	var TestCase = function (expects) {
		this.expects = expects;
		this.parameters = [];
	};

	/**
	 * @name on
	 * @param list of test case parameters
	 * @return void
	 * 
	 * updates the parameter(s) for the test case call.
	 */
	TestCase.prototype.on = function () {
		this.parameters = Array.prototype.splice.call(arguments, 0);
	};

	/**
	 * @constructor Test
	 * @param string test name
	 * 
	 * creates a new Test instance
	 */
	var Test = window.Test = function (test_name) {
		this.test_name = test_name;
		this.cases = [];
		this.results = [];
	};

	/**
	 * @name test
	 * @param test function
	 * @return void
	 * 
	 * set the Test's test function 
	 */
	Test.prototype.test = function (test) {
		this.test = test;
	};

	/**
	 * @name expect
	 * @param result value
	 * @return TestCase instance
	 * 
	 * creates a new test case and returns the new 
	 * test case's instance making updating the 
	 * parameters an option.
	 */
	Test.prototype.expect = function (result) {
		this.cases.push(
			new TestCase(result)
		);

		return this.cases[ this.cases.length - 1 ];
	};

	/**
	 * @name run
	 * @return void
	 * 
	 * loops though all test cases and saves
	 * result data for each of the cases.
	 */
	Test.prototype.run = function (times) {
		var test, grade, pass;

		if (this.results.length) {
			return false;
		}

		if (!times) {
			times = 1;
		}

		// loop through all test cases
		for (var j = 0; j < times; j++) {
			for (var i = 0, max = this.cases.length; i < max; i++) {
				test = this.cases[ i ];
				grade = this.test.apply(window, test.parameters);
				pass = test.expects === grade;

				// and save the test and result data
				this.results.push({
					pass: pass,
					test_case: i,
					actual: grade,
					expected: test.expects,
					parameters: test.parameters
				});
			}
		}
	};

	/**
	 * @name run
	 * @param string test_name
	 * @param function test_function
	 * @param array of test cases
	 * @param int run count
	 * @return Test instance
	 * 
	 * creates a new test and runs it.
	 */
	Test.run = function (test_name, test_function, test_cases, run_times) {
		var test_case, test;
		
		// create the test
		test = new Test(test_name);

		// set the test function
		test.test(test_function);
		
		// set all test cases
		for (var i = 0, max = test_cases.length; i < max; i++) {
			// set the expected return value
			test_case = test.expect(test_cases[i][0]);

			// set the parameters (if any)
			if (test_cases[i].length === 2) {
				test_case.on.apply(test_case, test_cases[i][1]);
			}
		}

		// finally, run the test
		test.run(run_times || 1);

		return test;
	};

	/**
	 * @name output
	 * @param Test
	 * @return bool output success
	 * 
	 * outputs test results to the console.
	 */
	Test.output = function (test) {
		var ctest, out;

		if (!test.results.length) {
			return false;
		}

		console.log("------------------------------------------------------");
		console.log("Test:", test.test_name);

		for (var i = 0, max = test.results.length; i < max; i++) {
			ctest = test.results[i];

			out = (ctest.pass ? console.log : console.warn).bind(console);

			out("Case #" + ctest.test_case, "-", ctest.pass ? "pass" : "fail");

			if (!ctest.pass) {
				out("Actual:", ctest.actual);
				out("Extected:", ctest.expected);
				out("Parameters:", ctest.parameters);
			}
		}

		console.log("------------------------------------------------------");
		console.log("");
		console.log("");

		return true;
	};

	/**
	 * @name value
	 * test short-cut functions
	 */
	Test.value = {
		eq: function (a, b) {
			return a === b;
		},

		ne: function (a, b) {
			return a !== b;
		},

		lt: function (a, b) {
			return a < b;
		},

		gt: function (a, b) {
			return a > b;
		},

		le: function (a, b) {
			return a <= b;
		},

		ge: function (a, b) {
			return a >= b;
		}
	};
})();



var eq_check = new Test("Equality check no. 1");

// the test
eq_check.test(Test.value.eq);

// the test cases
eq_check.expect(true).on(1, 1);
eq_check.expect(false).on(1, "1");

// run the tests
eq_check.run();


var lt_check = Test.run("Less-than check no. 1", Test.value.lt, [
	[true, [1, 10]]
]);

Test.output(eq_check);
Test.output(lt_check);

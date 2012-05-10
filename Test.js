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


(function () {
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
	var Test = window.Test = function (test_name, basic_case_result) {
		this.test_name = test_name;
		this.test = Test.value.eq;
		this.cases = [];
		this.results = [];

		// save this test
		Test.created_tests[ test_name ] = this;

		// default case check
		if (basic_case_result) {
			this.expect(basic_case_result);
		}
	};

	/**
	 * @name test
	 * @param test function
	 * @return void
	 * 
	 * set the Test's test function 
	 */
	Test.prototype.set_test = function (test) {
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

		this.times = times;

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
					case_iteration_count: j,
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
		test.set_test(test_function);
		
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
	 * @name
	 * @return void
	 *
	 * runs all created tests
	 */
	Test.run_all = function () {
		for (var test in Test.created_tests) {
			if (Test.created_tests[ test ] instanceof Test) {
				Test.created_tests[ test ].run();
			}
		}
	};

	/**
	 * @name display
	 * output namespace
	 */
	Test.display = {};

	/**
	 * @name output_failures
	 * @param Test
	 * @return bool output success
	 */
	Test.display.output_failures = function (test) {
		var new_results = [], test_name;

		if (!test) {
			for (var test in Test.created_tests) {
				if (Test.created_tests[ test ] instanceof Test) {
					Test.display.output_failures(Test.created_tests[ test ]);
				}
			}

			return true;
		}

		for (var i = 0, max = test.results.length; i < max; i++) {
			if (!test.results[ i ].pass) {
				new_results.push(test.results[ i ]);
			}
		}

		if (!new_results.length) {
			return false;
		}

		test_name = test.test_name + " (" + new_results.length + "/" + test.results.length + ")";

		return Test.display.output({
			cases: test.cases,
			results: new_results,
			test: test.test,
			test_name: test_name,
			times: test.times
		});
	};

	/**
	 * @name output
	 * @param Test
	 * @return bool output success
	 * 
	 * outputs test results to the console.
	 */
	Test.display.output = function (test) {
		var ctest, out, case_count, case_iteration, case_result;

		if (!test) {
			for (var test in Test.created_tests) {
				if (Test.created_tests[ test ] instanceof Test) {
					Test.display.output(Test.created_tests[ test ]);
				}
			}

			return true;
		}

		if (!test.results.length) {
			return false;
		}

		console.log("------------------------------------------------------");
		console.log("Test:", test.test_name);

		for (var i = 0, max = test.results.length; i < max; i++) {
			ctest = test.results[i];

			out = (ctest.pass ? console.log : console.warn).bind(console);
			case_count = "Case #" + (ctest.test_case + 1);
			case_iteration = test.times > 1 ? "(" + (ctest.case_iteration_count + 1) + ")\t" : "\t";
			case_result = ctest.pass ? "(pass)" : "(fail)";

			out(case_count, case_iteration, case_result);

			if ((!ctest.pass && Test.settings.show_fail_information) || (ctest.pass && Test.settings.show_success_information)) {
				out("Actual:", Test.display.dump(ctest.actual));
				out("Extected:", Test.display.dump(ctest.expected));
				out("Parameters:", Test.display.dump(ctest.parameters));
			}
		}

		console.log("------------------------------------------------------");
		console.log("");
		console.log("");

		return true;
	};

	/**
	 * @name summary_information
	 * @param Test
	 * @return bool output success
	 * 
	 * outputs a summary of the test results.
	 */
	Test.display.summary_information = function (test) {
		var total = 0, success = 0, fail = 0;

		if (!test) {
			for (var test in Test.created_tests) {
				if (Test.created_tests[ test ] instanceof Test) {
					Test.display.summary_information(Test.created_tests[ test ]);
				}
			}

			return true;
		}

		if (!test.results.length) {
			return false;
		}

		total = test.results.length;
		for (var i = 0; i < total; i++) {
			if (test.results[ i ].pass) {
				success++;
			}
			else {
				fail++;
			}
		}

		console.log("\t%d\t\t%d\t\t%d\t\t%s", total, success, fail, test.test_name);
	};

	/**
	 * @name summary_header
	 * @param Test
	 * @return bool output success
	 * 
	 * outputs a summary header
	 */
	Test.display.summary_header = function () {
		console.log("\t%s\t\t%s\t\t%s\t\t%s", "Total", "Success", "Fail", "Test Name");
		console.log("\t-------------------------------------------------------------------------");
	};

	/**
	 * @name summary
	 * @param Test
	 * @return void
	 * 
	 * outputs a summary of the test results
	 * with a table header
	 */
	Test.display.summary = function () {
		this.summary_header();
		this.summary_information();
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

	/**
	 * @name dump
	 * @param obj mixed
	 * @param level int (internal)
	 * @return string
	 * 
	 * parses any variable into a human readable string.
	 */
	Test.display.dump = function (obj, level) {
		var str = "", padding = "", first = true, empty = true;
		var TAB = "  ", NEW_LINE = "\n";

		var padding_for = function (lvl) {
			var padding_str = "";

			for (var i = 0; i < lvl; i++) {
				padding_str += TAB;
			}

			return padding_str;
		};

		if (!level) {
			level = 0;
		}

		padding = padding_for(level);

		if (level > 50) {
			return "-- max --";
		}

		switch (true) {
			case typeof obj === "string":
				str += "\"" + obj + "\"";

				break;
			case typeof obj === "number":
				str += obj;

				break;
			case obj instanceof Function:
				str += "Function";

				break;
			case obj === void 0:
				str += "undefined";

				break;
			case obj === null:
				str += "null";

				break;
			case obj instanceof Date:
			case obj instanceof RegExp:
				str += obj.toString();

				break;
			case obj instanceof Array: 
				str += "[" + NEW_LINE;

				for (var i = 0, max = obj.length; i < max; i++) {
					str += padding_for(level + 1) + Test.display.dump(obj[ i ], level + 1);

					if (i + 1 < max) {
						str += ", " + NEW_LINE;
					}

					empty = false;
				}

				str += NEW_LINE + padding + "]";

				if (empty) {
					str = "[]";
				}

				break;
			case obj instanceof Object:
				str += "{";

				for (var prop in obj) {
					if (!first) {
						str += ",";
					}

					str += NEW_LINE + padding_for(level + 1) + prop + ": " + Test.display.dump(obj[ prop ], level + 1);
					first = false;
					empty = false;
				}

				str += NEW_LINE + padding + "}";

				if (empty) {
					str = "{}";
				}

				break;
			default:
				str += obj.toString();

				break;
		}

		return str;
	};

	/**
	 * @name settings
	 * test and output settings
	 */
	Test.settings = {
		// display additional inforamation about
		// failed cases.
		show_fail_information: true,

		// display additional inforamation about
		// succesfull cases.
		show_success_information: true
	};

	/**
	 * @name created_tests
	 * stores all created tests
	 */
	Test.created_tests = {};

	/**
	 * @name save_all
	 * saves all created tests
	 */
	Test.save_all = function () {};

	/**
	 * @name try_again
	 * refreshes page
	 */
	Test.try_again = function () {
		window.location.reload();
	};
})();

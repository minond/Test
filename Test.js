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
		this.type = TestCase.type.basic;
	};

	/**
	 * @name type
	 * 
	 * types of test cases
	 */
	TestCase.type = {
		basic: 0,
		dynamic: 1
	};

	/**
	 * @name on
	 * @param list of test case parameters
	 * @return void
	 * 
	 * updates the parameter(s) for the test case call
	 * and sets test case type as a basic type.
	 */
	TestCase.prototype.on = function () {
		this.type = TestCase.type.basic;
		this.parameters = Array.prototype.splice.call(arguments, 0);
	};

	/**
	 * @name using
	 * @param funciton method value generating method
	 * @param array args parameters for method
	 * @return void
	 * 
	 * updates the parameter(s) for the test case call
	 * and sets the test case type as a dynamic type.
	 */
	TestCase.prototype.using = function () {
		this.type = TestCase.type.dynamic;
		this.parameters = Array.prototype.splice.call(arguments, 0);
	};

	/**
	 * @constructor Test
	 * @param string test name
	 * 
	 * creates a new Test instance
	 */
	var Test = window.Test = function Test (test_name, basic_case_result) {
		// default test method is an equality check
		this.test = Test.check.eq;
		this.test_name = test_name;
		this.total_time = 0;
		this.cases = [];
		this.results = [];

		// "virtual" methods
		this.on_pass = null;
		this.on_fail = null;

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
	 * @name param
	 * @constructor
	 * @param method function
	 * @param array function arguments
	 * @param object function scope
	 * @return TestParameter instance
	 *
	 * creates a new Dynamic Parameter
	 */
	Test.param = function TestParameter (method, params, scope) {
		this.method = method;
		this.params = params || [];
		this.scope = scope || window;
	};

	/**
	 * @name arg
	 * @return TestParameter instance
	 *
	 * TestParameter short-cut
	 */
	Test.arg = function (method, params, scope) {
		return new Test.param(method, params, scope);
	};

	/**
	 * @name gen_value
	 * @return generated value
	 * 
	 * generates value from a test parameter
	 */
	Test.param.prototype.gen_value = function () {
		return this.method.apply(this.scope, this.params);
	};

	/**
	 * @name reset
	 * @return void
	 *
	 * resets results so that the test can run again
	 */
	Test.prototype.reset = function () {
		this.results = [];
		this.times = null;
	};

	/**
	 * @name run
	 * @return void
	 * 
	 * loops though all test cases and saves
	 * result data for each of the cases.
	 */
	Test.prototype.run = function (times) {
		var test, grade, pass, result, params;
		var start_time = Date.now();

		if (times === false) {
			return delete Test.created_tests[ this.test_name ];
		}

		if (this.results.length) {
			return false;
		}

		if (!times) {
			times = Test.settings.default_times;
		}

		this.times = times;

		// loop through all test cases
		for (var j = 0; j < times; j++) {
			for (var i = 0, max = this.cases.length; i < max; i++) {
				test = this.cases[ i ];
				params = [];

				// according to TestCase type
				switch (test.type) {
					case TestCase.type.basic:
						params = test.parameters;
						grade = this.test.apply(window, params);
						break;

					case TestCase.type.dynamic:
						for (var p = 0; p < test.parameters.length; p++) {
							if (test.parameters[ p ] instanceof Test.param) {
								params.push(test.parameters[ p ].gen_value());
							}
							else {
								params.push(test.parameters[ p ]);
							}
						}

						// params = test.parameters.method.apply(window, test.parameters.args);
						grade = this.test.apply(window, params);
						break;
				}

				pass = test.expects === grade;

				result = {
					pass: pass,
					test_case: i,
					case_iteration_count: j,
					actual: grade,
					expected: test.expects,
					parameters: params
				};

				// pass callbacks
				if (pass) {
					if (this.on_pass && this.on_pass instanceof Function) {
						this.on_pass(result);
					}
					else if (Test.on_pass && Test.on_pass instanceof Function) {
						Test.on_pass(result);
					}
				}

				// fail callbacks
				if (!pass) {
					if (this.on_fail && this.on_fail instanceof Function) {
						this.on_fail(result);
					}
					else if (Test.on_fail && Test.on_fail instanceof Function) {
						Test.on_fail(result);
					}
				}

				// and save the test and result data
				this.results.push(result);
			}
		}

		this.total_time = Date.now() - start_time;
	};

	/**
	 * @name on_pass
	 * @static/virtual
	 * 
	 * if set, called when a test case passes
	 */
	Test.on_pass = null;

	/**
	 * @name on_fail
	 * @static/virtual
	 * 
	 * if set, called when a test case fails
	 */
	Test.on_fail = null;

	/**
	 * @name fail_print
	 * @param string print_title
	 * @return bool on_fail overwritten
	 * 
	 * helper function for setting on_fail callback
	 */
	Test.prototype.fail_print = function () {
		var overwritten = !!this.on_fail;

		this.on_fail = function (data) {
			Test.display.print_r(this.test_name + " (" + Date.now() + ")", data);
		};

		return overwritten;
	};

	Test.fail_print = function () {
		var overwritten = !!Test.on_fail;

		Test.on_fail = function (data) {
			Test.display.print_r("Failed Case (" + Date.now() + ")", data);
		};

		return overwritten;
	};

	/**
	 * @name run
	 * @param string name test's name
	 * @param function method test's test
	 * @return Test instance
	 * 
	 * creates a new test and runs it.
	 */
	Test.run = function (name, method) {
		var test = new Test(name);

		test.set_test(method);
		test.expect(true);

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

		console.log("%d\t\t%d\t\t%d\t\t%s", total, success, fail, test.test_name);
	};

	/**
	 * @name summary_header
	 * @param Test
	 * @return bool output success
	 * 
	 * outputs a summary header
	 */
	Test.display.summary_header = function () {
		console.log("%s\t\t%s\t\t%s\t\t%s", "Total", "Success", "Fail", "Test Name");
		console.log("-------------------------------------------------------------------------");
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
	 * @name check
	 * test short-cut functions
	 */
	Test.check = {
		truthy: function (a) {
			return a === true;
		},

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
		},

		between: function (a, b) {
			return function (c) {
				return Test.check.ge(c, a) && Test.check.le(c, b);
			}
		}
	};

	/**
	 * @name value
	 * test case value geneator helpers
	 */
	Test.value = {
		character: function (len, strong, basic) {
			var ret = { str: "", keys: [] }, code, key, upper, usespecial;
			var special = "0123456789!@#$%^&*()_+-=[]{};':,.<>/?\\\"`~".split("");
			var key_start = 65, key_end = 90;

			for (var i = 0, max = len || 0; i < max; i++) {
				if (strong === false) {
					usespecial = false;
				}
				else {
					usespecial = Test.value.bool();
				}

				if (usespecial) {
					upper = false;
					key = Test.value.one_of.apply(null, special);
					code = key.charCodeAt(0);
				}
				else {
					upper = Test.value.bool();
					code = Test.value.integer(key_start, key_end);
					key = String.fromCharCode(code);

					if (upper) {
						key = key.toUpperCase();
					}
					else {
						key = key.toLowerCase();
					}
				}

				ret.str += key;
				ret.keys.push({
					key: key,
					code: code,
					upper: upper,
					special: usespecial
				});
			}

			return basic ? ret.str : ret;
		},

		one_of: function (list) {
			return arguments[ Math.round( Math.random() * (arguments.length - 1) ) ];
		},

		integer: function (from, to) {
			return parseInt(Test.value.number(from, to));
		},

		bool: function () {
			return !!Math.round(Math.random());
		},

		number: function (from, to) {
			var ret;

			// max only
			if (from && !to) {
				return Math.random() * from;
			}
			// range
			else if (from && to) {
				ret = from + (Math.random() * (1 + to - from));

				if (ret > to) {
					ret = to;
				}

				return ret;
			}
			// no limits
			else {
				return	Math.random() / 
						Math.random() / 
						Math.random() / 
						Math.random();
			}
		}
	};

	// generate short-cuts for all help methods
	for (var test_fn in Test.value) {
		(function (test) {
			Test.arg[ test ] = function () {
				var args = [];
				var params = Array.prototype.slice.call(arguments, 0);

				args.push(Test.value[ test ]);
				args.push(params);

				return Test.arg.apply(Test, args);
			};
		})(test_fn);
	}

	/**
	 * @name dump
	 * @param obj mixed
	 * @param level int (internal)
	 * @return string
	 * 
	 * parses any variable into a human readable string.
	 */
	Test.display.dump = function (obj, level) {
		var str = "", padding = "", first = true, empty = true, temp;
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
				str += "Function (" + (obj.name || "anonymous") + ")";

				break;
			case obj === void 0:
				str += "undefined";

				break;
			case obj === null:
				str += "null";

				break;
			case obj instanceof Node:
			case obj instanceof NodeList:
				str += "Node";

				break;
			case obj === window:
				str += "window";

				break;
			case obj instanceof Date:
			case obj instanceof RegExp:
				str += obj.toString();

				break;
			case obj instanceof Array: 
				var len = "";

				if (obj.length) {
					len = "(length " + obj.length + ") ";
				}

				str += len + "[" + NEW_LINE;

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

					temp = prop;

					if (temp.match(/\s/)) {
						temp = Test.display.dump(temp);
					}

					str += NEW_LINE + padding_for(level + 1) + temp + ": " + Test.display.dump(obj[ prop ], level + 1);
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
	 *
	 * test and output settings
	 */
	Test.settings = {
		// display additional inforamation about
		// failed cases.
		show_fail_information: true,

		// display additional inforamation about
		// succesfull cases.
		show_success_information: true,

		// default number of time each
		// test case is ran
		default_times: 1
	};

	/**
	 * @name created_tests
	 *
	 * stores all created tests
	 */
	Test.created_tests = {};

	/**
	 * @name try_again
	 * @virtual
	 *
	 * called with "Reload" button is clicked
	 */
	Test.try_again = function () {
		window.location.reload();
	};

	/**
	 * @name reset
	 * @virtual
	 * 
	 * called with "Reset" button in clicked
	 */
	Test.reset = function () {
		Test.try_again();
	};
})();

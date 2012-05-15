//// Test tests

var start = 5;
var end = 100;

// parameter value generators
var param_check = new Test("Testing parameter generators");
param_check.set_test(Test.check.between(start, end));
param_check.expect(true).using([Test.value.number, [start, end]]);
param_check.expect(true).using([Test.value.integer, [start, end]]);
param_check.fail_print();
param_check.run(1500);

var eq_check = new Test("Equality check no. 1");

// the test
eq_check.set_test(Test.check.eq);

// the test cases
eq_check.expect(true).on(1, 1); 
eq_check.expect(false).on(1, "1");

// run the tests
eq_check.run();

// var lt_check = Test.run("Less-than check no. 1", Test.check.lt, [
var lt_check = Test.run("Less-than check no. 1", function (a) {
	return Math.random() < a;
}, [
    [true, [.5]]
], 5);

Test.display.output();
Test.display.output_failures();
Test.display.summary();

Test.display.show();
Test.display.reset_in(5);
Test.display.bind_keys();

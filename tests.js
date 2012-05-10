Test.settings.show_fail_information = true;
Test.settings.show_success_information = true;

var eq_check = new Test("Equality check no. 1");

// the test
eq_check.set_test(Test.value.eq);

// the test cases
eq_check.expect(true).on(1, 1); 
eq_check.expect(false).on(1, "1");

// run the tests
eq_check.run();

// var lt_check = Test.run("Less-than check no. 1", Test.value.lt, [
var lt_check = Test.run("Less-than check no. 1", function (a) {
	return Math.random() < a;
}, [
    [true, [.5]]
], 5);

Test.display.output();
Test.display.output_failures();
Test.display.summary();
